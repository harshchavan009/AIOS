from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.dependencies.auth_deps import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.models.organization import Organization, OrganizationMember
from app.schemas.organization import OrganizationCreate, OrganizationResponse, OrganizationMemberResponse
from app.core.exceptions import AIOSException, DuplicateEntityException

router = APIRouter(prefix="/organizations", tags=["Organizations"])


@router.post("", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
async def create_organization(
    org_in: OrganizationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new multi-tenant organization."""
    stmt = select(Organization).where(Organization.slug == org_in.slug)
    result = await db.execute(stmt)
    if result.scalars().first():
        raise DuplicateEntityException("Organization", "slug", org_in.slug)

    new_org = Organization(
        name=org_in.name,
        slug=org_in.slug,
        owner_id=current_user.id,
        plan=org_in.plan
    )
    db.add(new_org)
    await db.flush()

    # Add owner as OrganizationMember
    member = OrganizationMember(
        organization_id=new_org.id,
        user_id=current_user.id,
        role="owner"
    )
    db.add(member)
    await db.commit()
    await db.refresh(new_org)
    return new_org


@router.get("", response_model=List[OrganizationResponse])
async def list_user_organizations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List organizations the authenticated user belongs to."""
    stmt = (
        select(Organization)
        .join(OrganizationMember, Organization.id == OrganizationMember.organization_id)
        .where(OrganizationMember.user_id == current_user.id)
    )
    result = await db.execute(stmt)
    return result.scalars().all()
