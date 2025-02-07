from typing import List
from pydantic import BaseModel

class UserInteractionStats(BaseModel):
    user_id: str
    name: str
    count: int

class UserStats(BaseModel):
    questions_asked: int
    questions_answered: int
    top_asked: List[UserInteractionStats]
    top_received: List[UserInteractionStats]
