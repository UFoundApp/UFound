from beanie import Document
from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID, uuid4
from datetime import datetime, timezone

class UserModel(Document):
    id: UUID = Field(default_factory=uuid4)
    username: str = Field(..., min_length=3, max_length=30)
    email: str
    password: str = Field(..., min_length=6)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    comments: List[UUID] = Field(default_factory=list)  # Only store Comment IDs
    bio: Optional[str] = Field(default=None)
    posts: List[str] = Field(default_factory=list)  # Store post IDs, defaults to empty list
    is_uoft: bool = Field(default=False)
    is_admin: bool = Field(default=False)