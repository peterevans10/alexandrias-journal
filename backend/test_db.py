from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.question import Question as QuestionModel
from app.schemas.question import Question as QuestionSchema
from app.models.user import User
from uuid import uuid4
from datetime import datetime

def test_question_conversion():
    db = SessionLocal()
    try:
        # Create test user
        user_id = str(uuid4())
        user = User(
            id=user_id,
            email="test@example.com",
            hashed_password="dummyhash"
        )
        db.add(user)
        db.commit()
        print(f"Created test user with ID: {user_id}")

        # Create test question
        question_id = str(uuid4())
        db_question = QuestionModel(
            id=question_id,
            text="Test question",
            author_id=user_id,
            recipient_id=user_id,
            is_daily_question=True,
            created_at=datetime.utcnow()
        )
        db.add(db_question)
        db.commit()
        db.refresh(db_question)
        print(f"Created test question with ID: {question_id}")

        # Query the question back
        queried_question = db.query(QuestionModel).filter(QuestionModel.id == question_id).first()
        print("\nQueried Question from DB:")
        print(f"ID: {queried_question.id}")
        print(f"Text: {queried_question.text}")
        print(f"Author ID: {queried_question.author_id}")
        print(f"Recipient ID: {queried_question.recipient_id}")
        print(f"Is Daily: {queried_question.is_daily_question}")
        print(f"Created At: {queried_question.created_at}")

        # Try converting to Pydantic model
        question_schema = QuestionSchema.model_validate(queried_question)
        print("\nConverted to Pydantic Schema:")
        print(f"ID: {question_schema.id}")
        print(f"Text: {question_schema.text}")
        print(f"Author ID: {question_schema.author_id}")
        print(f"Recipient ID: {question_schema.recipient_id}")
        print(f"Is Daily: {question_schema.is_daily_question}")
        print(f"Created At: {question_schema.created_at}")

    except Exception as e:
        print(f"\nError: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    test_question_conversion()
