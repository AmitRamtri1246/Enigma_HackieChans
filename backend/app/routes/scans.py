from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database

from app.auth import get_current_user
from app.database import ensure_indexes, get_db
from app.schemas import ErrorResponse, ScanCreate, ScanResponse

router = APIRouter(prefix="/api/scans", tags=["scans"])
MAX_IMAGE_DATA_CHARS = 14 * 1024 * 1024


def format_scan_response(scan: dict) -> dict:
    return {
        "id": str(scan["_id"]),
        "user_id": scan["user_id"],
        "image_data": scan["image_data"],
        "item_name": scan["item_name"],
        "category": scan["category"],
        "subtype": scan.get("subtype"),
        "stream": scan.get("stream"),
        "confidence": scan["confidence"],
        "circularity_score": scan["circularity_score"],
        "suggested_actions": scan["suggested_actions"],
        "created_at": scan["created_at"],
    }


@router.post("", response_model=ScanResponse, responses={401: {"model": ErrorResponse}})
def create_scan(
    scan_in: ScanCreate,
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db),
):
    ensure_indexes(db)
    if not scan_in.image_data.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Image data is required")
    if len(scan_in.image_data) > MAX_IMAGE_DATA_CHARS:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Image data is too large")

    document = {
        "user_id": str(current_user["_id"]),
        "image_data": scan_in.image_data,
        "item_name": scan_in.item_name or "Plastic Bottle (PET Clear)",
        "category": scan_in.category or "Plastic",
        "subtype": scan_in.subtype or "PET Plastic",
        "stream": scan_in.stream or "Dry Recyclable",
        "confidence": scan_in.confidence if scan_in.confidence is not None else 94,
        "circularity_score": scan_in.circularity_score if scan_in.circularity_score is not None else 91,
        "suggested_actions": scan_in.suggested_actions or ["exchange", "donation", "pickup"],
        "created_at": datetime.now(timezone.utc),
    }
    result = db.scans.insert_one(document)
    document["_id"] = result.inserted_id
    return format_scan_response(document)


@router.get("", response_model=list[ScanResponse], responses={401: {"model": ErrorResponse}})
def get_user_scans(current_user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    ensure_indexes(db)
    scans = db.scans.find({"user_id": str(current_user["_id"])}).sort("created_at", -1)
    return [format_scan_response(scan) for scan in scans]


@router.get("/{scan_id}", response_model=ScanResponse, responses={401: {"model": ErrorResponse}, 404: {"model": ErrorResponse}})
def get_scan_detail(
    scan_id: str,
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db),
):
    if not ObjectId.is_valid(scan_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found")
    scan = db.scans.find_one({"_id": ObjectId(scan_id), "user_id": str(current_user["_id"])})
    if not scan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found")
    return format_scan_response(scan)
