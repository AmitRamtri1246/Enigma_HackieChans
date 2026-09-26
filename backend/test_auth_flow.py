"""MongoDB-backed auth and saved-scan smoke test.

Run with `python test_auth_flow.py` from backend after MongoDB is running.
This script creates and removes one uniquely named demo account.
"""

from uuid import uuid4

from bson import ObjectId
from fastapi.testclient import TestClient

from app.database import database, ensure_indexes
from app.main import app

client = TestClient(app)


def test_full_flow() -> None:
    ensure_indexes()
    email = f"traceiq-test-{uuid4().hex}@example.com"
    user_id: str | None = None

    try:
        register = client.post("/api/auth/register", json={
            "full_name": "Test User",
            "email": email,
            "password": "Password123!",
        })
        assert register.status_code == 200, register.text
        user_data = register.json()
        user_id = user_data["id"]
        assert isinstance(user_id, str)
        assert "password_hash" not in user_data
        assert "access_token" in register.cookies
        stored_user = database.users.find_one({"_id": ObjectId(user_id)})
        assert stored_user and stored_user["password_hash"].startswith("$2")

        duplicate = client.post("/api/auth/register", json={
            "full_name": "Duplicate",
            "email": email.upper(),
            "password": "Password123!",
        })
        assert duplicate.status_code == 409

        me = client.get("/api/auth/me", cookies=register.cookies)
        assert me.status_code == 200 and me.json()["id"] == user_id

        login = client.post("/api/auth/login", json={"email": email.upper(), "password": "Password123!"})
        assert login.status_code == 200

        scan = client.post("/api/scans", json={
            "image_data": "data:image/jpeg;base64,ZmFrZQ==",
            "item_name": "PET Bottle",
            "category": "Plastic",
            "suggested_actions": ["exchange", "recycle"],
        }, cookies=login.cookies)
        assert scan.status_code == 200, scan.text
        scan_data = scan.json()
        assert scan_data["user_id"] == user_id

        scans = client.get("/api/scans", cookies=login.cookies)
        assert scans.status_code == 200
        assert any(row["id"] == scan_data["id"] for row in scans.json())

        detail = client.get(f"/api/scans/{scan_data['id']}", cookies=login.cookies)
        assert detail.status_code == 200
        assert detail.json()["id"] == scan_data["id"]

        logout = client.post("/api/auth/logout", cookies=login.cookies)
        assert logout.status_code == 200
    finally:
        stored_user = database.users.find_one({"email_normalized": email.casefold()})
        cleanup_user_id = user_id or (str(stored_user["_id"]) if stored_user else None)
        if cleanup_user_id:
            database.scans.delete_many({"user_id": cleanup_user_id})
            database.users.delete_one({"_id": ObjectId(cleanup_user_id)})


if __name__ == "__main__":
    test_full_flow()
    print("MongoDB auth and scan flow passed.")
