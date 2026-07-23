from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class APIKeyCreate(BaseModel):
    organization_id: str
    name: str = Field(..., min_length=2, max_length=100)


class APIKeyResponse(BaseModel):
    id: str
    organization_id: str
    name: str
    prefix: str
    is_active: bool
    created_by: str
    created_at: datetime
    raw_key: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
