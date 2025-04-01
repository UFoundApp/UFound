from fastapi import APIRouter, HTTPException, Body, Request
from app.models.professor import ProfessorModel, ProfessorReviewModel, ReportDetail
from beanie import PydanticObjectId  # Needed for MongoDB ObjectId
from typing import List, Optional, Union
from app.models.courses import CourseModel
from app.models.user import UserModel 
from app.routes.auth import get_current_user
from pydantic import BaseModel
from uuid import UUID
from bson import ObjectId

from app.courseScraper import get_courses_by_professor

from app.models.user import UserModel
from beanie.operators import In

router = APIRouter()
REPORT_THRESHOLD = 3

class ReportRequest(BaseModel):
    user_id: UUID
    reason: str

class ReviewAuthorUpdateRequest(BaseModel):
    user_id: UUID
    old_username: str
    new_username: str

@router.delete("/professors/reviews/{review_id}")
async def delete_professor_review(review_id: str):
    # 1. Fetch the review
    review = await ProfessorReviewModel.get(review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    await review.delete()
    return {"message": "Review deleted successfully"}

@router.post("/professors/update-reviews-author")
async def update_professor_reviews_author(request_data: ReviewAuthorUpdateRequest):
    # Find all professor reviews where the author field matches the old username.
    # (If you had stored a user id in the review, you would filter by that as well.)
    reviews = await ProfessorReviewModel.find(ProfessorReviewModel.author == request_data.old_username).to_list()
    if not reviews:
        return {"message": "No professor reviews found to update."}
    
    for review in reviews:
        review.author = request_data.new_username
        await review.save()
    
    return {"message": "Professor review authors updated successfully."}

@router.delete("/admin/professors/reviews/{review_id}")
async def delete_professor_review(review_id: str):
    review = await ProfessorReviewModel.get(review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    professor = await ProfessorModel.get(review.professor_id)
    if not professor:
        raise HTTPException(status_code=404, detail="Associated professor not found")

    # Delete the review
    await review.delete()

    # Fetch remaining reviews for that professor
    reviews = await ProfessorReviewModel.find({"professor_id": professor.id}).to_list()

    # If reviews remain, recalculate
    if reviews:
        total = len(reviews)

        def safe(val):
            return val if val is not None else 0

        professor.ratings.total_reviews = total
        professor.ratings.overall = round(sum(r.overall_rating for r in reviews) / total, 2)
        professor.ratings.clarity = round(sum(safe(r.clarity) for r in reviews) / total, 2)
        professor.ratings.engagement = round(sum(safe(r.engagement) for r in reviews) / total, 2)
        professor.ratings.strictness = round(sum(safe(r.strictness) for r in reviews) / total, 2)
    else:
        # Reset all ratings if no reviews remain
        professor.ratings.overall = 0.0
        professor.ratings.clarity = 0.0
        professor.ratings.engagement = 0.0
        professor.ratings.strictness = 0.0
        professor.ratings.total_reviews = 0

    await professor.save()
    return {"message": "Professor review deleted and ratings updated"}


@router.post("/admin/professors/reviews/{review_id}/unflag")
async def unflag_professor_review(review_id: str):
    review = await ProfessorReviewModel.get(review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    review.flagged = False
    review.reports = []
    await review.save()
    return {"message": "Professor review unflagged"}


@router.get("/admin/flagged/professor-reviews")
async def get_flagged_professor_reviews():
    # Fetch all professors whose reviews were flagged
    flagged_reviews = await ProfessorReviewModel.find(ProfessorReviewModel.flagged == True).to_list()
    professor_ids = {review.professor_id for review in flagged_reviews}

    professors = await ProfessorModel.find(In(ProfessorModel.id, list(professor_ids))).to_list()
    professor_map = {str(prof.id): prof.name for prof in professors}

    response = []
    for review in flagged_reviews:
        response.append({
            "_id": str(review.id),
            "professor_id": str(review.professor_id),
            "professor_name": professor_map.get(str(review.professor_id), "Unknown"),
            "content": review.content,
            "author": review.author,
            "created_at": review.created_at,
            "reports": [r.dict() for r in review.reports] if review.reports else []
        })

    return response

@router.post("/professors/reviews/{review_id}/report")
async def report_professor_review(review_id: str, report: ReportRequest):
    review = await ProfessorReviewModel.get(review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    if any(r.user_id == report.user_id for r in review.reports):
        raise HTTPException(status_code=400, detail="You have already reported this review")
    user = await UserModel.get(report.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    review.reports.append(ReportDetail(user_id=report.user_id, reason=report.reason, user_name=user.username))

    if len(review.reports) >= 1:
        review.flagged = True   # Flag review if threshold met

    await review.save()
    return {"message": "Review reported", "reports": len(review.reports)}

# Fetch detailed professor page
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
async def add_professor_review(professor_id: UUID, review: ProfessorReviewCreate, request: Request):
    current_user = await get_current_user(request)

    # If current_user is None or doesn't have the `is_uoft` attribute
    if current_user is None:
        raise HTTPException(status_code=401, detail="User is not authenticated") 
           
    if not current_user.is_uoft:
        raise HTTPException(status_code=403, detail="Only UofT-verified users can submit reviews")
   
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
