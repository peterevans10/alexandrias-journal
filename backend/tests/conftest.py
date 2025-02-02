import pytest
from typing import Dict, Generator
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.engine import Engine
from sqlalchemy_utils import create_database, database_exists, drop_database
from fastapi.testclient import TestClient
from app.db.base import Base
from app.core.config import settings
from app.crud.crud_user import user as crud_user
from app.schemas.user import UserCreate
from app.main import app
from app.api.deps import get_db
import uuid

# SQLite UUID type adapter
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

# Create a SQLite in-memory database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# Create test database and tables
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def db() -> Generator:
    # Create tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="session")
def client(db: Generator) -> Generator:
    def override_get_db():
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c

@pytest.fixture(scope="session")
def test_user(db: Generator) -> Dict[str, str]:
    user_in = UserCreate(
        email="test@example.com",
        password="test_password",
        full_name="Test User"
    )
    user = crud_user.create(db, obj_in=user_in)
    return {
        "id": str(user.id),
        "email": user.email,
        "password": "test_password",
        "full_name": user.full_name
    }

@pytest.fixture(scope="session")
def test_user2(db: Generator) -> Dict[str, str]:
    user_in = UserCreate(
        email="test2@example.com",
        password="test_password2",
        full_name="Test User 2"
    )
    user = crud_user.create(db, obj_in=user_in)
    return {
        "id": str(user.id),
        "email": user.email,
        "password": "test_password2",
        "full_name": user.full_name
    }

@pytest.fixture(scope="session")
def test_superuser(db: Generator) -> Dict[str, str]:
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
