from typing import List, Optional
from datetime import date, datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.crud.base import CRUDBase
from app.models.answer import Answer
from app.schemas.answer import AnswerCreate, AnswerUpdate


class CRUDAnswer(CRUDBase[Answer, AnswerCreate, AnswerUpdate]):
    def get_by_question_and_user(
        self, db: Session, *, question_id: str, user_id: str
    ) -> Optional[Answer]:
        """Get an answer for a specific question from a specific user."""
        return db.query(self.model)\
            .filter(
                self.model.question_id == question_id,
                self.model.user_id == user_id
            ).first()

    def get_by_user_and_date(
        self, db: Session, *, user_id: str, date: date
    ) -> Optional[Answer]:
        """Get all answers from a user on a specific date."""
        return db.query(self.model)\
            .filter(
                self.model.user_id == user_id,
                func.date(self.model.created_at) == date
            ).first()


answer = CRUDAnswer(Answer)
