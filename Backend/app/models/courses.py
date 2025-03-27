from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class OverallRatingModel(BaseModel):
    average_rating_E: float = 0.0
    average_rating_MD: float =  0.0
    average_rating_AD: float =  0.0

class ReportDetail(BaseModel):
    user_id: UUID
    user_name: str
    reason: str

class ReviewModel(BaseModel):
    content: str
    ratingE: int
    ratingMD: int
    ratingAD: int
    author: str
    ratings: OverallRatingModel = Field(default_factory=OverallRatingModel)
    created_at: datetime = Field(default_factory=datetime.now)
    likes: List[UUID] = Field(default_factory=list)  # Store user IDs
    reports: List[ReportDetail] = Field(default_factory=list)  # Add reports field
    flagged: bool = Field(default=False)  # stays False until report threshold met

class CourseModel(Document):
    title: str
    description: str
    prerequisites: str
    exclusions: str  # Fixed naming
    distribution: str  # Fixed typo
    reviews: List[ReviewModel] = Field(default_factory=list)  
    created_at: datetime = Field(default_factory=datetime.now)
    professors: Optional[List[str]] = Field(default_factory=list)  # Placeholder
    rating: float = Field(default=0.0)
    ratings: OverallRatingModel = Field(default_factory=OverallRatingModel)
    likes: List[UUID] = Field(default_factory=list)  # Store user IDs

  
