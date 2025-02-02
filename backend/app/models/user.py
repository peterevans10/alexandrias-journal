from sqlalchemy import Boolean, Column, String, DateTime
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.db.base_class import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean(), default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    questions_asked = relationship("Question", foreign_keys="[Question.user_id]", back_populates="user")
    questions_received = relationship("Question", foreign_keys="[Question.recipient_id]", back_populates="recipient")
    answers = relationship("Answer", back_populates="user")
