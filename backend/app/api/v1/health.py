import time
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database.session import get_db
from app.core.config import settings

router = APIRouter()
start_time = time.time()


@router.get("/health", status_code=status.HTTP_200_OK)
@router.get("/healthz", status_code=status.HTTP_200_OK)
async def health_check():
    """Liveness probe returning standard HTTP 200 OK status."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "uptime_seconds": round(time.time() - start_time, 2)
    }


@router.get("/readyz", status_code=status.HTTP_200_OK)
async def readiness_check(db: AsyncSession = Depends(get_db)):
    """Readiness probe verifying DB connection."""
    db_status = "unhealthy"
    try:
        result = await db.execute(text("SELECT 1"))
        if result.scalar() == 1:
            db_status = "healthy"
    except Exception as e:
        db_status = f"error: {str(e)}"

    is_ready = db_status == "healthy"
    return {
        "status": "ready" if is_ready else "not_ready",
        "components": {
            "database": db_status
        }
    }
