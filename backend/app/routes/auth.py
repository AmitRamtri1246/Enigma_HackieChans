from fastapi import APIRouter, Depends, HTTPException, Response, status
from pymongo.database import Database
from pymongo.errors import DuplicateKeyError

from app.auth import create_access_token, get_current_user, hash_password, verify_password
from app.config import settings
from app.database import ensure_indexes, get_db
from app.models import new_user_document, user_document
from app.schemas import ErrorResponse, UserCreate, UserLogin, UserResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


def set_auth_cookie(response: Response, user_id: str) -> None:
    response.set_cookie(
        key="access_token",
        value=create_access_token(data={"sub": user_id}),
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=settings.JWT_EXPIRE_MINUTES * 60,
        path="/",
    )


@router.post("/register", response_model=UserResponse, responses={409: {"model": ErrorResponse}})
def register(user_in: UserCreate, response: Response, db: Database = Depends(get_db)):
    ensure_indexes(db)
    document = new_user_document(
        full_name=user_in.full_name,
        email=str(user_in.email),
        password_hash=hash_password(user_in.password),
        role=user_in.role.value,
    )
    try:
        result = db.users.insert_one(document)
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered") from exc

    document["_id"] = result.inserted_id
    set_auth_cookie(response, str(result.inserted_id))
    return user_document(document)


@router.post("/login", response_model=UserResponse, responses={401: {"model": ErrorResponse}})
def login(user_in: UserLogin, response: Response, db: Database = Depends(get_db)):
    email = str(user_in.email)
    user = db.users.find_one({"email_normalized": email.casefold()})
    if not user or not verify_password(user_in.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    set_auth_cookie(response, str(user["_id"]))
    return user_document(user)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return user_document(current_user)


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    return {"detail": "Successfully logged out"}
