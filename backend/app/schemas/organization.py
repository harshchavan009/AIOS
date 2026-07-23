from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class OrganizationBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: str = Field(..., min_length=2, max_length=100)
    plan: str = Field(default="enterprise")


class OrganizationCreate(OrganizationBase):
    pass


class OrganizationResponse(OrganizationBase):
    id: str
    owner_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrganizationMemberResponse(BaseModel):
    id: str
    organization_id: str
    user_id: str
    role: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
