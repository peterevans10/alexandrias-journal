from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, questions, users
from app.core.config import settings

app = FastAPI(title="Alexandria's Journal API")

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(questions.router, prefix="/api/questions", tags=["questions"])
app.include_router(users.router, prefix="/api/users", tags=["users"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Alexandria's Journal API"}
