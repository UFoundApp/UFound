from fastapi import APIRouter, HTTPException
from app.models.courses import CourseModel, ReviewModel
from app.courseScrape import scrape_all_pages
from beanie import PydanticObjectId
from pydantic import BaseModel


router = APIRouter()

@router.post("/scrape-courses")
async def scrape_courses():
    try:
        await scrape_all_pages()
        return {"message": "Courses scraped and stored successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/courses")
async def get_courses(skip: int = 0, limit: int = 10):

    courses = await CourseModel.find_all().to_list()
    return courses


@router.get("/courses/{course_id}")
async def get_course(course_id: PydanticObjectId):
    """Fetch a single course by ID, including its reviews"""
    course = await CourseModel.get(course_id)
    if not course:
        raise HTTPException
    return course

@router.get("/courses/get_overall_rating/{course_id}")
async def get_overall_rating(course_id: PydanticObjectId):
    course = await CourseModel.get(course_id)
    if not course:
        raise HTTPException
    
    total = 0
    n = 0
    # Calculate the average rating
    for review_id in course.reviews:
        review = await ReviewModel.get(review_id)
        total += review.rating
        n += 1
    
    if total == 0:
        return {"average_rating": 0}
    else:
        return {"average_rating": total / n}

@router.get("/courses/get_post/{review_id}")
async def get_review(review_id: PydanticObjectId):
    review = await ReviewModel.get(review_id)
    if not review:
        raise HTTPException
    return review
    
@router.post("/courses/{course_id}/review")
async def create_course_review(course_id: PydanticObjectId, review: ReviewModel):
    course = await CourseModel.get(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    await review.insert()
    
    # Update the course's reviews array
    course.reviews.append(review.id)
    await course.save()
    
    return review