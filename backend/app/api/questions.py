from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud
from app.api.deps import get_current_user
from app.db.base import get_db
from app.models.user import User
from app.schemas.question import Question, QuestionCreate
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/daily", response_model=Question)
def get_daily_question(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get the daily question. If no question exists for today, create one.
    """
    # Get today's date in UTC
    today = datetime.utcnow().date()
    
    # Try to get today's question
    question = crud.question.get_daily_question(db, date=today)
    
    # If no question exists for today, create one
    if not question:
        # For now, create a simple question. In the future, this could be more sophisticated
        question_in = QuestionCreate(
            text="What was the most interesting thing that happened to you today?",
            created_at=datetime.utcnow()
        )
        question = crud.question.create(db, obj_in=question_in)
    
    return question

@router.get("/", response_model=List[Question])
def get_questions(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Retrieve questions.
    """
    questions = crud.question.get_multi(db, skip=skip, limit=limit)
    return questions

@router.post("/user-question", response_model=Question)
def create_user_question(
    *,
    db: Session = Depends(get_db),
    question_in: QuestionCreate,
    recipient_id: str,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create a new question from one user to another.
    """
    # Verify recipient exists
    recipient = crud.user.get(db, id=recipient_id)
    if not recipient:
        raise HTTPException(
            status_code=404,
            detail="Recipient user not found"
        )
    
    # Create the question with author and recipient information
    question_data = question_in.dict()
    question_data.update({
        "author_id": current_user.id,
        "recipient_id": recipient_id,
        "created_at": datetime.utcnow()
    })
    question = crud.question.create(db, obj_in=QuestionCreate(**question_data))
    return question

@router.get("/received", response_model=List[Question])
def get_received_questions(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Retrieve questions received by the current user.
    """
    questions = crud.question.get_user_received_questions(
        db, 
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )
    return questions

@router.get("/sent", response_model=List[Question])
def get_sent_questions(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Retrieve questions sent by the current user.
    """
    questions = crud.question.get_user_sent_questions(
        db,
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )
    return questions
