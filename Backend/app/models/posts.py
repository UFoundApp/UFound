from beanie import Document
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class CommentModel(Document):
    content: str
    author: str
    created_at: datetime = Field(default_factory=datetime.now)

class PostModel(Document):
    title: str
    content: str
    created_at: datetime = Field(default_factory=datetime.now)
    comments: Optional[List[CommentModel]] = Field(default_factory=list)
    likes: List[UUID] = Field(default_factory=list)  # Store user IDs

