from typing import List, Optional
from fastapi import Depends, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.exceptions import ForbiddenException, UnauthorizedException
from app.core.security import decode_token
from app.database.session import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/token", auto_error=False)


async def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    if not token:
        return None
    try:
        payload = decode_token(token)
        user_id: str = payload.get("sub")
        if not user_id:
            return None
        repo = UserRepository(db)
        user = await repo.get_by_id(user_id)
        if not user or not user.is_active:
            return None
        return user
    except Exception:
        return None


async def get_current_user(
    user: Optional[User] = Depends(get_current_user_optional)
) -> User:
    if not user:
        raise UnauthorizedException("Authentication required to access this resource.")
    return user


class RequireRole:
    """Dependency for enforcing Role-Based Access Control (RBAC)."""
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User = Depends(get_current_user)) -> User:
        if user.is_superuser:
            return user
        if user.role not in self.allowed_roles:
            raise ForbiddenException(
                f"Role '{user.role}' lacks permission for this action. Allowed: {self.allowed_roles}"
            )
        return user
