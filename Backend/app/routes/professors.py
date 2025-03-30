from fastapi import APIRouter, HTTPException, Body
from app.models.professor import ProfessorModel, ProfessorReviewModel
from beanie import PydanticObjectId  # Needed for MongoDB ObjectId
from typing import List, Optional, Union
from app.models.courses import CourseModel
from pydantic import BaseModel
from uuid import UUID
from bson import ObjectId

from app.courseScraper import get_courses_by_professor


router = APIRouter()

# ✅ Fetch detailed professor page
@router.get("/professors/{professor_id}/page")
async def get_professor_page(professor_id: UUID):
    professor = await ProfessorModel.get(professor_id)
    if not professor:
        raise HTTPException(status_code=404, detail="Professor not found")

    # ✅ Correct way: lookup by ObjectId
    current_courses = await CourseModel.find({
        "_id": {"$in": professor.current_courses}
    }).to_list()

    past_courses = await CourseModel.find({
        "_id": {"$in": professor.past_courses}
    }).to_list()

    reviews = await ProfessorReviewModel.find({"professor_id": professor_id}).to_list()

    return {
        "id": professor.id,
        "name": professor.name,
        "department": professor.department,
        "profile_link": professor.profile_link,
        "current_courses": current_courses,
        "past_courses": past_courses,
        "ratings": professor.ratings,
        "reviews": reviews
    }

# ✅ Define a request schema for creating reviews
class ProfessorReviewCreate(BaseModel):
    content: str
    author: str
    overall_rating: float
    strictness: Optional[int] = None
    clarity: Optional[float] = None
    engagement: Optional[float] = None
    course_id: Optional[UUID] = None  # Optional course link

# ✅ Create a new professor
@router.post("/professors", response_model=ProfessorModel)
async def create_professor(professor: ProfessorModel):
    await professor.insert()
    return professor

# ✅ Get all professors
@router.get("/professors")
async def get_professors(page: int = 0, limit: int = 20):
    skip = page * limit
    professors = await ProfessorModel.find_all().skip(skip).limit(limit).to_list()

    return [
        {
            "id": str(prof.id),
            "name": prof.name,
            "department": prof.department,
            "profile_link": prof.profile_link,
            "ratings": prof.ratings,
            "current_courses": [str(cid) for cid in prof.current_courses],
            "past_courses": [str(cid) for cid in prof.past_courses],
            "created_at": prof.created_at,
        }
        for prof in professors
    ]


# ✅ Get a single professor by ID
@router.get("/professors/{professor_id}", response_model=ProfessorModel)
async def get_professor(professor_id: PydanticObjectId):
    professor = await ProfessorModel.get(professor_id)
    if not professor:
        raise HTTPException(status_code=404, detail="Professor not found")
    return professor

# ✅ Get all reviews for a professor
@router.get("/professors/{professor_id}/reviews", response_model=List[ProfessorReviewModel])
async def get_professor_reviews(professor_id: UUID):
    return await ProfessorReviewModel.find(ProfessorReviewModel.professor_id == professor_id).to_list()

# ✅ Add a review for a professor
@router.post("/professors/{professor_id}/reviews", response_model=ProfessorReviewModel)
async def add_professor_review(professor_id: UUID, review: ProfessorReviewCreate):
    # Step 1: Save the review
    review_data = ProfessorReviewModel(professor_id=professor_id, **review.dict())
    await review_data.insert()

    # Step 2: Fetch the professor
    professor = await ProfessorModel.get(professor_id)
    if not professor:
        raise HTTPException(status_code=404, detail="Professor not found")

    # Step 3: Calculate updated ratings
    ratings = professor.ratings
    total = ratings.total_reviews + 1

    def safe(val):  # fallback for optional fields
        return val if val is not None else 0

    ratings.overall = ((ratings.overall * ratings.total_reviews) + review.overall_rating) / total
    ratings.clarity = ((ratings.clarity * ratings.total_reviews) + safe(review.clarity)) / total
    ratings.engagement = ((ratings.engagement * ratings.total_reviews) + safe(review.engagement)) / total
    ratings.strictness = ((ratings.strictness * ratings.total_reviews) + safe(review.strictness)) / total
    ratings.total_reviews = total

    # Step 4: Save professor
    professor.ratings = ratings
    await professor.save()

    return review_data


