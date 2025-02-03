from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class CommentModel(BaseModel):
    content: str
    author = str
    created_at: datetime = Field(default_factory=datetime.now)

class PostModel(BaseModel):
    title: str
    content: str
    created_at: datetime = Field(default_factory=datetime.now)
    likes : int
    anonymous : bool = Field(default=True)
    comments : List[CommentModel] = Field(default_factory=list)

