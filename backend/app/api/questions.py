from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud
from app.api.deps import get_current_user
from app.db.base import get_db
from app.models.user import User
from app.models.question import Question as QuestionModel
from app.schemas.question import Question, QuestionCreate
from app.schemas.answer import Answer, AnswerCreate
from datetime import datetime, timedelta
import uuid
import random

router = APIRouter()

@router.get("/daily", response_model=Question)
def get_daily_question(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Simple test: Just get any question for the current user with detailed logging
    """
    try:
        print("\n=== Daily Question Debug ===")
        print(f"Current User ID: {current_user.id}")
        print(f"Current User Email: {current_user.email}")

        # Get any question for this user
        question = db.query(QuestionModel)\
            .filter(QuestionModel.recipient_id == str(current_user.id))\
            .first()
        
        if not question:
            print("No questions found for user")
            raise HTTPException(status_code=404, detail="No questions found")
            
        print("\nFound Question:")
        print(f"ID: {question.id}")
        print(f"Text: {question.text}")
        print(f"Author ID: {question.author_id}")
        print(f"Recipient ID: {question.recipient_id}")
        print(f"Is Daily: {question.is_daily_question}")
        print(f"Created At: {question.created_at}")

        print("\nAttempting to convert to schema...")
        schema = Question.from_orm(question)
        print("Successfully converted to schema!")
        print(f"Schema ID: {schema.id}")
        print(f"Schema Author ID: {schema.author_id}")
        print(f"Schema Recipient ID: {schema.recipient_id}")
        
        return schema
        
    except Exception as e:
        print(f"\nError in get_daily_question: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting daily question: {str(e)}"
        )

@router.post("/daily/{question_id}/answer", response_model=Answer)
def answer_daily_question(
    question_id: str,
    *,
    db: Session = Depends(get_db),
    answer_in: AnswerCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """Submit an answer to the daily question."""
    # Verify the question exists and is assigned to the current user
    question = crud.question.get(db, id=question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    if str(question.recipient_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to answer this question")

    # Check if user has already answered a question today
    today = datetime.utcnow().date()
    existing_answer = crud.answer.get_by_user_and_date(
        db, user_id=str(current_user.id), date=today
    )
    if existing_answer:
        raise HTTPException(
            status_code=400,
            detail="You have already answered a question today"
        )

    # Create the answer
    db_answer = Answer(
        id=str(uuid.uuid4()),
        question_id=question_id,
        user_id=str(current_user.id),
        text=answer_in.text,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(db_answer)
    db.commit()
    db.refresh(db_answer)
    return db_answer

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
@router.post("/user-question/{recipient_id}", response_model=Question)
def create_user_question(
    recipient_id: str,
    *,
    db: Session = Depends(get_db),
    question_in: QuestionCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create a new question from one user to another.
    """
    try:
        # Create the question directly in the database using the model
        question_id = str(uuid.uuid4())
        db_question = QuestionModel(
            id=question_id,
            text=question_in.text,
            author_id=str(current_user.id),
            recipient_id=str(recipient_id),
            is_daily_question=False,
            created_at=datetime.utcnow()
        )
        
        db.add(db_question)
        db.commit()
        db.refresh(db_question)
        
        # Manually create the response schema
        return Question(
            id=db_question.id,
            text=db_question.text,
            author_id=db_question.author_id,
            recipient_id=db_question.recipient_id,
            is_daily_question=db_question.is_daily_question,
            created_at=db_question.created_at
        )
        
    except Exception as e:
        print(f"Error creating question: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error creating question: {str(e)}"
        )

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
