from fastapi.testclient import TestClient
import pytest
from sqlalchemy.orm import Session
from uuid import uuid4
from datetime import datetime

from app.models.question import Question as QuestionModel
from app.models.user import User
from app.core.config import settings
from app.main import app

client = TestClient(app)

def test_create_question(db: Session):
    # Create test user
    user_id = str(uuid4())
    user = User(
        id=user_id,
        email="test@example.com",
        hashed_password="dummyhash"
    )
    db.add(user)
    db.commit()

    # Create test question
    question = QuestionModel(
        id=str(uuid4()),
        text="Test question",
        author_id=user_id,
        recipient_id=user_id,
        is_daily_question=True,
        created_at=datetime.utcnow()
    )
    db.add(question)
    db.commit()
    db.refresh(question)

    # Verify question was created
    db_question = db.query(QuestionModel).filter(QuestionModel.id == question.id).first()
    assert db_question is not None
    assert db_question.text == "Test question"
    assert db_question.recipient_id == user_id

def test_get_daily_question(db: Session):
    # Create test user
    user_id = str(uuid4())
    user = User(
        id=user_id,
        email="test2@example.com",
        hashed_password="dummyhash"
    )
    db.add(user)
    db.commit()

    # Create test question
    question = QuestionModel(
        id=str(uuid4()),
        text="Test daily question",
        author_id=user_id,
        recipient_id=user_id,
        is_daily_question=True,
        created_at=datetime.utcnow()
    )
    db.add(question)
    db.commit()

    # Get auth token
    login_data = {
        "username": "test2@example.com",
        "password": "dummyhash"
    }
    response = client.post("/api/auth/login", data=login_data)
    assert response.status_code == 200
    token = response.json()["access_token"]

    # Test getting daily question
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/questions/daily", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["text"] == "Test daily question"
    assert data["recipient_id"] == user_id
