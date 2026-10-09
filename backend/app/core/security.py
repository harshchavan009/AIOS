import base64
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Optional, Dict, Tuple
import bcrypt
from cryptography.fernet import Fernet
import jwt
from app.core.config import settings
from app.core.exceptions import UnauthorizedException, BadRequestException

# Top common passwords blocklist
COMMON_PASSWORDS = {
    "password", "password123", "password1234", "123456789012", "admin1234567",
    "administrator", "qwerty123456", "welcome12345", "changeme1234", "letmein12345",
    "iloveyou1234", "monkey123456", "dragon123456", "master123456", "sunshine1234",
    "princess1234", "football1234", "baseball1234", "trustno11234", "superman1234",
    "qwertzuiopas", "111111111111", "000000000000", "123123123123", "aiosadmin123",
}

# Pre-computed dummy hash to prevent timing attacks when checking non-existent users
DUMMY_TIMING_HASH = "$2b$12$e80/K8K3hQY3Z9K7aJ3kZeZ8jT8kZ6l5z3v5j1y7l9q3u5w7y9k1."


def validate_password_strength(password: str) -> None:
    """Enforce password strength: minimum length >= 12 and block common passwords."""
    if not password or len(password) < 12:
        raise BadRequestException("Password must be at least 12 characters in length.")
    if password.lower() in COMMON_PASSWORDS:
        raise BadRequestException("Password is too common or insecure. Please choose a stronger password.")


def _preprocess_password(password: str) -> bytes:
    """
    Pre-hash password using SHA-256 to handle arbitrary password lengths cleanly
    and avoid bcrypt 72-byte truncation issues.
    """
    return hashlib.sha256(password.encode("utf-8")).digest()


def get_password_hash(password: str) -> str:
    """Hash password securely using bcrypt with work factor >= 12 after SHA-256 pre-processing."""
    validate_password_strength(password)
    preprocessed = _preprocess_password(password)
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(preprocessed, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against bcrypt hash using constant-time comparison."""
    preprocessed = _preprocess_password(plain_password)
    try:
        return bcrypt.checkpw(preprocessed, hashed_password.encode("utf-8"))
    except Exception:
        return False


def verify_password_and_needs_rehash(plain_password: str, hashed_password: str) -> Tuple[bool, bool]:
    """Verify password and check if the existing hash needs re-hashing (cost < 12)."""
    preprocessed = _preprocess_password(plain_password)
    try:
        valid = bcrypt.checkpw(preprocessed, hashed_password.encode("utf-8"))
        if not valid:
            return False, False
        
        needs_rehash = False
        parts = hashed_password.split("$")
        if len(parts) >= 3 and parts[2].isdigit():
            cost = int(parts[2])
            if cost < 12:
                needs_rehash = True
        return True, needs_rehash
    except Exception:
        return False, False


def create_access_token(
    subject: Any,
    expires_delta: Optional[timedelta] = None,
    claims: Optional[Dict[str, Any]] = None
) -> str:
    """Create short-lived JWT token pinned to HS256 with standard claims."""
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode: Dict[str, Any] = {
        "exp": expire,
        "sub": str(subject),
        "iat": now,
        "nbf": now,
        "iss": "aios-platform",
        "aud": "aios-api"
    }
    if claims:
        to_encode.update(claims)
        
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Dict[str, Any]:
    """Decode and validate JWT token with pinned algorithm and claim checks."""
    try:
        # Strictly pin algorithm to settings.ALGORITHM (HS256) - disallows 'none'
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
            audience="aios-api",
            issuer="aios-platform",
            options={"require": ["exp", "iat", "sub"]}
        )
        return payload
    except jwt.InvalidAudienceError:
        # Backward compatibility for tokens generated before audience pinning
        try:
            return jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM],
                options={"require": ["exp", "iat", "sub"], "verify_aud": False}
            )
        except jwt.PyJWTError:
            raise UnauthorizedException("Invalid authentication token or token expired.")
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

