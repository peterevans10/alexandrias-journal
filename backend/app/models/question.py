from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.db.base_class import Base

class Question(Base):
    __tablename__ = "questions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    author_id = Column(String(36), ForeignKey("users.id"))
    recipient_id = Column(String(36), ForeignKey("users.id"))
    text = Column(String)
    is_daily_question = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    author = relationship("User", foreign_keys=[author_id], back_populates="questions_asked")
    recipient = relationship("User", foreign_keys=[recipient_id], back_populates="questions_received")
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")
