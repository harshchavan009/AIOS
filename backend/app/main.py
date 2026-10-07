import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import AIOSException, aios_exception_handler, global_exception_handler
from app.core.logging import logger
from app.core.middleware.request_tracing import RequestTracingMiddleware
from app.core.middleware.rate_limiter import RateLimiterMiddleware
from app.database.init_db import init_db_and_seed
from app.database.session import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing AIOS Backend Platform & Database...")
    try:
        await init_db_and_seed()
        logger.info("Database schemas migrated and default accounts initialized.")
    except Exception as e:
        logger.exception(f"Database initialization warning: {e}")
    yield
    logger.info("Shutting down AIOS Backend Platform...")
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Tracing & Rate Limiting Middleware
app.add_middleware(RequestTracingMiddleware)
app.add_middleware(RateLimiterMiddleware)

# CORS Setup - Compute allowed origins
cors_origins = list(settings.BACKEND_CORS_ORIGINS) if isinstance(settings.BACKEND_CORS_ORIGINS, list) else [str(settings.BACKEND_CORS_ORIGINS)]
if settings.CORS_ORIGINS:
    extra = [o.strip().rstrip("/") for o in settings.CORS_ORIGINS.split(",") if o.strip()]
    for o in extra:
        if o not in cors_origins:
            cors_origins.append(o)
if settings.FRONTEND_URL:
    clean_fe = settings.FRONTEND_URL.strip().rstrip("/")
    if clean_fe not in cors_origins:
        cors_origins.append(clean_fe)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Exception Handlers
app.add_exception_handler(AIOSException, aios_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

# Include Central API Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/healthz", tags=["Health"], include_in_schema=False)
async def top_healthz():
    return {
        "status": "healthy",
        "platform": "AIOS",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }


@app.get("/readyz", tags=["Health"], include_in_schema=False)
async def top_readyz():
    from app.database.session import AsyncSessionLocal
    from sqlalchemy import text
    db_status = "unhealthy"
    try:
        async with AsyncSessionLocal() as session:
            res = await session.execute(text("SELECT 1"))
            if res.scalar() == 1:
                db_status = "healthy"
    except Exception as e:
        db_status = f"error: {str(e)}"
    return {
        "status": "ready" if db_status == "healthy" else "not_ready",
        "database": db_status
    }


# Single-Port Unified Frontend SPA Static Mounting
dist_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))

if os.path.exists(dist_path):
    assets_path = os.path.join(dist_path, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="static")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        if (
            full_path.startswith("api/")
            or full_path.startswith("docs")
            or full_path.startswith("redoc")
            or full_path.startswith("healthz")
            or full_path.startswith("readyz")
        ):
            raise HTTPException(status_code=404, detail="API route not found")

        target_file = os.path.join(dist_path, full_path)
        if full_path and os.path.exists(target_file) and os.path.isfile(target_file):
            return FileResponse(target_file)
        return FileResponse(os.path.join(dist_path, "index.html"))
else:
    @app.get("/", include_in_schema=False)
    async def root_info():
        return {
            "service": settings.PROJECT_NAME,
            "status": "online",
            "documentation": "/docs",
            "message": "AIOS Unified Platform API Service"
        }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", settings.PORT))
    host = os.environ.get("HOST", settings.HOST)
    uvicorn.run("app.main:app", host=host, port=port, reload=False)

