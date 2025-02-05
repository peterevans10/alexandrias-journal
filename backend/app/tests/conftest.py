import pytest
from typing import Generator
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient
from app.db.session import SessionLocal
from app.main import app

@pytest.fixture(scope="session")
def db() -> Generator:
    yield SessionLocal()

@pytest.fixture(scope="module")
def client() -> Generator:
    with TestClient(app) as c:
        yield c
