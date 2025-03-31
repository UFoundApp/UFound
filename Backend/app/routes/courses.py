from fastapi import APIRouter, HTTPException
from app.models.courses import CourseModel, ReviewModel, OverallRatingModel, ReportDetail
from app.models.user import UserModel
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

class ReviewAuthorUpdateRequest(BaseModel):
    user_id: UUID
    old_username: str
    new_username: str

@router.post("/courses/update-reviews-author")
async def update_course_reviews_author(request_data: ReviewAuthorUpdateRequest):
    # Get all courses
    courses = await CourseModel.find_all().to_list()
    updated_count = 0
    for course in courses:
        updated = False
        # Loop over each review in the course
        for review in course.reviews:
            if review.author == request_data.old_username:
                review.author = request_data.new_username
                updated = True
                updated_count += 1
        if updated:
            await course.save()
    return {"message": f"Updated {updated_count} course reviews."}

@router.delete("/admin/courses/{course_id}/reviews/{index}")
async def delete_course_review(course_id: str, index: int):
    course = await CourseModel.get(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if index < 0 or index >= len(course.reviews):
        raise HTTPException(status_code=404, detail="Review index out of range")

    # Remove the review
    course.reviews.pop(index)

    # Recalculate ratings
    if course.reviews:
        total = len(course.reviews)
        sum_E = sum(r.ratingE for r in course.reviews)
        sum_MD = sum(r.ratingMD for r in course.reviews)
        sum_AD = sum(r.ratingAD for r in course.reviews)

        course.ratings.average_rating_E = round(sum_E / total, 2)
        course.ratings.average_rating_MD = round(sum_MD / total, 2)
        course.ratings.average_rating_AD = round(sum_AD / total, 2)

        course.rating = math.floor((course.ratings.average_rating_E +
                                    course.ratings.average_rating_MD +
                                    course.ratings.average_rating_AD) / 3)
    else:
        # No reviews left
        course.ratings = OverallRatingModel()
        course.rating = 0

    await course.save()
    return {"message": "Course review deleted and ratings updated"}


@router.post("/admin/courses/{course_id}/reviews/{index}/unflag")
async def unflag_course_review(course_id: str, index: int):
    course = await CourseModel.get(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if index < 0 or index >= len(course.reviews):
        raise HTTPException(status_code=404, detail="Review index out of range")

    course.reviews[index].flagged = False
    course.reviews[index].reports = []
    await course.save()
    return {"message": "Course review unflagged"}


@router.get("/admin/flagged/course-reviews")
async def get_flagged_course_reviews():
    courses = await CourseModel.find().to_list()
    flagged = []
    for course in courses:
        for i, review in enumerate(course.reviews):
            if review.flagged:
                flagged.append({
                "course_id": str(course.id),
                "review_index": i,
                "course_title": course.title,
                "content": review.content,
                "author": review.author,
                "created_at": review.created_at,
                "reports": [r.dict() for r in review.reports] if review.reports else []
            })

    return flagged

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

    user = await UserModel.get(report.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not")
    review.reports.append(ReportDetail(user_id=report.user_id, reason=report.reason, user_name=user.username))


    if len(review.reports) >= 1:
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

    # Add the new review
    course.reviews.append(review)

    # Recalculate average ratings based on all reviews
    total = len(course.reviews)
    sum_E = sum(r.ratingE for r in course.reviews)
    sum_MD = sum(r.ratingMD for r in course.reviews)
    sum_AD = sum(r.ratingAD for r in course.reviews)

    course.ratings.average_rating_E = round(sum_E / total, 2)
    course.ratings.average_rating_MD = round(sum_MD / total, 2)
    course.ratings.average_rating_AD = round(sum_AD / total, 2)

    course.rating = math.floor((course.ratings.average_rating_E +
                                course.ratings.average_rating_MD +
                                course.ratings.average_rating_AD) / 3)

    await course.save()
    return review