# Define a request schema for liking a review
class LikeReviewRequest(BaseModel):
    user_id: Union[UUID, str]  # Accept either UUID or string

# Like/unlike a professor review
@router.post("/professors/reviews/{review_id}/like", response_model=ProfessorReviewModel)
async def like_professor_review(review_id: str, like_request: LikeReviewRequest = Body(...)):
    try:
        # Find the review - try both UUID and string ID approaches
        review = None
        try:
            # Try to get by UUID
            review_uuid = UUID(review_id)
            review = await ProfessorReviewModel.get(review_uuid)
        except (ValueError, TypeError):
            # If UUID conversion fails, try to get by string ID
            review = await ProfessorReviewModel.get(review_id)
        
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")
        
        user_id = like_request.user_id
        
        # Convert user_id to string for comparison
        user_id_str = str(user_id)
        
        # Check if user already liked the review (comparing as strings)
        likes_as_strings = [str(like) for like in review.likes]
        if user_id_str in likes_as_strings:
            # Unlike: Remove user from likes
            review.likes = [like for like in review.likes if str(like) != user_id_str]
        else:
            # Like: Add user to likes
            review.likes.append(user_id)
        
        # Save the updated review
        await review.save()
        return review
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing like: {str(e)}")

class LinkCoursesRequest(BaseModel):
    course_codes: List[str]
    current: bool = True

@router.post("/professors/{professor_id}/link-courses")
async def link_courses_to_professor(
        professor_id: UUID,
        body: LinkCoursesRequest
):
    professor = await ProfessorModel.get(professor_id)
    if not professor:
        raise HTTPException(status_code=404, detail="Professor not found")

    # Regex filters on title
    filters = [{"title": {"$regex": f"^{code}", "$options": "i"}} for code in body.course_codes]

    matched_courses = await CourseModel.find({"$or": filters}).to_list()
    matched_codes = {c.title.split(" ")[0] for c in matched_courses}
    matched_ids = [c.id for c in matched_courses]

    if body.current:
        professor.current_courses = list(set(professor.current_courses + matched_ids))
    else:
        professor.past_courses = list(set(professor.past_courses + matched_ids))

    await professor.save()

    # ✅ Also add the professor to each matched course
    for course in matched_courses:
        if professor.id not in course.professors:
            course.professors.append(professor.id)
            await course.save()

    return {
        "linked": [f"{c.title}" for c in matched_courses],
        "skipped": [code for code in body.course_codes if code not in matched_codes]
    }

@router.post("/professors/link-all-courses")
async def link_all_professors_to_courses():
    professors = await ProfessorModel.find_all().to_list()
    results = []

    for prof in professors:
        print(f"Linking for: {prof.name}")
        scraped_courses = get_courses_by_professor(prof.name)
        if not scraped_courses:
            continue

        current_ids = []
        past_ids = []

        for entry in scraped_courses:
            code = entry["code"]
            session = entry["session"]

            course = await CourseModel.find_one({"title": {"$regex": f"^{code}", "$options": "i"}})
            if not course:
                continue

            # Add prof ID to course
            course.professors = list(set(course.professors + [prof.id]))
            await course.save()

            # Link course to professor
            if session == "20251":  # Winter
                current_ids.append(course.id)
            elif session == "20249":  # Fall
                past_ids.append(course.id)

        prof.current_courses = list(set(prof.current_courses + current_ids))
        prof.past_courses = list(set(prof.past_courses + past_ids))
        await prof.save()

        results.append({
            "professor": prof.name,
            "linked_current": len(current_ids),
            "linked_past": len(past_ids)
        })

    return {"summary": sorted(results, key=lambda x: x["professor"].lower())}

@router.delete("/professors/delete_all")
async def delete_all_professors():
    result = await ProfessorModel.delete_all()
    return {"message": f"✅ Deleted {result.deleted_count} professors from the database"}
