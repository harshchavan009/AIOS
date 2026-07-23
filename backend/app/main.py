from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import AIOSException, aios_exception_handler, global_exception_handler
from app.core.logging import logger
from app.core.middleware.request_tracing import RequestTracingMiddleware
from app.database.base import Base
from app.database.session import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing AIOS Backend Platform...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database schemas initialized.")
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


@app.get("/", include_in_schema=False)
async def root_info():
    return {
        "service": settings.PROJECT_NAME,
        "status": "online",
        "documentation": "/docs",
        "frontend_url": "http://localhost:5173",
        "message": "AIOS Backend is running. Please access the React frontend application at http://localhost:5173"
    }


@app.get("/healthz", tags=["Health"], include_in_schema=False)
async def top_healthz():
    return {"status": "healthy", "platform": "AIOS"}
