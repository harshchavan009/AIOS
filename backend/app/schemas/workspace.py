from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class WorkspaceBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: str = Field(..., min_length=2, max_length=100)


class WorkspaceCreate(WorkspaceBase):
    organization_id: str


class WorkspaceResources(BaseModel):
    users: int = 4
    documents: int = 18
    apiKeys: int = 3
    agents: int = 4
    prompts: int = 12
    analytics: Dict[str, Any] = Field(default_factory=lambda: {"tokens_today": 480000, "cost_today_usd": 8.64})


class WorkspaceResponse(WorkspaceBase):
    id: str
    organization_id: str
    created_by: str
    created_at: datetime
    updated_at: datetime
    resources: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)
