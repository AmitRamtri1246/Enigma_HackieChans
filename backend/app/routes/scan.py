"""Scan analysis endpoint.

Accepts a captured item image (multipart) and returns a typed MaterialAnalysis.

For now this uses a lightweight deterministic heuristic so the product works
end-to-end without an external vision provider. A real Gemini/OpenAI vision
call can be dropped into `analyze_image()` later WITHOUT changing the response
contract or the frontend. Provider API keys must live in backend settings/env,
never in the frontend.
"""

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from app.auth import get_current_user
from app.models import User
from app.schemas import (
    ItemCondition,
    MaterialAnalysis,
    MaterialCategory,
    ScanAction,
)

router = APIRouter(prefix="/api/scan", tags=["scan"])

MAX_IMAGE_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_PREFIX = "image/"


@router.post("/analyze", response_model=MaterialAnalysis)
async def analyze_scan(
    image: UploadFile = File(...),
    communityId: str | None = Form(default=None),
    scanContext: str | None = Form(default=None),
    _user: User = Depends(get_current_user),
) -> MaterialAnalysis:
    # Validate content type.
    if not image.content_type or not image.content_type.startswith(ALLOWED_PREFIX):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Please upload an image file.",
        )

    # Read and bound the payload size.
    contents = await image.read()
    if not contents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded image is empty.",
        )
    if len(contents) > MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image is too large. Please use one under 10 MB.",
        )

    # communityId / scanContext are accepted for forward-compatibility; they can
    # scope the analysis once a real model is connected.
    return analyze_image(contents, filename=image.filename or "", scan_context=scanContext)


def analyze_image(contents: bytes, filename: str, scan_context: str | None) -> MaterialAnalysis:
    """Deterministic placeholder analysis.

    Chooses a plausible profile from the filename hint (the frontend names
    captures `traceiq-scan-*.jpg`, so uploads with descriptive names still work).
    Defaults to the office-chair demo path. Swap this body for a real vision
    model call when available.
    """

    hint = filename.lower()

    if any(k in hint for k in ("bottle", "pet", "plastic")):
        return MaterialAnalysis(
            materialName="Plastic Bottle",
            category=MaterialCategory.plastic,
            condition=ItemCondition.good,
            confidence=0.92,
            circularityScore=88,
            suggestedActions=[ScanAction.recycle, ScanAction.donate, ScanAction.exchange],
            recommendedAction=ScanAction.recycle,
            preparationGuidance=["Rinse and empty", "Remove the cap and label if required locally"],
            estimatedWeightKg=1.0,
            matches=[],
        )

    if any(k in hint for k in ("box", "cardboard")):
        return MaterialAnalysis(
            materialName="Cardboard Boxes",
            category=MaterialCategory.cardboard,
            condition=ItemCondition.good,
            confidence=0.90,
            circularityScore=85,
            suggestedActions=[ScanAction.donate, ScanAction.exchange, ScanAction.recycle],
            recommendedAction=ScanAction.donate,
            preparationGuidance=["Flatten the boxes", "Remove tape and labels"],
            estimatedWeightKg=4.0,
            matches=[],
        )

    if any(k in hint for k in ("phone", "laptop", "electronic")):
        return MaterialAnalysis(
            materialName="Small Electronics",
            category=MaterialCategory.electronics,
            condition=ItemCondition.fair,
            confidence=0.86,
            circularityScore=72,
            suggestedActions=[ScanAction.repair, ScanAction.recycle, ScanAction.sell],
            recommendedAction=ScanAction.repair,
            preparationGuidance=["Back up and wipe personal data", "Include the charger if you have it"],
            estimatedWeightKg=2.0,
            matches=[],
        )

    # Default: the office-chair demo path.
    return MaterialAnalysis(
        materialName="Office Chair",
        category=MaterialCategory.furniture,
        condition=ItemCondition.good,
        confidence=0.94,
        circularityScore=91,
        suggestedActions=[
            ScanAction.sell,
            ScanAction.exchange,
            ScanAction.donate,
            ScanAction.repair,
            ScanAction.recycle,
        ],
        recommendedAction=ScanAction.sell,
        preparationGuidance=["Wipe down the surfaces", "Check the gas lift and wheels", "Remove any loose parts"],
        estimatedWeightKg=8.0,
        matches=[],
    )
