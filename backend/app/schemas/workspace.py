from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class WorkspaceBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: str = Field(..., min_length=2, max_length=100)


class WorkspaceCreate(WorkspaceBase):
    organization_id: str


class WorkspaceResponse(WorkspaceBase):
    id: str
    organization_id: str
    created_by: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
