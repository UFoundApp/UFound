from fastapi import APIRouter, HTTPException
from app.models.courses import CourseModel, ReviewModel, OverallRatingModel
from app.courseScrape import scrape_all_pages
from beanie import PydanticObjectId
from pydantic import BaseModel
from uuid import UUID
import math 

REPORT_THRESHOLD = 3

router = APIRouter()

class ReportRequest(BaseModel):
    user_id: UUID
    reason: str

@router.post("/courses/reviews/{course_id}/{review_idx}/report")
async def report_course_review(course_id: PydanticObjectId, review_idx: int, report: ReportRequest):
    course = await CourseModel.get(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    try:
        review = course.reviews[review_idx]
    except IndexError:
        raise HTTPException(status_code=404, detail="Review not found")

    if any(r.user_id == report.user_id for r in review.reports):
        raise HTTPException(status_code=400, detail="You have already reported this review")

    review.reports.append(user_id=report.user_id, reason=report.reason)

    if len(review.reports) >= REPORT_THRESHOLD:
        review.flagged = True  # Flag review if threshold met

    await course.save()
    return {"message": "Review reported", "reports": len(review.reports)}


@router.post("/scrape-courses")
async def scrape_courses():
    try:
        await scrape_all_pages()
        return {"message": "Courses scraped and stored successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/courses")
async def get_courses(page: int = 0, limit: int = 20):
    # Calculate skip value based on page and limit
    skip = page * limit
    
    # Use skip and limit for pagination
    courses = await CourseModel.find_all().skip(skip).limit(limit).to_list()
    return courses


@router.get("/courses/{course_id}")
async def get_course(course_id: PydanticObjectId):
    """Fetch a single course by ID, including its reviews"""
    course = await CourseModel.get(course_id)

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    return course


  
@router.post("/courses/{course_id}/review")
async def create_course_review(course_id: PydanticObjectId, review: ReviewModel):
    course = await CourseModel.get(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")   

    #update the ratings for all fields
    course.ratings.average_rating_E = math.floor((course.ratings.average_rating_E + review.ratingE) / 2)
    course.ratings.average_rating_MD = math.floor((course.ratings.average_rating_MD + review.ratingMD) / 2)
    course.ratings.average_rating_AD = math.floor((course.ratings.average_rating_AD + review.ratingAD) / 2)

    # get overal average 

    overall = (course.ratings.average_rating_E + course.ratings.average_rating_MD + course.ratings.average_rating_AD) / 3
    course.rating = math.floor(overall)
    
    # Update the course's reviews array
    course.reviews.append(review)
    await course.save()
    
    return review