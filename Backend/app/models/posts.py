from beanie import Document
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone
from uuid import UUID, uuid4

class ReportDetail(BaseModel):
    user_id: UUID
    user_name: str
    reason: str

class CommentModel(BaseModel):
    id: UUID = Field(default_factory=uuid4)  # Unique ID for comment
    content: str
    author_id: UUID  # Store user ID only
    author_name: str  # Store username for easy access
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    parent_id: Optional[UUID] = None  # Changed to UUID
    replies: Optional[List["CommentModel"]] = Field(default_factory=list) 
    likes: List[UUID] = Field(default_factory=list)  # ✅ Added likes field
    reports: List[ReportDetail] = Field(default_factory=list)  # ✅ Added reports field
    flagged: bool = Field(default=False)  # stays False until report threshold met

    class Config:
        arbitrary_types_allowed = True

class PostModel(Document):
    title: str
    content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    comments: Optional[List[CommentModel]] = Field(default_factory=list)  # Comments stored here
    likes: List[UUID] = Field(default_factory=list)  # Store user IDs
    author_id: Optional[UUID] = None  # Add author_id field
    views: int = Field(default=0)  # Add views counter
    author: Optional[str] = ""
    reports: List[ReportDetail] = Field(default_factory=list)  # Add reports field
    flagged: bool = Field(default=False)  # stays False until report threshold met

    class Settings:
        collection = "posts"
