import json
import os
from typing import List, Optional, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "AIOS - Enterprise Multi-Agent AI Platform"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = Field(default="development", description="development, testing, production")
    DEBUG: bool = False
    API_V1_STR: str = "/api/v1"

    # Server Binding (Render dynamic $PORT support)
    PORT: int = Field(default=8000, description="Server port")
    HOST: str = Field(default="0.0.0.0", description="Server host")

    # Security
    SECRET_KEY: str = Field(
        default="aios_super_secret_enterprise_production_key_change_in_prod",
        description="JWT Secret key"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Database (PostgreSQL or SQLite fallback for dev)
    DATABASE_URL: str = Field(
        default="sqlite+aiosqlite:///./aios_dev.db",
        description="Async Database connection URI"
    )

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: str) -> str:
        if isinstance(v, str):
            # Render PostgreSQL and standard providers supply postgres:// or postgresql://
            # asyncpg requires postgresql+asyncpg://
            if v.startswith("postgres://"):
                return v.replace("postgres://", "postgresql+asyncpg://", 1)
            elif v.startswith("postgresql://") and "+asyncpg" not in v:
                return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v

    # Redis Cache & Celery Broker
    REDIS_URL: str = Field(
        default="redis://localhost:6379/0",
        description="Redis server URI"
    )

    # Vector DB (Qdrant)
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_API_KEY: str = ""
    QDRANT_URL: Optional[str] = None

    # Knowledge Graph (Neo4j)
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "aios_neo4j_password_2026"

    # File & Document Storage
    STORAGE_TYPE: str = Field(default="local", description="local | s3 | minio")
    STORAGE_LOCAL_DIR: str = Field(default="data/uploads", description="Directory for local storage")
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "aios_minio_admin"
    MINIO_SECRET_KEY: str = "aios_minio_secure_secret"
    MINIO_BUCKET_DOCUMENTS: str = "aios-documents"

    # AI Model Provider API Keys
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    TOGETHER_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""

    # Canonical Frontend Origin (Vercel canonical URL or custom domain)
    FRONTEND_URL: str = "https://aios-opal.vercel.app"

    # CORS Origins (Supports comma-separated strings or JSON arrays)
    BACKEND_CORS_ORIGINS: Union[List[str], str] = [
        "https://aios-opal.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000"
    ]
    CORS_ORIGINS: Optional[str] = None

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.strip().startswith("["):
                try:
                    parsed = json.loads(v)
                    return [i.strip().rstrip("/") for i in parsed if isinstance(i, str) and i.strip()]
                except Exception:
                    pass
            return [i.strip().rstrip("/") for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return [i.strip().rstrip("/") for i in v if isinstance(i, str) and i.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()

