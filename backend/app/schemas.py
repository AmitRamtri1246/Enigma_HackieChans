from pydantic import BaseModel, EmailStr, Field
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
    id: str
    full_name: str
    email: str
    role: UserRole
    created_at: datetime

    model_config = {"from_attributes": True}

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
    id: str
    user_id: str
    image_data: str
    item_name: str
    category: str
    subtype: Optional[str] = None
    stream: Optional[str] = None
    confidence: int
    circularity_score: int
    suggested_actions: List[str]
    created_at: datetime

    model_config = {"from_attributes": True}

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
    sports_equipment = "Sports equipment"
    household_items = "Household items"


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
    subtype: str
    description: str
    stream: str
    category: MaterialCategory
    condition: ItemCondition
    confidence: float = Field(ge=0, le=1)
    circularityScore: int = Field(ge=0, le=100)
    suggestedActions: list[ScanAction]
    recommendedAction: ScanAction | None = None
    recommendationRationale: str
    recommendedUse: str
    alternativeRecommendations: list[str] = Field(default_factory=list)
    preparationGuidance: list[str] = []
    estimatedWeightKg: float = Field(ge=0)
    matches: list[str] = []
    analysisSource: str = "gemini"


# ──────────────────────────── Listings ────────────────────────────────


class ExchangeType(str, Enum):
    sell = "sell"
    exchange = "exchange"
    donation = "donation"
    repair = "repair"
    recycle = "recycle"
    pickup = "pickup"


class ListingStatus(str, Enum):
    draft = "Draft"
    listed = "Listed"
    matched = "Matched"
    accepted = "Accepted"
    in_transit = "In transit"
    completed = "Completed"
    cancelled = "Cancelled"


class ListingCreate(BaseModel):
    title: str
    material: str
    category: MaterialCategory
    description: Optional[str] = None
    condition: ItemCondition
    weight: str
    quantity: Optional[str] = None
    exchange_type: ExchangeType
    area: Optional[str] = None
    image_url: Optional[str] = None
    image_alt: Optional[str] = None
    price: Optional[str] = None
    price_amount: Optional[float] = None
    community_id: Optional[str] = None


class ListingPatch(BaseModel):
    title: Optional[str] = None
    material: Optional[str] = None
    category: Optional[MaterialCategory] = None
    description: Optional[str] = None
    condition: Optional[ItemCondition] = None
    weight: Optional[str] = None
    quantity: Optional[str] = None
    exchange_type: Optional[ExchangeType] = None
    area: Optional[str] = None
    status: Optional[ListingStatus] = None
    match_percent: Optional[int] = Field(default=None, ge=0, le=100)
    image_url: Optional[str] = None
    image_alt: Optional[str] = None
    price: Optional[str] = None
    price_amount: Optional[float] = None
    community_id: Optional[str] = None
    passport_id: Optional[str] = None


class ListingResponse(BaseModel):
    id: str
    user_id: str
    owner: str
    title: str
    material: str
    category: str
    description: str
    condition: str
    weight: str
    quantity: str
    exchange_type: str
    area: str
    status: str
    match_percent: Optional[int] = None
    image_url: Optional[str] = None
    image_alt: Optional[str] = None
    price: Optional[str] = None
    price_amount: Optional[float] = None
    community_id: Optional[str] = None
    passport_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
