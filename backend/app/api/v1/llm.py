import json
from fastapi import APIRouter, Depends, status
from fastapi.responses import StreamingResponse
from app.core.dependencies.auth_deps import get_current_user
from app.llm.router import llm_router_service
from app.models.user import User
from app.schemas.llm import LLMGenerateRequest, LLMResponse

router = APIRouter(prefix="/llm", tags=["LLM Gateway"])


@router.post("/generate", response_model=LLMResponse, status_code=status.HTTP_200_OK)
async def generate_completion(
    request: LLMGenerateRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Universal LLM Generation Endpoint.
    Routes execution to requested model (e.g. GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, Llama 3)
    with automatic fallback routing if primary provider is unavailable.
    """
    response = await llm_router_service.generate_with_fallback(request)
    return response


@router.post("/stream")
async def generate_stream(
    request: LLMGenerateRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Server-Sent Events (SSE) streaming completion endpoint.
    """
    async def sse_event_generator():
        async for chunk in llm_router_service.stream_with_fallback(request):
            chunk_json = chunk.model_dump_json()
            yield f"data: {chunk_json}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(sse_event_generator(), media_type="text/event-stream")


@router.get("/metrics")
async def get_llm_metrics(current_user: User = Depends(get_current_user)):
    """
    Retrieve global LLM Gateway token consumption, cost metrics, and provider statuses.
    """
    return llm_router_service.get_telemetry_metrics()
