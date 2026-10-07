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
    """Readiness probe verifying critical DB connection and optional external services."""
    import socket
    from urllib.parse import urlparse

    def check_tcp(target: str, def_port: int, timeout: float = 0.5) -> bool:
        try:
            if "://" in target:
                p = urlparse(target)
                h, pt = p.hostname or "localhost", p.port or def_port
            elif ":" in target:
                parts = target.split(":", 1)
                h, pt = parts[0], int(parts[1])
            else:
                h, pt = target, def_port
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(timeout)
            res = s.connect_ex((h, pt))
            s.close()
            return res == 0
        except Exception:
            return False

    # 1. Primary Database
    db_status = "unhealthy"
    try:
        result = await db.execute(text("SELECT 1"))
        if result.scalar() == 1:
            db_status = "healthy"
    except Exception as e:
        db_status = f"error: {str(e)}"

    # 2. Redis
    redis_status = "healthy" if check_tcp(settings.REDIS_URL, 6379) else "unavailable_or_in_memory"

    # 3. Neo4j
    neo4j_status = "healthy" if check_tcp(settings.NEO4J_URI, 7687) else "in_memory_graph_active"

    # 4. Qdrant
    q_target = settings.QDRANT_URL or f"{settings.QDRANT_HOST}:{settings.QDRANT_PORT}"
    qdrant_status = "healthy" if check_tcp(q_target, 6333) else "in_memory_vector_active"

    is_ready = db_status == "healthy"
    return {
        "status": "ready" if is_ready else "not_ready",
        "components": {
            "database": db_status,
            "redis": redis_status,
            "neo4j": neo4j_status,
            "qdrant": qdrant_status
        }
    }

