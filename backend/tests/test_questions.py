from typing import Dict
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app import crud
from app.schemas.question import QuestionCreate
from app.crud.crud_question import question

def test_create_question(client: TestClient, test_user: dict, test_user2: dict):
    # Login to get access token
    login_data = {
        "username": test_user["email"],
        "password": test_user["password"]
    }
    response = client.post("/api/auth/token", data=login_data)
    access_token = response.json()["access_token"]

    # Test creating a question
    question_data = {
        "text": "Test question?",
        "recipient_id": test_user2["id"]
    }
    response = client.post(
        "/api/questions/user-question",
        headers={"Authorization": f"Bearer {access_token}"},
        json=question_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["text"] == question_data["text"]
    assert data["recipient_id"] == question_data["recipient_id"]

def test_get_user_questions(
    client: TestClient,
    test_user: dict,
    test_user2: dict,
    db: Session
):
    # Create some test questions
    question1 = question.create(
        db,
        obj_in=QuestionCreate(
            text="Question 1",
            recipient_id=test_user2["id"],
            user_id=test_user["id"]
        )
    )

    # Login to get access token
    login_data = {
        "username": test_user["email"],
        "password": test_user["password"]
    }
    response = client.post("/api/auth/token", data=login_data)
    access_token = response.json()["access_token"]

    # Test getting user's questions
    response = client.get(
        "/api/questions/received",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_question_pagination(
    client: TestClient,
    test_user: dict,
    test_user2: dict,
    db: Session
):
    # Create multiple test questions
    for i in range(15):
        question.create(
            db,
            obj_in=QuestionCreate(
                text=f"Question {i}",
                recipient_id=test_user["id"],
                user_id=test_user2["id"]
            )
        )

    # Login to get access token
    login_data = {
        "username": test_user2["email"],
        "password": test_user2["password"]
    }
    response = client.post("/api/auth/token", data=login_data)
    access_token = response.json()["access_token"]

    # Test pagination
    response = client.get(
        "/api/questions/received?skip=0&limit=10",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 10

    # Test next page
    response = client.get(
        "/api/questions/received?skip=10&limit=10",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 5
