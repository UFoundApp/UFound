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
        raise HTTPException(status_code=404, detail="Course not found")
    
    if not course.reviews:
        return {
        "average_rating": 0,
        "rating_distribution": {
            "1_star": 0,
            "2_star": 0,
            "3_star": 0,
            "4_star": 0,
            "5_star": 0
        }
    }

    l = len(course.reviews)

    # Initialize rating count variables
    one = two = three = four = five = 0

    for review in course.reviews:
        if review.rating == 1:
            one += 1
        elif review.rating == 2:
            two += 1
        elif review.rating == 3:
            three += 1
        elif review.rating == 4:
            four += 1
        elif review.rating == 5:
            five += 1

    # Convert counts to percentages
    one = (one / l) * 100 if one != 0 else 0
    two = (two / l) * 100 if two != 0 else 0
    three = (three / l) * 100 if three != 0 else 0
    four = (four / l) * 100 if four != 0 else 0
    five = (five / l) * 100 if five != 0 else 0

    total = sum(review.rating for review in course.reviews)

    # now calculate the percentage of the total rating 
    return {"average_rating": total / l, 
            "rating_distribution": {
                "1_star": one,
                "2_star": two,
                "3_star": three,
                "4_star": four,
                "5_star": five
            }
    }
    
@router.post("/courses/{course_id}/review")
async def create_course_review(course_id: PydanticObjectId, review: ReviewModel):
    course = await CourseModel.get(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")   
    
    # Update the course's reviews array
    course.reviews.append(review)
    await course.save()
    
    return review