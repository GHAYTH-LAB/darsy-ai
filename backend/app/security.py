import os
from datetime import datetime, timedelta, timezone
import jwt
from dotenv import load_dotenv
from pwdlib import PasswordHash
load_dotenv()
password_hash = PasswordHash.recommended()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is missing from .env")
def hash_password(plain_password: str) -> str:
    return password_hash.hash(plain_password)
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_hash.verify(plain_password, hashed_password)
def create_access_token(user_id: int) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {
        "sub": str(user_id),
        "exp": expiration
    }
    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    return token
def verify_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        return payload
    except jwt.InvalidTokenError:
        raise ValueError("Invalid or expired token")
