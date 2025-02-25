from beanie import Document
from pydantic import BaseModel, Field
from typing import List
from uuid import UUID, uuid4
from datetime import datetime

class UserModel(Document):
    id: UUID = Field(default_factory=uuid4)
    username: str = Field(..., min_length=3, max_length=30)
    email: str
    password: str = Field(..., min_length=6)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    comments: List[UUID] = Field(default_factory=list)  # Only store Comment IDs
