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

# Tracing Middleware
app.add_middleware(RequestTracingMiddleware)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
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
    return {"status": "healthy", "platform": "AIOS"}


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
            "message": "AIOS Unified Platform. Build frontend via 'npm run build' in frontend/ to serve single-link UI."
        }
