from beanie import Document
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class CommentModel(Document):
    content: str
    author: str
    created_at: datetime = Field(default_factory=datetime.now)

class PostModel(Document):
    title: str
    content: str
    created_at: datetime = Field(default_factory=datetime.now)
    likes : int = Field(default_factory=0)
    comments: Optional[List[CommentModel]] = Field(default_factory=list)
