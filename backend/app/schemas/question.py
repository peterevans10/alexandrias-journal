from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from uuid import UUID

class QuestionBase(BaseModel):
    text: str

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(QuestionBase):
    pass

class Question(QuestionBase):
    id: UUID
    author_id: UUID
    recipient_id: UUID
    is_daily_question: bool
    created_at: datetime

    class Config:
        from_attributes = True
