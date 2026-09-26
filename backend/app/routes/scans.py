from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ScanCreate, ScanResponse, ErrorResponse
from app.models import Scan, User
from app.auth import get_current_user

router = APIRouter(prefix="/api/scans", tags=["scans"])

def format_scan_response(scan: Scan) -> dict:
    actions = [a.strip() for a in (scan.suggested_actions or "exchange,donation,pickup").split(",") if a.strip()]
    return {
        "id": scan.id,
        "user_id": scan.user_id,
        "image_data": scan.image_data,
        "item_name": scan.item_name,
        "category": scan.category,
        "subtype": scan.subtype,
        "stream": scan.stream,
        "confidence": scan.confidence,
        "circularity_score": scan.circularity_score,
        "suggested_actions": actions,
        "created_at": scan.created_at,
    }

@router.post("", response_model=ScanResponse, responses={401: {"model": ErrorResponse}})
def create_scan(
    scan_in: ScanCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not scan_in.image_data or not scan_in.image_data.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Image data is required")

    # Set smart defaults if material information was not provided by scanner model
    item_name = scan_in.item_name or "Plastic Bottle (PET Clear)"
    category = scan_in.category or "Plastic"
    subtype = scan_in.subtype or "PET Plastic"
    stream = scan_in.stream or "Dry Recyclable"
    confidence = scan_in.confidence if scan_in.confidence is not None else 94
    circularity_score = scan_in.circularity_score if scan_in.circularity_score is not None else 91
    actions_str = ",".join(scan_in.suggested_actions) if scan_in.suggested_actions else "exchange,donation,pickup"

    new_scan = Scan(
        user_id=current_user.id,
        image_data=scan_in.image_data,
        item_name=item_name,
        category=category,
        subtype=subtype,
        stream=stream,
        confidence=confidence,
        circularity_score=circularity_score,
        suggested_actions=actions_str,
    )

    db.add(new_scan)
    db.commit()
    db.refresh(new_scan)

    return format_scan_response(new_scan)

@router.get("", response_model=List[ScanResponse], responses={401: {"model": ErrorResponse}})
def get_user_scans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scans = db.query(Scan).filter(Scan.user_id == current_user.id).order_by(Scan.created_at.desc()).all()
    return [format_scan_response(s) for s in scans]

@router.get("/{scan_id}", response_model=ScanResponse, responses={401: {"model": ErrorResponse}, 404: {"model": ErrorResponse}})
def get_scan_detail(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == current_user.id).first()
    if not scan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found")
    return format_scan_response(scan)
