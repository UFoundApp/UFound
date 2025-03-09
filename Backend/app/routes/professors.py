from fastapi import APIRouter, HTTPException, Body
from app.models.professor import ProfessorModel, ProfessorReviewModel
from beanie import PydanticObjectId  # Needed for MongoDB ObjectId
from typing import List, Optional, Union
from app.models.courses import CourseModel
from pydantic import BaseModel
from uuid import UUID

router = APIRouter()

# ✅ Fetch detailed professor page
@router.get("/professors/{professor_id}/page")
async def get_professor_page(professor_id: UUID):
    professor = await ProfessorModel.get(professor_id)
    if not professor:
        raise HTTPException(status_code=404, detail="Professor not found")

    # 🔹 Get courses the professor teaches
    current_courses = await CourseModel.find({"title": {"$in": professor.current_courses}}).to_list()
    past_courses = await CourseModel.find({"title": {"$in": professor.past_courses}}).to_list()

    # 🔹 Get professor reviews
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
@router.get("/professors", response_model=List[ProfessorModel])
async def get_professors(page: int = 0, limit: int = 20):
    # Calculate skip value based on page and limit
    skip = page * limit
    
    # Use skip and limit for pagination
    professors = await ProfessorModel.find_all().skip(skip).limit(limit).to_list()
    return professors

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
    review_data = ProfessorReviewModel(professor_id=professor_id, **review.dict())
    await review_data.insert()
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

@router.delete("/professors/delete_all")
async def delete_all_professors():
    result = await ProfessorModel.delete_all()
    return {"message": f"✅ Deleted {result.deleted_count} professors from the database"}
