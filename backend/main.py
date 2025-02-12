from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, users, questions, answers
from app.core.config import get_settings
import os

settings = get_settings()
app = FastAPI(title="Alexandria's Journal API")

# Configure CORS based on environment
origins = [
    "http://localhost:3000",  # Local development frontend
    "https://alexandrias-journal.onrender.com",  # Production frontend
]

if os.getenv("ENVIRONMENT") == "development":
    # Add development-specific origins
    origins.append("http://localhost:3000")
elif os.getenv("ENVIRONMENT") == "production":
    # Add production-specific origins
    origins.append("https://alexandrias-journal.onrender.com")
    origins.append("https://alexandrias-journal-api.onrender.com")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(questions.router, prefix="/api/questions", tags=["questions"])
app.include_router(answers.router, prefix="/api/answers", tags=["answers"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
