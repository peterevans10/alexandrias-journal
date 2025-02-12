from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app import crud
from app.api.deps import get_current_user, get_db
from app.core import security
from app.core.config import settings
from app.models.user import User
from app.schemas.user import User as UserSchema, UserCreate
from app.schemas.token import Token

router = APIRouter()

@router.post("/token", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """OAuth2 compatible token login, get an access token for future requests."""
    user = crud.user.authenticate(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    elif not crud.user.is_active(user):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user",
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.email, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/register", response_model=UserSchema)
async def register_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
) -> Any:
    """Register a new user."""
    print(f"Registering user with email: {user_in.email}")  # Debug log
    
    # Check if user already exists
    user = crud.user.get_by_email(db, email=user_in.email)
    if user:
        print(f"User already exists: {user_in.email}")  # Debug log
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    try:
        # Create new user
        user = crud.user.create(db, obj_in=user_in)
        print(f"Successfully created user: {user.email}")  # Debug log
        return user
    except Exception as e:
        print(f"Error creating user: {str(e)}")  # Debug log
        raise HTTPException(
            status_code=500,
            detail=f"Error creating user: {str(e)}",
        )

@router.get("/me", response_model=UserSchema)
def read_current_user(
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get current user."""
    return current_user
