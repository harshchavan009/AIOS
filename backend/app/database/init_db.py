import secrets
from datetime import datetime, timezone
from sqlalchemy import inspect, text, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.logging import logger
from app.core.security import get_password_hash
from app.database.session import engine, AsyncSessionLocal
from app.database.base import Base
from app.models.user import User


async def ensure_db_schema_migrated():
    """
    Inspect existing DB tables and dynamically execute ALTER TABLE statements
    to add missing columns (e.g., is_verified, verification_token, oauth_provider, etc.)
    if pre-existing SQLite/PostgreSQL tables do not match SQLAlchemy models.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

        def sync_check_and_alter(sync_conn):
            inspector = inspect(sync_conn)
            if "users" in inspector.get_table_names():
                existing_cols = {col["name"] for col in inspector.get_columns("users")}
                
                missing_columns = {
                    "is_verified": "BOOLEAN DEFAULT 1",
                    "verification_token": "VARCHAR(255)",
                    "verification_sent_at": "DATETIME",
                    "oauth_provider": "VARCHAR(50)",
                    "oauth_id": "VARCHAR(255)",
                    "avatar_url": "VARCHAR(500)"
                }

                for col_name, col_type in missing_columns.items():
                    if col_name not in existing_cols:
                        logger.info(f"Auto-migrating DB: Adding missing column '{col_name}' to 'users' table...")
                        try:
                            sync_conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
                        except Exception as e:
                            logger.warning(f"Could not alter column {col_name}: {e}")

        await conn.run_sync(sync_check_and_alter)


async def seed_default_admin_accounts(db: AsyncSession):
    """
    Seed default development admin account and enterprise developer account
    ONLY in development environment and ONLY if they do not already exist.
    Never run in staging or production.
    Never overwrite passwords of existing accounts.
    """
    if settings.ENVIRONMENT != "development":
        logger.info(f"Production/staging environment detected ({settings.ENVIRONMENT}). Skipping seed account creation.")
        return

    # 1. Admin Account (admin@aios.dev)
    admin_email = "admin@aios.dev"
    res_admin = await db.execute(select(User).where(User.email == admin_email))
    admin_user = res_admin.scalars().first()

    if not admin_user:
        logger.info(f"Seeding development admin account: {admin_email}...")
        admin_user = User(
            email=admin_email,
            hashed_password=get_password_hash("Admin@12345"),
            full_name="AIOS Admin",
            role="Admin",
            is_active=True,
            is_verified=True,
            verification_token=secrets.token_urlsafe(32)
        )
        db.add(admin_user)
        await db.commit()

    # 2. Engineer Account (engineer@aios.enterprise)
    engineer_email = "engineer@aios.enterprise"
    res_eng = await db.execute(select(User).where(User.email == engineer_email))
    eng_user = res_eng.scalars().first()

    if not eng_user:
        logger.info(f"Seeding development engineer account: {engineer_email}...")
        eng_user = User(
            email=engineer_email,
            hashed_password=get_password_hash("Engineer@12345"),
            full_name="Senior AI Engineer",
            role="Developer",
            is_active=True,
            is_verified=True,
            verification_token=secrets.token_urlsafe(32)
        )
        db.add(eng_user)
        await db.commit()

    logger.info("Development user accounts verification check complete.")


async def init_db_and_seed():
    """Full database initialization and seeding lifecycle."""
    await ensure_db_schema_migrated()
    async with AsyncSessionLocal() as session:
        try:
            await seed_default_admin_accounts(session)
        except Exception as e:
            logger.exception(f"Error seeding default accounts: {e}")
            await session.rollback()
        finally:
            await session.close()
