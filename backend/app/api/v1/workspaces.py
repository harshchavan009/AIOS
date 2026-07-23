from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.dependencies.auth_deps import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.models.organization import Workspace
from app.schemas.workspace import WorkspaceCreate, WorkspaceResponse

router = APIRouter(prefix="/workspaces", tags=["Workspaces"])


@router.post("", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
async def create_workspace(
    workspace_in: WorkspaceCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new workspace within an organization."""
    new_ws = Workspace(
        organization_id=workspace_in.organization_id,
        name=workspace_in.name,
        slug=workspace_in.slug,
        created_by=current_user.id
    )
    db.add(new_ws)
    await db.commit()
    await db.refresh(new_ws)
    return new_ws


@router.get("", response_model=List[WorkspaceResponse])
async def list_workspaces(
    organization_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List workspaces for an organization."""
    stmt = select(Workspace).where(Workspace.organization_id == organization_id)
    result = await db.execute(stmt)
    return result.scalars().all()
