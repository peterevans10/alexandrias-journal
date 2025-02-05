from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.answer import Answer as AnswerModel
from app.schemas.answer import Answer, AnswerCreate
from datetime import datetime
from uuid import uuid4

router = APIRouter()

@router.post("/", response_model=Answer)
async def create_answer(
    request: Request,
    *,
    db: Session = Depends(get_db),
    answer_in: AnswerCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create new answer.
    """
    try:
        # Log request details
        print("\n=== Create Answer Debug ===")
        print(f"Request URL: {request.url}")
        print(f"Request method: {request.method}")
        print(f"Request headers:")
        for name, value in request.headers.items():
            print(f"  {name}: {value}")
        
        body = await request.body()
        print(f"Request body: {body.decode()}")
        
        print("\nUser Details:")
        print(f"Current User ID: {current_user.id}")
        print(f"Current User Email: {current_user.email}")
        
        print("\nAnswer Details:")
        print(f"Question ID: {answer_in.question_id}")
        print(f"Answer Text: {answer_in.text}")

        # Create answer
        db_answer = AnswerModel(
            id=str(uuid4()),
            text=answer_in.text,
            question_id=str(answer_in.question_id),
            user_id=str(current_user.id),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(db_answer)
        db.commit()
        db.refresh(db_answer)
        
        print("\nCreated Answer:")
        print(f"ID: {db_answer.id}")
        print(f"Text: {db_answer.text}")
        print(f"Question ID: {db_answer.question_id}")
        print(f"User ID: {db_answer.user_id}")
        
        return db_answer
        
    except Exception as e:
        print(f"\nError in create_answer: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error creating answer: {str(e)}"
        )
