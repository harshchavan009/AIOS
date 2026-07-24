from sqlalchemy import Boolean, Column, String, DateTime, ForeignKey, Text
from datetime import datetime
from app.database.base import Base, TimestampMixin


class UserSession(Base, TimestampMixin):
    """Active user device sessions for multi-device management & token revocation."""
    __tablename__ = "user_sessions"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    refresh_token_hash = Column(String(255), unique=True, index=True, nullable=False)
    device_name = Column(String(255), nullable=False, default="Unknown Device")
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    last_active_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_revoked = Column(Boolean, default=False, nullable=False)


class LoginHistory(Base, TimestampMixin):
    """Audit log of user login attempts."""
    __tablename__ = "login_history"

    user_id = Column(String(36), nullable=True, index=True)
    email = Column(String(255), nullable=False, index=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    status = Column(String(50), nullable=False)  # success, failed_password, unverified, blocked
    failure_reason = Column(String(255), nullable=True)


class OrganizationInvite(Base, TimestampMixin):
    """Organization invitation tokens."""
    __tablename__ = "organization_invites"

    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    inviter_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    role = Column(String(50), default="Developer", nullable=False)  # Owner, Admin, Developer, Analyst, Viewer
    invite_token = Column(String(255), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    status = Column(String(50), default="pending", nullable=False)  # pending, accepted, rejected, expired


class WorkspaceInvite(Base, TimestampMixin):
    """Workspace invitation tokens."""
    __tablename__ = "workspace_invites"

    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    inviter_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    role = Column(String(50), default="Developer", nullable=False)  # Owner, Admin, Developer, Analyst, Viewer
    invite_token = Column(String(255), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    status = Column(String(50), default="pending", nullable=False)  # pending, accepted, rejected, expired
