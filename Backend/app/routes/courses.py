from fastapi import APIRouter, HTTPException
from app.models.courses import CourseModel
from app.courseScrape import scrape_all_pages
from beanie import PydanticObjectId


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
        raise HTTPException(status_code=404, detail="Course not found")
    return course