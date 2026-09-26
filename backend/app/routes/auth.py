from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.schemas import UserCreate, UserLogin, UserResponse, ErrorResponse
from app.models import User
from app.auth import hash_password, verify_password, create_access_token, get_current_user
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse, responses={409: {"model": ErrorResponse}})
def register(user_in: UserCreate, response: Response, db: Session = Depends(get_db)):
    user_exists = db.query(User).filter(func.lower(User.email) == func.lower(user_in.email)).first()
    if user_exists:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    
    new_user = User(
        full_name=user_in.full_name,
        email=user_in.email,
        password_hash=hash_password(user_in.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(data={"sub": str(new_user.id)})
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=settings.JWT_EXPIRE_MINUTES * 60,
        path="/"
    )
    
    return new_user

@router.post("/login", response_model=UserResponse, responses={401: {"model": ErrorResponse}})
def login(user_in: UserLogin, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(func.lower(User.email) == func.lower(user_in.email)).first()
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        
    access_token = create_access_token(data={"sub": str(user.id)})
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=settings.JWT_EXPIRE_MINUTES * 60,
        path="/"
    )
    
    return user

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    return {"detail": "Successfully logged out"}
