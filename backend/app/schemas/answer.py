from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from uuid import UUID


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

    class Config:
        from_attributes = True
