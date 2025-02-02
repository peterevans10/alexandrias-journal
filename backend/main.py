from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import random
from typing import List, Optional
from app.api import auth

app = FastAPI(title="Alexandria's Journal API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app's address
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)

# Models
class Question(BaseModel):
    id: Optional[int] = None
    text: str
    author: str
    recipient_id: Optional[str] = None
    created_at: datetime = datetime.now()

class Answer(BaseModel):
    id: Optional[int] = None
    question_id: int
    text: str
    author: str
    created_at: datetime = datetime.now()

# In-memory storage (replace with database in production)
questions = []
answers = []

# Default questions
DEFAULT_QUESTIONS = [
    "What's your earliest childhood memory?",
    "What was your first job and what did you learn from it?",
    "What historical event had the biggest impact on your life?",
    "What's the best advice your parents ever gave you?",
    "What was your favorite game to play as a child?",
]

@app.get("/")
async def root():
    return {"message": "Welcome to Alexandria's Journal API"}

@app.post("/questions/")
async def create_question(question: Question):
    question.id = len(questions) + 1
    questions.append(question)
    return question

@app.get("/questions/daily/")
async def get_daily_question(user_id: str):
    # First check for questions specifically for this user
    user_questions = [q for q in questions if q.recipient_id == user_id]
    if user_questions:
        return random.choice(user_questions)
    
    # If no user-specific questions, use a default question
    question_text = random.choice(DEFAULT_QUESTIONS)
    return Question(id=0, text=question_text, author="system")

@app.post("/answers/")
async def create_answer(answer: Answer):
    answer.id = len(answers) + 1
    answers.append(answer)
    return answer

@app.get("/answers/{user_id}")
async def get_user_answers(user_id: str):
    user_answers = [a for a in answers if a.author == user_id]
    return user_answers

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
