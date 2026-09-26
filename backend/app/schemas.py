from pydantic import BaseModel, EmailStr
from datetime import datetime
from enum import Enum

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
