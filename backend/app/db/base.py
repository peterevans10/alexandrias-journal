from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool
from app.core.config import settings
from app.db.base_class import Base  # noqa
from app.models.user import User  # noqa
from app.models.question import Question  # noqa

# Configure engine based on environment
if settings.ENVIRONMENT == "production":
    # Production settings with SSL and connection pooling
    engine = create_engine(
        str(settings.DATABASE_URL),
        pool_size=5,
        max_overflow=10,
        pool_timeout=30,
        pool_pre_ping=True,
        pool_class=QueuePool,
        connect_args={"sslmode": "require"}
    )
else:
    # Development settings (unchanged)
    engine = create_engine(settings.DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
