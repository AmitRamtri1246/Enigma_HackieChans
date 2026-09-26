"""Mongo document helpers for TraceIQ's current persistence needs."""

from datetime import datetime, timezone
from typing import Any

from bson import ObjectId


def user_document(user: dict[str, Any]) -> dict[str, Any]:
    """Convert an internal Mongo user document to the public API shape."""
    return {
        "id": str(user["_id"]),
        "full_name": user["full_name"],
        "email": user["email"],
        "role": user["role"],
        "created_at": user["created_at"],
    }


def new_user_document(*, full_name: str, email: str, password_hash: str, role: str) -> dict[str, Any]:
    now = datetime.now(timezone.utc)
    return {
        "full_name": full_name,
        "email": email,
        "email_normalized": email.casefold(),
        "password_hash": password_hash,
        "role": role,
        "created_at": now,
        "updated_at": now,
    }


def valid_object_id(value: str) -> ObjectId | None:
    return ObjectId(value) if ObjectId.is_valid(value) else None
