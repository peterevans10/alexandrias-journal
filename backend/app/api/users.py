from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from app import crud
from app.api.deps import get_current_user
from app.db.base import get_db
from app.models.user import User
from app.models.question import Question
from app.models.answer import Answer
from app.schemas.user import User as UserSchema, UserCreate, UserUpdate
from app.schemas.stats import UserStats, UserInteractionStats

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

@router.get("/me/stats", response_model=UserStats)
def get_user_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Get statistics for the current user"""
    # Get questions asked count
    questions_asked = db.query(Question)\
        .filter(Question.author_id == str(current_user.id))\
        .count()

    # Get questions answered count
    questions_answered = db.query(Answer)\
        .filter(Answer.user_id == str(current_user.id))\
        .count()

    # Get top 3 people user asked questions to
    top_asked = db.query(
        Question.recipient_id,
        User.full_name,
        User.email,
        func.count(Question.id).label('count')
    )\
        .join(User, Question.recipient_id == User.id)\
        .filter(Question.author_id == str(current_user.id))\
        .group_by(Question.recipient_id, User.full_name, User.email)\
        .order_by(func.count(Question.id).desc())\
        .limit(3)\
        .all()

    # Get top 3 people who asked questions to user
    top_received = db.query(
        Question.author_id,
        User.full_name,
        User.email,
        func.count(Question.id).label('count')
    )\
        .join(User, Question.author_id == User.id)\
        .filter(Question.recipient_id == str(current_user.id))\
        .group_by(Question.author_id, User.full_name, User.email)\
        .order_by(func.count(Question.id).desc())\
        .limit(3)\
        .all()

    return {
        "questions_asked": questions_asked,
        "questions_answered": questions_answered,
        "top_asked": [
            {
                "user_id": str(user_id),
                "name": full_name or email,
                "count": count
            } for user_id, full_name, email, count in top_asked
        ],
        "top_received": [
            {
                "user_id": str(user_id),
                "name": full_name or email,
                "count": count
            } for user_id, full_name, email, count in top_received
        ]
    }

@router.get("/me", response_model=UserSchema)
def read_user_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Get current user."""
    return current_user
