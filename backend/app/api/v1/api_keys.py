import secrets
import hashlib
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.dependencies.auth_deps import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.models.api_key import APIKey
from app.schemas.api_key import APIKeyCreate, APIKeyResponse

router = APIRouter(prefix="/api-keys", tags=["API Keys"])


@router.post("", response_model=APIKeyResponse, status_code=status.HTTP_201_CREATED)
async def generate_api_key(
    key_in: APIKeyCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate a new programmatic API key for service authentication."""
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
    """List API keys for an organization."""
    stmt = select(APIKey).where(APIKey.organization_id == organization_id, APIKey.is_active == True)
    result = await db.execute(stmt)
    return result.scalars().all()
