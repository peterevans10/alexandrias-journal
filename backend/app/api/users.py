from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import crud
from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.user import User as UserSchema

router = APIRouter()

@router.get("/", response_model=List[UserSchema])
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve users.
    """
    users = crud.user.get_multi(db, skip=skip, limit=limit)
    return users
