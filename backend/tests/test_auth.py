import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from jose import JWTError
from app import crud
from app.core.security import create_access_token
from app.schemas.user import UserCreate

def test_user_registration(client: TestClient, db: Session):
    # Test successful registration
    response = client.post(
        "/api/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "newpassword123",
            "full_name": "New User"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert "id" in data
    assert "password" not in data

    # Test duplicate email registration
    response = client.post(
        "/api/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "anotherpassword123",
            "full_name": "Another User"
        }
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"].lower()

    # Test invalid email format
    response = client.post(
        "/api/auth/register",
        json={
            "email": "invalid-email",
            "password": "password123",
            "full_name": "Invalid Email User"
        }
    )
    assert response.status_code == 422

def test_user_login(client: TestClient, test_user: dict):
    # Test successful login
    login_data = {
        "username": test_user["email"],
        "password": test_user["password"]
    }
    response = client.post("/api/auth/token", data=login_data)
    assert response.status_code == 200
    tokens = response.json()
    assert "access_token" in tokens
    assert tokens["token_type"] == "bearer"

    # Test invalid password
    login_data["password"] = "wrongpassword"
    response = client.post("/api/auth/token", data=login_data)
    assert response.status_code == 401
    assert "incorrect email or password" in response.json()["detail"].lower()

    # Test non-existent user
    login_data = {
        "username": "nonexistent@example.com",
        "password": "password123"
    }
    response = client.post("/api/auth/token", data=login_data)
    assert response.status_code == 401

def test_get_current_user(client: TestClient, test_user: dict):
    # Login to get access token
    login_data = {
        "username": test_user["email"],
        "password": test_user["password"]
    }
    response = client.post("/api/auth/token", data=login_data)
    tokens = response.json()
    access_token = tokens["access_token"]

    # Test getting current user with valid token
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert response.status_code == 200
    user_data = response.json()
    assert user_data["email"] == test_user["email"]
    assert "id" in user_data

    # Test with invalid token
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": "Bearer invalid-token"}
    )
    assert response.status_code == 401

    # Test without token
    response = client.get("/api/auth/me")
    assert response.status_code == 401

def test_token_validation(client: TestClient, test_user: dict):
    # Create tokens with different expiration times
    access_token = create_access_token(test_user["email"])
    
    # Test valid token
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert response.status_code == 200

    # Test malformed token
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": "Bearer malformed.token.here"}
    )
    assert response.status_code == 401

    # Test missing token prefix
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": access_token}
    )
    assert response.status_code == 401
