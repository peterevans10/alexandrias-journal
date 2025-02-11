import os
from typing import Optional, List
from functools import lru_cache

try:
    # Try Pydantic v2 import
    from pydantic_settings import BaseSettings
    from pydantic import PostgresDsn
except ImportError:
    # Fall back to Pydantic v1 import (for local development)
    from pydantic import BaseSettings, PostgresDsn

class Settings(BaseSettings):
    # Application settings
    PROJECT_NAME: str = "Alexandria's Journal"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/alexandrias_journal"
    )
    DATABASE_TEST_URL: Optional[str] = os.getenv(
        "DATABASE_TEST_URL", "postgresql://postgres:postgres@localhost:5432/alexandrias_journal_test"
    )
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    TESTING: bool = False
    
    # CORS
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # API
    API_V1_STR: str = "/api"

    @property
    def CORS_ORIGINS(self) -> list:
        """Get allowed CORS origins for development."""
        return ["http://localhost:3000"]
    
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        """Get the database URI based on the environment."""
        if self.TESTING:
            return self.DATABASE_TEST_URL or self.DATABASE_URL
        return self.DATABASE_URL

    class Config:
        case_sensitive = True

@lru_cache()
def get_settings():
    """Get settings based on environment."""
    if os.getenv("ENVIRONMENT") == "production":
        try:
            from app.core.config_prod import ProductionSettings
            return ProductionSettings()
        except ImportError:
            pass
    return Settings()

settings = get_settings()
