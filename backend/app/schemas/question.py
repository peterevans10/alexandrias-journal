from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from uuid import UUID

class UserBase(BaseModel):
    id: UUID
    email: str
    full_name: Optional[str] = None

    class Config:
        orm_mode = True
        from_attributes = True

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
    author: Optional[UserBase] = None

    class Config:
        orm_mode = True  # Required for Pydantic v1 ORM model conversion
        from_attributes = True  # This will be ignored in v1 but ready for v2
