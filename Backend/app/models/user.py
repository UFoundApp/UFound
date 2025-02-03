from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from uuid import UUID, uuid4
from datetime import datetime
from beanie import Document


class UserModel(Document):
    id: UUID = Field(default_factory=uuid4)  # Generate a unique user ID
    username: str = Field(..., min_length=3, max_length=30)
    email: str  # Ensures a valid email format
    password: str = Field(..., min_length=8)  # Enforce password strength
    confirm_password: str  # Added type annotation