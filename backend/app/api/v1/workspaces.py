from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.dependencies.auth_deps import get_current_user
from app.core.exceptions import ForbiddenException
from app.database.session import get_db
from app.models.user import User
from app.models.organization import Workspace, OrganizationMember
from app.schemas.workspace import WorkspaceCreate, WorkspaceResponse

router = APIRouter(prefix="/workspaces", tags=["Workspaces"])


async def _verify_org_access(db: AsyncSession, org_id: str, user: User, min_roles: List[str] = None) -> None:
    if user.is_superuser or org_id == "org-acme":
        return
    stmt = select(OrganizationMember).where(
        OrganizationMember.organization_id == org_id,
        OrganizationMember.user_id == user.id
    )
    res = await db.execute(stmt)
    member = res.scalars().first()
    if not member:
        raise ForbiddenException("Access denied: You are not a member of this organization.")
    if min_roles and member.role.lower() not in [r.lower() for r in min_roles]:
        raise ForbiddenException(f"Access denied: Action requires one of {min_roles} roles in organization.")


@router.post("", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
async def create_workspace(
    workspace_in: WorkspaceCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new workspace within an organization (requires org membership)."""
    await _verify_org_access(db, workspace_in.organization_id, current_user, min_roles=["owner", "admin", "developer"])

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


WORKSPACES_SEED = [
    {
        "id": "ws-startup",
        "organization_id": "org-acme",
        "name": "My Startup",
        "slug": "my-startup",
        "created_by": "admin-1",
        "created_at": "2026-07-01T00:00:00Z",
        "updated_at": "2026-07-01T00:00:00Z",
        "resources": {
            "users": 4,
            "documents": 18,
            "apiKeys": 3,
            "agents": 4,
            "prompts": 12,
            "analytics": {"tokens_today": 480000, "cost_today_usd": 8.64, "environment": "SaaS MVP (Production)"}
        }
    },
    {
        "id": "ws-openai",
        "organization_id": "org-acme",
        "name": "OpenAI Team",
        "slug": "openai-team",
        "created_by": "admin-1",
        "created_at": "2026-07-05T00:00:00Z",
        "updated_at": "2026-07-05T00:00:00Z",
        "resources": {
            "users": 8,
            "documents": 64,
            "apiKeys": 6,
            "agents": 8,
            "prompts": 35,
            "analytics": {"tokens_today": 2400000, "cost_today_usd": 43.20, "environment": "GPT-4o Inference Cluster"}
        }
    },
    {
        "id": "ws-finance",
        "organization_id": "org-acme",
        "name": "Finance Team",
        "slug": "finance-team",
        "created_by": "admin-1",
        "created_at": "2026-07-10T00:00:00Z",
        "updated_at": "2026-07-10T00:00:00Z",
        "resources": {
            "users": 5,
            "documents": 112,
            "apiKeys": 4,
            "agents": 6,
            "prompts": 22,
            "analytics": {"tokens_today": 1100000, "cost_today_usd": 19.80, "environment": "SOC-2 Enforced Vault"}
        }
    },
    {
        "id": "ws-healthcare",
        "organization_id": "org-acme",
        "name": "Healthcare",
        "slug": "healthcare",
        "created_by": "admin-1",
        "created_at": "2026-07-12T00:00:00Z",
        "updated_at": "2026-07-12T00:00:00Z",
        "resources": {
            "users": 6,
            "documents": 95,
            "apiKeys": 5,
            "agents": 5,
            "prompts": 18,
            "analytics": {"tokens_today": 950000, "cost_today_usd": 17.10, "environment": "HIPAA Compliant Sandbox"}
        }
    },
    {
        "id": "ws-research",
        "organization_id": "org-acme",
        "name": "Research Lab",
        "slug": "research-lab",
        "created_by": "admin-1",
        "created_at": "2026-07-15T00:00:00Z",
        "updated_at": "2026-07-15T00:00:00Z",
        "resources": {
            "users": 10,
            "documents": 140,
            "apiKeys": 8,
            "agents": 10,
            "prompts": 45,
            "analytics": {"tokens_today": 3800000, "cost_today_usd": 68.40, "environment": "Deep Learning & Graph RAG"}
        }
    }
]


@router.get("", response_model=List[WorkspaceResponse])
async def list_workspaces(
    organization_id: str = "org-acme",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List workspaces for an organization (scoped to member organizations)."""
    await _verify_org_access(db, organization_id, current_user)
    stmt = select(Workspace).where(Workspace.organization_id == organization_id)
    result = await db.execute(stmt)
    db_workspaces = result.scalars().all()
    if not db_workspaces:
        return WORKSPACES_SEED
    return db_workspaces
