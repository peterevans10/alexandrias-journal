from typing import List, Optional
from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.crud.base import CRUDBase
from app.models.question import Question
from app.schemas.question import QuestionCreate, QuestionUpdate

class CRUDQuestion(CRUDBase[Question, QuestionCreate, QuestionUpdate]):
    def create(self, db: Session, *, obj_in: QuestionCreate) -> Question:
        print(f"Creating question with data: {obj_in.dict()}")
        db_obj = Question(
            text=obj_in.text,
            author_id=obj_in.author_id,
            recipient_id=obj_in.recipient_id,
            is_daily_question=obj_in.is_daily_question,
            created_at=datetime.utcnow()
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

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
