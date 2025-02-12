"""
Database initialization script.
"""
from app.db.base import Base
from app.db.session import engine

def init_db():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")
