from enum import Enum
from typing import List, Union
from fastapi import Depends, HTTPException, status
from app.models.user import User


class UserRole(str, Enum):
    OWNER = "Owner"
    ADMIN = "Admin"
    DEVELOPER = "Developer"
    ANALYST = "Analyst"
    VIEWER = "Viewer"


# Role hierarchy weights
ROLE_HIERARCHY = {
    UserRole.OWNER: 50,
    UserRole.ADMIN: 40,
    UserRole.DEVELOPER: 30,
    UserRole.ANALYST: 20,
    UserRole.VIEWER: 10,
    "engineer": 30,  # Legacy fallback compatibility
    "admin": 40,     # Legacy fallback compatibility
    "viewer": 10,    # Legacy fallback compatibility
}


def normalize_role(role_str: str) -> str:
    role_map = {
        "engineer": "Developer",
        "admin": "Admin",
        "viewer": "Viewer",
        "owner": "Owner",
        "analyst": "Analyst",
    }
    return role_map.get(role_str.lower(), role_str.capitalize())


def require_role(allowed_roles: Union[List[str], List[UserRole]]):
    """
    FastAPI dependency to enforce Role-Based Access Control (RBAC).
    Usage:
        @router.post("/protected", dependencies=[Depends(require_role(["Admin", "Owner"]))])
    """
    allowed_role_names = [r.value if isinstance(r, UserRole) else r for r in allowed_roles]
    # Normalize comparison list
    normalized_allowed = set(normalize_role(r) for r in allowed_role_names)

    def role_checker(current_user: User = Depends()):
        user_role = normalize_role(current_user.role)
        if current_user.is_superuser:
            return current_user

        if user_role not in normalized_allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{current_user.role}' is not authorized to perform this operation. Required: {list(normalized_allowed)}"
            )
        return current_user

    return role_checker
