from pydantic import BaseModel, EmailStr
from datetime import datetime
from enum import Enum
from typing import List, Optional

class UserRole(str, Enum):
    citizen = "citizen"
    organization = "organization"
    collector = "collector"
    municipality = "municipality"

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.citizen

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True

class ScanCreate(BaseModel):
    image_data: str
    item_name: Optional[str] = None
    category: Optional[str] = None
    subtype: Optional[str] = None
    stream: Optional[str] = None
    confidence: Optional[int] = None
    circularity_score: Optional[int] = None
    suggested_actions: Optional[List[str]] = None

class ScanResponse(BaseModel):
    id: int
    user_id: int
    image_data: str
    item_name: str
    category: str
    subtype: Optional[str] = None
    stream: Optional[str] = None
    confidence: int
    circularity_score: int
    suggested_actions: List[str]
    created_at: datetime

    class Config:
        from_attributes = True

class ErrorResponse(BaseModel):
    detail: str

