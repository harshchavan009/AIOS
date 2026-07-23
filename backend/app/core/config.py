import os
from typing import List, Union
from pydantic import AnyHttpUrl, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "AIOS - Enterprise Multi-Agent AI Platform"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = Field(default="development", description="development, testing, production")
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    
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

    # Redis
    REDIS_URL: str = Field(
        default="redis://localhost:6379/0",
        description="Redis server URI"
    )

    # Vector DB (Qdrant)
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_API_KEY: str = ""

    # Knowledge Graph (Neo4j)
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "aios_neo4j_password_2026"

    # MinIO Storage
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "aios_minio_admin"
    MINIO_SECRET_KEY: str = "aios_minio_secure_secret"
    MINIO_BUCKET_DOCUMENTS: str = "aios-documents"

    # AI API Keys
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    GEMINI_API_KEY: str = ""

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000"
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
