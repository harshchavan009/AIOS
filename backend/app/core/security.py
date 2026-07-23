import hashlib
from datetime import datetime, timedelta, timezone
from typing import Any, Optional, Dict
import bcrypt
import jwt
from app.core.config import settings
from app.core.exceptions import UnauthorizedException


def _preprocess_password(password: str) -> bytes:
    """
    Pre-hash password using SHA-256 to handle arbitrary password lengths cleanly
    and avoid bcrypt 72-byte truncation issues.
    """
    return hashlib.sha256(password.encode("utf-8")).digest()


def get_password_hash(password: str) -> str:
    """Hash password securely using bcrypt after SHA-256 pre-processing."""
    preprocessed = _preprocess_password(password)
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(preprocessed, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against bcrypt hash."""
    preprocessed = _preprocess_password(plain_password)
    try:
        return bcrypt.checkpw(preprocessed, hashed_password.encode("utf-8"))
    except Exception:
        return False


def create_access_token(subject: Any, expires_delta: Optional[timedelta] = None, claims: Optional[Dict[str, Any]] = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "iat": datetime.now(timezone.utc)
    }
    if claims:
        to_encode.update(claims)
        
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.PyJWTError:
        raise UnauthorizedException("Invalid authentication token or token expired.")
