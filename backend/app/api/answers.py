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

@router.get("/me", response_model=List[Answer])
def get_user_answers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """Get all answers for the current user"""
    answers = db.query(AnswerModel)\
        .filter(AnswerModel.user_id == str(current_user.id))\
        .order_by(AnswerModel.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    return answers

@router.get("/me/past", response_model=List[Answer])
def get_my_answers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get all answers for the current user
    """
    try:
        print("\n=== Get My Answers Debug ===")
        print(f"Current User ID: {current_user.id}")

        answers = db.query(AnswerModel)\
            .filter(AnswerModel.user_id == str(current_user.id))\
            .order_by(AnswerModel.created_at.desc())\
            .all()
            
        # Ensure question relationships are loaded
        for answer in answers:
            db.refresh(answer)
            
        print(f"\nFound {len(answers)} answers")
        return [Answer.from_orm(answer) for answer in answers]

    except Exception as e:
        print(f"\nError in get_my_answers: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving answers: {str(e)}"
        )

@router.put("/{answer_id}", response_model=Answer)
async def update_answer(
    request: Request,
    answer_id: str,
    *,
    db: Session = Depends(get_db),
    answer_in: AnswerCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update an existing answer.
    """
    try:
        print("\n=== Update Answer Debug ===")
        print(f"Answer ID: {answer_id}")
        print(f"Current User ID: {current_user.id}")
        print(f"New Answer Text: {answer_in.text}")

        # Get existing answer
        db_answer = db.query(AnswerModel).filter(AnswerModel.id == answer_id).first()
        if not db_answer:
            raise HTTPException(status_code=404, detail="Answer not found")
            
        # Verify ownership
        if str(db_answer.user_id) != str(current_user.id):
            raise HTTPException(status_code=403, detail="Not authorized to edit this answer")

        # Update answer
        db_answer.text = answer_in.text
        db_answer.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(db_answer)
        
        print("\nUpdated Answer:")
        print(f"ID: {db_answer.id}")
        print(f"Text: {db_answer.text}")
        print(f"Updated At: {db_answer.updated_at}")
        
        return db_answer
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"\nError in update_answer: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error updating answer: {str(e)}"
        )
