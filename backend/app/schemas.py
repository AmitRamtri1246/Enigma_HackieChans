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


# ------------------------------ Scanning ------------------------------

class MaterialCategory(str, Enum):
    plastic = "Plastic"
    cardboard = "Cardboard"
    metal = "Metal"
    electronics = "Electronics"
    furniture = "Furniture"
    textile = "Textile"
    glass = "Glass"
    organic = "Organic"


class ItemCondition(str, Enum):
    new = "New"
    good = "Good"
    fair = "Fair"
    for_parts = "For parts"


class ScanAction(str, Enum):
    sell = "sell"
    exchange = "exchange"
    donate = "donate"
    repair = "repair"
    recycle = "recycle"


class MaterialAnalysis(BaseModel):
    """Response contract for POST /scan/analyze.

    Environmental figures (circularity_score, estimated_weight_kg) are
    illustrative estimates, not measured values. Field aliases are camelCase to
    match the frontend `MaterialAnalysis` type without a mapping layer.
    """

    materialName: str
    category: MaterialCategory
    condition: ItemCondition
    confidence: float
    circularityScore: int
    suggestedActions: list[ScanAction]
    recommendedAction: ScanAction | None = None
    preparationGuidance: list[str] = []
    estimatedWeightKg: float
    matches: list[str] = []
