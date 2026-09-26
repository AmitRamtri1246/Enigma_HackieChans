"""
Listings router — /api/listings

Persists citizen material listings (with imageUrl/imageAlt) to MongoDB.
Each listing is owned by the authenticated user.

Endpoints
---------
POST   /api/listings                 — create a new listing
GET    /api/listings                 — list the current user's listings (newest first)
GET    /api/listings/{listing_id}    — get a single listing by ID
PATCH  /api/listings/{listing_id}    — partial update (status, price, etc.)
"""

from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database

from app.auth import get_current_user
from app.database import ensure_indexes, get_db
from app.schemas import (
    ErrorResponse,
    ListingCreate,
    ListingPatch,
    ListingResponse,
)

router = APIRouter(prefix="/api/listings", tags=["listings"])


# ─────────────────────────── helpers ───────────────────────────────────


def _serialize(doc: dict[str, Any]) -> dict[str, Any]:
    """Convert a Mongo listing document to the response shape."""
    return {
        "id": str(doc["_id"]),
        "user_id": doc["user_id"],
        "owner": doc.get("owner", ""),
        "title": doc["title"],
        "material": doc["material"],
        "category": doc["category"],
        "description": doc.get("description", ""),
        "condition": doc["condition"],
        "weight": doc["weight"],
        "quantity": doc.get("quantity", doc["weight"]),
        "exchange_type": doc["exchange_type"],
        "area": doc.get("area", ""),
        "status": doc.get("status", "Listed"),
        "match_percent": doc.get("match_percent"),
        "image_url": doc.get("image_url"),
        "image_alt": doc.get("image_alt"),
        "price": doc.get("price"),
        "price_amount": doc.get("price_amount"),
        "community_id": doc.get("community_id"),
        "passport_id": doc.get("passport_id"),
        "created_at": doc["created_at"],
        "updated_at": doc["updated_at"],
    }


# ─────────────────────────── routes ────────────────────────────────────


@router.post(
    "",
    response_model=ListingResponse,
    status_code=status.HTTP_201_CREATED,
    responses={401: {"model": ErrorResponse}},
)
def create_listing(
    body: ListingCreate,
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db),
):
    ensure_indexes(db)
    now = datetime.now(timezone.utc)
    doc = {
        "user_id": str(current_user["_id"]),
        "owner": current_user.get("full_name", ""),
        "title": body.title.strip(),
        "material": body.material.strip(),
        "category": body.category,
        "description": body.description.strip() if body.description else "",
        "condition": body.condition,
        "weight": body.weight.strip(),
        "quantity": body.quantity.strip() if body.quantity else body.weight.strip(),
        "exchange_type": body.exchange_type,
        "area": body.area.strip() if body.area else "",
        "status": "Listed",
        "match_percent": None,
        "image_url": body.image_url,
        "image_alt": body.image_alt,
        "price": body.price,
        "price_amount": body.price_amount,
        "community_id": body.community_id,
        "passport_id": None,
        "created_at": now,
        "updated_at": now,
    }
    result = db.listings.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize(doc)


@router.get(
    "",
    response_model=list[ListingResponse],
    responses={401: {"model": ErrorResponse}},
)
def get_my_listings(
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db),
):
    ensure_indexes(db)
    cursor = db.listings.find({"user_id": str(current_user["_id"])}).sort("created_at", -1)
    return [_serialize(doc) for doc in cursor]


@router.get(
    "/{listing_id}",
    response_model=ListingResponse,
    responses={
        401: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
    },
)
def get_listing(
    listing_id: str,
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db),
):
    if not ObjectId.is_valid(listing_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    doc = db.listings.find_one(
        {"_id": ObjectId(listing_id), "user_id": str(current_user["_id"])}
    )
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    return _serialize(doc)


@router.patch(
    "/{listing_id}",
    response_model=ListingResponse,
    responses={
        401: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
    },
)
def patch_listing(
    listing_id: str,
    body: ListingPatch,
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db),
):
    if not ObjectId.is_valid(listing_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    oid = ObjectId(listing_id)
    updates = {k: v for k, v in body.model_dump(exclude_unset=True).items() if v is not None or k == "match_percent"}
    if not updates:
        doc = db.listings.find_one({"_id": oid, "user_id": str(current_user["_id"])})
        if not doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
        return _serialize(doc)
    updates["updated_at"] = datetime.now(timezone.utc)
    result = db.listings.find_one_and_update(
        {"_id": oid, "user_id": str(current_user["_id"])},
        {"$set": updates},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    return _serialize(result)
