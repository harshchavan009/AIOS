import secrets
import hashlib
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.dependencies.auth_deps import get_current_user
from app.core.exceptions import ForbiddenException, EntityNotFoundException
from app.database.session import get_db
from app.models.user import User
from app.models.api_key import APIKey
from app.models.organization import OrganizationMember
from app.schemas.api_key import APIKeyCreate, APIKeyResponse

router = APIRouter(prefix="/api-keys", tags=["API Keys"])


async def _verify_api_key_org_access(db: AsyncSession, org_id: str, user: User) -> None:
    """Ensure user is an active Owner or Admin of the target organization."""
    if user.is_superuser:
        return
    stmt = select(OrganizationMember).where(
        OrganizationMember.organization_id == org_id,
        OrganizationMember.user_id == user.id
    )
    res = await db.execute(stmt)
    member = res.scalars().first()
    if not member:
        raise ForbiddenException("Access denied: You are not a member of this organization.")
    if member.role.lower() not in ["owner", "admin"]:
        raise ForbiddenException("Access denied: Generating and managing API keys requires Owner or Admin role.")


@router.post("", response_model=APIKeyResponse, status_code=status.HTTP_201_CREATED)
async def generate_api_key(
    key_in: APIKeyCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate a new programmatic API key for service authentication (Owner/Admin only)."""
    await _verify_api_key_org_access(db, key_in.organization_id, current_user)

    raw_secret = f"aios_{secrets.token_hex(24)}"
    prefix = raw_secret[:12]
    key_hash = hashlib.sha256(raw_secret.encode()).hexdigest()

    api_key = APIKey(
        organization_id=key_in.organization_id,
        name=key_in.name,
        key_hash=key_hash,
        prefix=prefix,
        created_by=current_user.id
    )
    db.add(api_key)
    await db.commit()
    await db.refresh(api_key)

    response = APIKeyResponse.model_validate(api_key)
    response.raw_key = raw_secret
    return response


@router.get("", response_model=List[APIKeyResponse])
async def list_api_keys(
    organization_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List API keys for an organization (scoped to member organization)."""
    await _verify_api_key_org_access(db, organization_id, current_user)

    stmt = select(APIKey).where(APIKey.organization_id == organization_id, APIKey.is_active == True)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.delete("/{key_id}", status_code=status.HTTP_200_OK)
async def revoke_api_key(
    key_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Revoke an active API key."""
    res = await db.execute(select(APIKey).where(APIKey.id == key_id))
    api_key = res.scalars().first()
    if not api_key:
        raise EntityNotFoundException("APIKey", key_id)

    await _verify_api_key_org_access(db, api_key.organization_id, current_user)

    api_key.is_active = False
    await db.commit()
    return {"message": "API Key revoked successfully.", "id": key_id}
