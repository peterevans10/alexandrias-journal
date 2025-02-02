from typing import List, Optional
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.crud.base import CRUDBase
from app.models.question import Question
from app.schemas.question import QuestionCreate, QuestionUpdate

class CRUDQuestion(CRUDBase[Question, QuestionCreate, QuestionUpdate]):
    def get_daily_question(self, db: Session, *, date: date) -> Optional[Question]:
        return db.query(self.model)\
            .filter(func.date(self.model.created_at) == date)\
            .first()

    def get_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[Question]:
        return db.query(self.model)\
            .order_by(self.model.created_at.desc())\
            .offset(skip)\
            .limit(limit)\
            .all()

question = CRUDQuestion(Question)
