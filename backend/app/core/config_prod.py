from app.core.config import Settings as BaseSettings

class ProductionSettings(BaseSettings):
    @property
    def CORS_ORIGINS(self) -> list:
        """Get allowed CORS origins for production."""
        return [
            "https://alexandrias-journal.onrender.com",  # Production frontend
            "http://localhost:3000",  # Keep local development working
        ]

    class Config:
        case_sensitive = True
