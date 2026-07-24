from sqlalchemy import Boolean, Column, String, DateTime
from app.database.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"

    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="Developer", nullable=False)  # Owner, Admin, Developer, Analyst, Viewer
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    
    # Enterprise Auth extensions
    is_verified = Column(Boolean, default=True, nullable=False)
    verification_token = Column(String(255), nullable=True)
    verification_sent_at = Column(DateTime, nullable=True)
    oauth_provider = Column(String(50), default="local", nullable=False)  # local, google, github, microsoft
    oauth_id = Column(String(255), nullable=True)
    avatar_url = Column(String(512), nullable=True)

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"
