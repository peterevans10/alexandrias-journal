from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from uuid import UUID
from app.schemas.question import Question


class AnswerBase(BaseModel):
    text: str


class AnswerCreate(AnswerBase):
    question_id: Optional[UUID] = None
    user_id: Optional[UUID] = None


class AnswerUpdate(AnswerBase):
    pass


class Answer(AnswerBase):
    id: UUID
    question_id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    question: Question

    class Config:
        orm_mode = True  # Required for Pydantic v1 ORM model conversion
        from_attributes = True  # This will be ignored in v1 but ready for v2
