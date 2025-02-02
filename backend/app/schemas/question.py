from typing import Optional
from datetime import datetime
from pydantic import BaseModel, UUID4

class QuestionBase(BaseModel):
    text: str
    recipient_id: str
    user_id: Optional[str] = None

class QuestionCreate(QuestionBase):
    user_id: str

class QuestionUpdate(QuestionBase):
    pass

class Question(QuestionBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
