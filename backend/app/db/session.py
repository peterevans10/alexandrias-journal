from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# Use connection pooling for better performance
engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    pool_recycle=3600,  # Recycle connections after 1 hour
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a test database engine when needed
def get_test_engine():
    """Create a test database engine with minimal pooling."""
    return create_engine(
        settings.DATABASE_TEST_URL,
        pool_pre_ping=True,
        pool_size=2,
        max_overflow=0,
    )
