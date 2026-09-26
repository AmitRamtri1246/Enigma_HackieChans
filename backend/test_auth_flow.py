import sys
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models import User

client = TestClient(app)

def test_full_flow():
    # Clean up test user if exists
    db = SessionLocal()
    db.query(User).filter(User.email == "test@example.com").delete()
    db.commit()
    db.close()

    # 1. Test registration
    print("Testing registration...")
    reg_resp = client.post("/api/auth/register", json={
        "full_name": "Test User",
        "email": "test@example.com",
        "password": "Password123!"
    })
    print("Register status:", reg_resp.status_code)
    print("Register data:", reg_resp.json())
    assert reg_resp.status_code == 200, f"Register failed: {reg_resp.text}"
    user_data = reg_resp.json()
    assert "password_hash" not in user_data
    assert user_data["email"] == "test@example.com"
    assert "access_token" in reg_resp.cookies, "Cookie not set on register"

    # 2. Check DB directly
    db = SessionLocal()
    db_user = db.query(User).filter(User.email == "test@example.com").first()
    assert db_user is not None
    assert db_user.password_hash.startswith("$2"), "Password not bcrypt hashed"
    assert db_user.password_hash != "Password123!"
    print("DB verification passed: password is securely hashed:", db_user.password_hash[:15] + "...")
    db.close()

    # 3. Test duplicate email registration
    print("Testing duplicate email...")
    dup_resp = client.post("/api/auth/register", json={
        "full_name": "Another User",
        "email": "TEST@example.com",
        "password": "Password123!"
    })
    print("Duplicate status:", dup_resp.status_code)
    assert dup_resp.status_code == 409, f"Duplicate didn't return 409: {dup_resp.text}"

    # 4. Test /me with cookie from registration
    print("Testing /me...")
    me_resp = client.get("/api/auth/me", cookies=reg_resp.cookies)
    print("/me status:", me_resp.status_code)
    print("/me data:", me_resp.json())
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "test@example.com"

    # 5. Test logout
    print("Testing logout...")
    logout_resp = client.post("/api/auth/logout", cookies=reg_resp.cookies)
    print("Logout status:", logout_resp.status_code)
    assert logout_resp.status_code == 200

    # 6. Test login with correct credentials
    print("Testing login...")
    login_resp = client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "Password123!"
    })
    print("Login status:", login_resp.status_code)
    print("Login data:", login_resp.json())
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.cookies

    # 8. Test scan creation and database storage
    print("Testing scan creation...")
    scan_resp = client.post("/api/scans", json={
        "image_data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...",
        "item_name": "PET Bottle (Clear Plastic)",
        "category": "Plastic",
        "subtype": "PET Plastic",
        "stream": "Dry Recyclable",
        "confidence": 95,
        "circularity_score": 92,
        "suggested_actions": ["exchange", "donation", "pickup"]
    }, cookies=login_resp.cookies)
    print("Scan status:", scan_resp.status_code)
    print("Scan data:", scan_resp.json())
    assert scan_resp.status_code == 200, f"Scan creation failed: {scan_resp.text}"
    scan_data = scan_resp.json()
    assert scan_data["item_name"] == "PET Bottle (Clear Plastic)"
    assert scan_data["user_id"] == user_data["id"]

    # 9. Test retrieving user's scans
    print("Testing get user scans...")
    scans_list_resp = client.get("/api/scans", cookies=login_resp.cookies)
    print("Get scans status:", scans_list_resp.status_code)
    assert scans_list_resp.status_code == 200
    assert len(scans_list_resp.json()) >= 1
    assert scans_list_resp.json()[0]["id"] == scan_data["id"]

    print("ALL TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_full_flow()
