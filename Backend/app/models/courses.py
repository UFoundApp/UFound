from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class ReviewModel(BaseModel):
    content: str
    rating: int
    author: str
    rating: int
    created_at: datetime = Field(default_factory=datetime.now)
    likes: List[UUID] = Field(default_factory=list)  # Store user IDs

class CourseModel(Document):
    title: str
    description: str
    prerequisites: str
    exclusions: str  # Fixed naming
    distribution: str  # Fixed typo
    reviews: List[ReviewModel] = Field(default_factory=list)  
    created_at: datetime = Field(default_factory=datetime.now)
    professors: Optional[List[str]] = Field(default_factory=list)  # Placeholder
    ratings: Optional[float] = None
    likes: List[UUID] = Field(default_factory=list)  # Store user IDs
