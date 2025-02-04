from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": subject}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    print(f"Verifying password. Hash length: {len(hashed_password)}")
    try:
        result = pwd_context.verify(plain_password, hashed_password)
        print(f"Password verification result: {result}")
        return result
    except Exception as e:
        print(f"Password verification error: {str(e)}")
        return False

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
