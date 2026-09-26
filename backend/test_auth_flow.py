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

    # 7. Test login with wrong credentials
    print("Testing login with wrong credentials...")
    bad_login_resp = client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "WrongPassword!"
    })
    print("Bad login status:", bad_login_resp.status_code)
    assert bad_login_resp.status_code == 401

    print("ALL TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_full_flow()
