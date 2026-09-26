"""MongoDB client and FastAPI database dependency."""

from collections.abc import Generator

from pymongo import MongoClient
from pymongo.database import Database

from app.config import settings

client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=5000)
database: Database = client[settings.MONGODB_DATABASE]


def get_db() -> Generator[Database, None, None]:
    """Yield the shared Mongo database; PyMongo's client is process-safe."""
    yield database


def ensure_indexes(db: Database = database) -> None:
    """Create the small set of indexes required by current API operations."""
    db.users.create_index("email_normalized", unique=True, name="users_email_unique")
    db.scans.create_index([("user_id", 1), ("created_at", -1)], name="scans_user_created")
    db.listings.create_index([("user_id", 1), ("created_at", -1)], name="listings_user_created")
