import base64
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Any, Optional, Dict
import bcrypt
from cryptography.fernet import Fernet
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


def _get_fernet_cipher() -> Fernet:
    """Derive a URL-safe 32-byte base64 key for Fernet from API_KEY_ENCRYPTION_KEY or SECRET_KEY."""
    raw_key = settings.API_KEY_ENCRYPTION_KEY or settings.SECRET_KEY
    key_32 = hashlib.sha256(raw_key.encode("utf-8")).digest()
    fernet_key = base64.urlsafe_b64encode(key_32)
    return Fernet(fernet_key)


def encrypt_secret(plaintext: str) -> str:
    """Encrypt a secret string at rest using AES/Fernet encryption."""
    if not plaintext:
        return ""
    cipher = _get_fernet_cipher()
    return cipher.encrypt(plaintext.encode("utf-8")).decode("utf-8")


def decrypt_secret(ciphertext: str) -> str:
    """Decrypt a secret string using AES/Fernet encryption."""
    if not ciphertext:
        return ""
    cipher = _get_fernet_cipher()
    try:
        return cipher.decrypt(ciphertext.encode("utf-8")).decode("utf-8")
    except Exception:
        # Fallback if plaintext was already stored unencrypted
        return ciphertext


def mask_secret(secret: str, visible_suffix_len: int = 4) -> str:
    """Mask all but the last 4 characters of a secret for safe non-leaking display/logging."""
    if not secret:
        return ""
    if len(secret) <= visible_suffix_len:
        return "*" * len(secret)
    return f"{'*' * (len(secret) - visible_suffix_len)}{secret[-visible_suffix_len:]}"

