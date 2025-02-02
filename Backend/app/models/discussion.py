from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class CommentModel(BaseModel):
    content: str
    anonymus: bool
    created_at: datetime = Field(default_factory=datetime.now)
    #feel free to comment out if causing bugs (can be added back later)

class PostModel(BaseModel):
    title: str
    content: str
    anonymous: bool
    created_at: datetime = Field(default_factory=datetime.now)
    #feel free to comment out if causing bugs (can be added back later)
    likes : int
    comments : List[CommentModel] = Field(default_factory=list)

