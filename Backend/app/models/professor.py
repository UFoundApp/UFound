from beanie import Document
from pydantic import Field, BaseModel
from typing import List, Optional
from datetime import datetime, timezone
from uuid import UUID, uuid4
from bson import ObjectId

class ProfessorRatings(BaseModel):
    overall: float = Field(default=0.0, ge=0, le=5)
    clarity: float = Field(default=0.0, ge=0, le=5)
    engagement: float = Field(default=0.0, ge=0, le=5)
    strictness: float = Field(default=0.0, ge=0, le=5)
    total_reviews: int = Field(default=0, ge=0)

class ProfessorModel(Document):
    id: UUID = Field(default_factory=uuid4)  # Unique professor ID
    name: str = Field(..., min_length=3, max_length=100)
    department: str = Field(..., min_length=3, max_length=100)
    profile_link: Optional[str] = None  # ✅ New field for university webpage link
    current_courses: List[ObjectId] = Field(default_factory=list)
    past_courses: List[ObjectId] = Field(default_factory=list)
    ratings: ProfessorRatings = Field(default_factory=ProfessorRatings)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        collection = "professors"

    class Config:
        arbitrary_types_allowed = True

class ReportDetail(BaseModel):
    user_id: UUID
    user_name: str
    reason: str

class ProfessorReviewModel(Document):
    professor_id: UUID  # Required: Link to ProfessorModel
    course_id: Optional[UUID] = None  # Optional: Link to CourseModel
    content: str  # Review text
    author: str  # Reviewer (Anonymous or User)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    likes: List[UUID] = Field(default_factory=list)  # Upvoted user IDs
    overall_rating: float = Field(..., ge=1, le=5)  # ⭐ 1-5 rating
    strictness: Optional[int] = Field(default=None, ge=1, le=10)  # 1-10
    clarity: Optional[float] = Field(default=None, ge=1, le=10)  # 1-10
    engagement: Optional[float] = Field(default=None, ge=1, le=10)  # 1-10
    reports: List[ReportDetail] = Field(default_factory=list)  # Add reports field
    flagged: bool = Field(default=False)  # stays False until report threshold met

    class Settings:
        collection = "professor_reviews"