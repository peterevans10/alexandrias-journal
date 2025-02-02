from sqlalchemy.orm import Session

from app import crud, schemas
from app.core.config import settings
from app.db import base  # noqa: F401
from app.db.session import engine

def init_db() -> None:
    base.Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    init_db()
