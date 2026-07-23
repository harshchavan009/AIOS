from fastapi import APIRouter
from app.api.v1.health import router as health_router
from app.api.v1.auth import router as auth_router
from app.api.v1.llm import router as llm_router
from app.api.v1.organizations import router as organizations_router
from app.api.v1.workspaces import router as workspaces_router
from app.api.v1.api_keys import router as api_keys_router
from app.api.v1.rag import router as rag_router
from app.api.v1.agents import router as agents_router
from app.api.v1.studio import router as studio_router
from app.api.v1.apps import router as apps_router

api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(llm_router)
api_router.include_router(organizations_router)
api_router.include_router(workspaces_router)
api_router.include_router(api_keys_router)
api_router.include_router(rag_router)
api_router.include_router(agents_router)
api_router.include_router(studio_router)
api_router.include_router(apps_router)
