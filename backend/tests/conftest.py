import pytest
from typing import Generator, Dict
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.db.base import Base
from app.db.session import get_test_engine
from app.main import app
from app.api.deps import get_db

# Set testing flag
settings.TESTING = True

# Create test database engine
test_engine = get_test_engine()
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Create test database tables."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)

@pytest.fixture(scope="function")
def db() -> Generator:
    """Get a test database session."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.rollback()
        for table in reversed(Base.metadata.sorted_tables):
            db.execute(table.delete())
        db.commit()
        db.close()

@pytest.fixture(scope="function")
def client(db) -> Generator:
    """Get a test client with database dependency override."""
    def override_get_db():
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def test_user(db) -> Dict[str, str]:
    """Create a test user."""
    from app.crud.crud_user import user as crud_user
    from app.schemas.user import UserCreate

    user_in = UserCreate(
        email="test@example.com",
        password="testpassword123",
        full_name="Test User"
    )
    user = crud_user.create(db, obj_in=user_in)
    return {
        "id": str(user.id),
        "email": user.email,
        "password": "testpassword123",
        "full_name": user.full_name
    }

@pytest.fixture(scope="function")
def test_user2(db) -> Dict[str, str]:
    """Create a test user."""
    from app.crud.crud_user import user as crud_user
    from app.schemas.user import UserCreate

    user_in = UserCreate(
        email="test2@example.com",
        password="testpassword123",
        full_name="Test User 2"
    )
    user = crud_user.create(db, obj_in=user_in)
    return {
        "id": str(user.id),
        "email": user.email,
        "password": "testpassword123",
        "full_name": user.full_name
    }

@pytest.fixture(scope="function")
def test_superuser(db) -> Dict[str, str]:
    """Create a test superuser."""
    from app.crud.crud_user import user as crud_user
    from app.schemas.user import UserCreate

    user_in = UserCreate(
        email="admin@example.com",
        password="admin123",
        full_name="Admin User",
        is_superuser=True
    )
    user = crud_user.create(db, obj_in=user_in)
    return {
        "id": str(user.id),
        "email": user.email,
        "password": "admin123",
        "full_name": user.full_name
    }
