from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)
    role: str = Field(default="Developer", description="Owner, Admin, Developer, Analyst, Viewer")


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="Minimum 8 characters password")


class UserLogin(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = Field(default=False, description="Extend session duration to 30 days")


class UserResponse(UserBase):
    id: str
    is_active: bool
    is_superuser: bool
    is_verified: bool = True
    oauth_provider: str = "local"
    avatar_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class VerifyEmailRequest(BaseModel):
    token: str


class ResendVerificationRequest(BaseModel):
    email: EmailStr


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)


class OAuthLoginRequest(BaseModel):
    provider: str = Field(..., description="google, github, microsoft")
    token: Optional[str] = None
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    remember_me: bool = False


class UserSessionResponse(BaseModel):
    id: str
    device_name: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    last_active_at: datetime
    expires_at: datetime
    is_current: bool = False

    model_config = ConfigDict(from_attributes=True)


class LoginHistoryResponse(BaseModel):
    id: str
    email: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    status: str
    failure_reason: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CreateOrgInviteRequest(BaseModel):
    organization_id: str
    email: EmailStr
    role: str = Field(default="Developer", description="Owner, Admin, Developer, Analyst, Viewer")


class CreateWorkspaceInviteRequest(BaseModel):
    workspace_id: str
    email: EmailStr
    role: str = Field(default="Developer", description="Owner, Admin, Developer, Analyst, Viewer")


class AcceptInviteRequest(BaseModel):
    invite_token: str


class InviteResponse(BaseModel):
    id: str
    email: str
    role: str
    status: str
    expires_at: datetime
    invite_token: str

    model_config = ConfigDict(from_attributes=True)
