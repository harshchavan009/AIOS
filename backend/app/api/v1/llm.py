import time
import asyncio
import random
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, status, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json
import httpx

from app.core.dependencies.auth_deps import get_current_user
from app.llm.router import llm_router_service
from app.models.user import User
from app.schemas.llm import LLMGenerateRequest, LLMResponse

router = APIRouter(prefix="/llm", tags=["LLM Gateway"])


# ── Provider & model registry definition ──────────────────────────────────────
PROVIDER_REGISTRY: List[Dict[str, Any]] = [
    {
        "provider_id": "openai",
        "provider_name": "OpenAI",
        "logo": "🟢",
        "color": "#10b981",
        "health_url": "https://api.openai.com/v1/models",
        "docs_url": "https://platform.openai.com/docs",
        "models": [
            {
                "id": "gpt-4o",
                "name": "GPT-4o",
                "context_window": 128000,
                "input_price_per_1m": 2.50,
                "output_price_per_1m": 10.00,
                "rate_limit_rpm": 10000,
                "rate_limit_tpm": 800000,
                "capabilities": ["text", "vision", "function_calling", "json_mode"],
                "type": "flagship",
            },
            {
                "id": "gpt-4o-mini",
                "name": "GPT-4o Mini",
                "context_window": 128000,
                "input_price_per_1m": 0.15,
                "output_price_per_1m": 0.60,
                "rate_limit_rpm": 30000,
                "rate_limit_tpm": 150000000,
                "capabilities": ["text", "vision", "function_calling", "json_mode"],
                "type": "efficient",
            },
            {
                "id": "gpt-4-turbo",
                "name": "GPT-4 Turbo",
                "context_window": 128000,
                "input_price_per_1m": 10.00,
                "output_price_per_1m": 30.00,
                "rate_limit_rpm": 5000,
                "rate_limit_tpm": 600000,
                "capabilities": ["text", "vision", "function_calling"],
                "type": "legacy",
            },
        ],
    },
    {
        "provider_id": "anthropic",
        "provider_name": "Anthropic",
        "logo": "🔶",
        "color": "#f59e0b",
        "health_url": "https://api.anthropic.com/v1/models",
        "docs_url": "https://docs.anthropic.com",
        "models": [
            {
                "id": "claude-3-5-sonnet-20241022",
                "name": "Claude 3.5 Sonnet",
                "context_window": 200000,
                "input_price_per_1m": 3.00,
                "output_price_per_1m": 15.00,
                "rate_limit_rpm": 4000,
                "rate_limit_tpm": 400000,
                "capabilities": ["text", "vision", "function_calling", "reasoning"],
                "type": "flagship",
            },
            {
                "id": "claude-3-5-haiku-20241022",
                "name": "Claude 3.5 Haiku",
                "context_window": 200000,
                "input_price_per_1m": 0.80,
                "output_price_per_1m": 4.00,
                "rate_limit_rpm": 4000,
                "rate_limit_tpm": 400000,
                "capabilities": ["text", "vision", "function_calling"],
                "type": "efficient",
            },
            {
                "id": "claude-3-opus-20240229",
                "name": "Claude 3 Opus",
                "context_window": 200000,
                "input_price_per_1m": 15.00,
                "output_price_per_1m": 75.00,
                "rate_limit_rpm": 4000,
                "rate_limit_tpm": 400000,
                "capabilities": ["text", "vision", "function_calling"],
                "type": "legacy",
            },
        ],
    },
    {
        "provider_id": "google",
        "provider_name": "Google AI",
        "logo": "🔵",
        "color": "#3b82f6",
        "health_url": "https://generativelanguage.googleapis.com/v1beta/models",
        "docs_url": "https://ai.google.dev",
        "models": [
            {
                "id": "gemini-1.5-pro-002",
                "name": "Gemini 1.5 Pro",
                "context_window": 2000000,
                "input_price_per_1m": 1.25,
                "output_price_per_1m": 5.00,
                "rate_limit_rpm": 1000,
                "rate_limit_tpm": 4000000,
                "capabilities": ["text", "vision", "audio", "video", "function_calling"],
                "type": "flagship",
            },
            {
                "id": "gemini-1.5-flash-002",
                "name": "Gemini 1.5 Flash",
                "context_window": 1000000,
                "input_price_per_1m": 0.075,
                "output_price_per_1m": 0.30,
                "rate_limit_rpm": 2000,
                "rate_limit_tpm": 4000000,
                "capabilities": ["text", "vision", "function_calling"],
                "type": "efficient",
            },
            {
                "id": "gemini-2.0-flash-exp",
                "name": "Gemini 2.0 Flash",
                "context_window": 1000000,
                "input_price_per_1m": 0.10,
                "output_price_per_1m": 0.40,
                "rate_limit_rpm": 2000,
                "rate_limit_tpm": 4000000,
                "capabilities": ["text", "vision", "function_calling", "reasoning"],
                "type": "new",
            },
        ],
    },
    {
        "provider_id": "groq",
        "provider_name": "Groq",
        "logo": "⚡",
        "color": "#8b5cf6",
        "health_url": "https://api.groq.com/openai/v1/models",
        "docs_url": "https://console.groq.com/docs",
        "models": [
            {
                "id": "llama-3.1-70b-versatile",
                "name": "Llama 3.1 70B",
                "context_window": 131072,
                "input_price_per_1m": 0.59,
                "output_price_per_1m": 0.79,
                "rate_limit_rpm": 30,
                "rate_limit_tpm": 131072,
                "capabilities": ["text", "function_calling"],
                "type": "flagship",
            },
            {
                "id": "llama-3.1-8b-instant",
                "name": "Llama 3.1 8B Instant",
                "context_window": 131072,
                "input_price_per_1m": 0.05,
                "output_price_per_1m": 0.08,
                "rate_limit_rpm": 30,
                "rate_limit_tpm": 131072,
                "capabilities": ["text"],
                "type": "efficient",
            },
            {
                "id": "mixtral-8x7b-32768",
                "name": "Mixtral 8x7B",
                "context_window": 32768,
                "input_price_per_1m": 0.24,
                "output_price_per_1m": 0.24,
                "rate_limit_rpm": 30,
                "rate_limit_tpm": 32768,
                "capabilities": ["text", "function_calling"],
                "type": "efficient",
            },
        ],
    },
    {
        "provider_id": "together",
        "provider_name": "Together AI",
        "logo": "🤝",
        "color": "#06b6d4",
        "health_url": "https://api.together.xyz/v1/models",
        "docs_url": "https://docs.together.ai",
        "models": [
            {
                "id": "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
                "name": "Llama 3.1 70B Turbo",
                "context_window": 131072,
                "input_price_per_1m": 0.88,
                "output_price_per_1m": 0.88,
                "rate_limit_rpm": 600,
                "rate_limit_tpm": 100000,
                "capabilities": ["text", "function_calling"],
                "type": "flagship",
            },
            {
                "id": "deepseek-ai/DeepSeek-R1",
                "name": "DeepSeek R1",
                "context_window": 65536,
                "input_price_per_1m": 3.00,
                "output_price_per_1m": 7.00,
                "rate_limit_rpm": 300,
                "rate_limit_tpm": 100000,
                "capabilities": ["text", "reasoning"],
                "type": "reasoning",
            },
        ],
    },
    {
        "provider_id": "openrouter",
        "provider_name": "OpenRouter",
        "logo": "🔀",
        "color": "#ec4899",
        "health_url": "https://openrouter.ai/api/v1/models",
        "docs_url": "https://openrouter.ai/docs",
        "models": [
            {
                "id": "anthropic/claude-3.5-sonnet",
                "name": "Claude 3.5 Sonnet (OR)",
                "context_window": 200000,
                "input_price_per_1m": 3.00,
                "output_price_per_1m": 15.00,
                "rate_limit_rpm": 500,
                "rate_limit_tpm": 200000,
                "capabilities": ["text", "vision"],
                "type": "flagship",
            },
            {
                "id": "google/gemini-pro-1.5",
                "name": "Gemini 1.5 Pro (OR)",
                "context_window": 2000000,
                "input_price_per_1m": 1.25,
                "output_price_per_1m": 5.00,
                "rate_limit_rpm": 500,
                "rate_limit_tpm": 200000,
                "capabilities": ["text", "vision"],
                "type": "flagship",
            },
        ],
    },
    {
        "provider_id": "ollama",
        "provider_name": "Ollama (Local)",
        "logo": "🦙",
        "color": "#6b7280",
        "health_url": "http://localhost:11434/api/tags",
        "docs_url": "https://ollama.ai",
        "models": [
            {
                "id": "llama3.2:3b",
                "name": "Llama 3.2 3B",
                "context_window": 128000,
                "input_price_per_1m": 0.00,
                "output_price_per_1m": 0.00,
                "rate_limit_rpm": 999,
                "rate_limit_tpm": 999999,
                "capabilities": ["text"],
                "type": "local",
            },
            {
                "id": "mistral:7b",
                "name": "Mistral 7B",
                "context_window": 32768,
                "input_price_per_1m": 0.00,
                "output_price_per_1m": 0.00,
                "rate_limit_rpm": 999,
                "rate_limit_tpm": 999999,
                "capabilities": ["text"],
                "type": "local",
            },
        ],
    },
    {
        "provider_id": "lmstudio",
        "provider_name": "LM Studio (Local)",
        "logo": "🖥️",
        "color": "#f97316",
        "health_url": "http://localhost:1234/v1/models",
        "docs_url": "https://lmstudio.ai",
        "models": [
            {
                "id": "local-model",
                "name": "Local Model",
                "context_window": 4096,
                "input_price_per_1m": 0.00,
                "output_price_per_1m": 0.00,
                "rate_limit_rpm": 999,
                "rate_limit_tpm": 999999,
                "capabilities": ["text"],
                "type": "local",
            },
        ],
    },
]


async def ping_provider(provider: Dict[str, Any]) -> Dict[str, Any]:
    """
    Actually ping each provider's health/model listing endpoint to measure real latency.
    Returns availability + measured latency.
    """
    url = provider["health_url"]
    pid = provider["provider_id"]
    t0 = time.monotonic()
    
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            response = await client.get(url, headers={"User-Agent": "AIOS-ModelRegistry/1.0"})
        latency_ms = round((time.monotonic() - t0) * 1000)
        
        # Local providers (Ollama, LM Studio) on localhost
        if pid in ("ollama", "lmstudio"):
            if response.status_code in (200, 404):
                return {"available": True, "latency_ms": latency_ms, "status_code": response.status_code, "note": "Local server running"}
            return {"available": False, "latency_ms": latency_ms, "status_code": response.status_code, "note": "Not running — start Ollama/LM Studio"}
        
        # Cloud providers — 200 or 401 (auth needed) both mean the endpoint is reachable
        if response.status_code in (200, 401, 403):
            return {"available": True, "latency_ms": latency_ms, "status_code": response.status_code, "note": "API endpoint reachable"}
        return {"available": False, "latency_ms": latency_ms, "status_code": response.status_code, "note": f"HTTP {response.status_code}"}
    
    except httpx.ConnectTimeout:
        latency_ms = round((time.monotonic() - t0) * 1000)
        return {"available": False, "latency_ms": latency_ms, "status_code": 0, "note": "Connection timeout (4s)"}
    except httpx.ConnectError:
        latency_ms = round((time.monotonic() - t0) * 1000)
        is_local = pid in ("ollama", "lmstudio")
        return {
            "available": False,
            "latency_ms": latency_ms,
            "status_code": 0,
            "note": "Not running locally" if is_local else "Network unreachable"
        }
    except Exception as e:
        latency_ms = round((time.monotonic() - t0) * 1000)
        return {"available": False, "latency_ms": latency_ms, "status_code": 0, "note": str(e)[:60]}


@router.post("/generate", response_model=LLMResponse, status_code=status.HTTP_200_OK)
async def generate_completion(request: LLMGenerateRequest, current_user: User = Depends(get_current_user)):
    span = telemetry_service.start_trace_span("llm_generate")
    response = await llm_router_service.generate_with_fallback(request)
    telemetry_service.end_trace_span(span, {"tokens": response.usage.total_tokens, "cost": response.usage.estimated_cost_usd})
    return response




@router.post("/stream")
async def generate_stream(request: LLMGenerateRequest, current_user: User = Depends(get_current_user)):
    async def sse_event_generator():
        async for chunk in llm_router_service.stream_with_fallback(request):
            yield f"data: {chunk.model_dump_json()}\n\n"
        yield "data: [DONE]\n\n"
    return StreamingResponse(sse_event_generator(), media_type="text/event-stream")


# ── Registry: list all providers + models ─────────────────────────────────────
@router.get("/registry")
async def get_model_registry(current_user: User = Depends(get_current_user)):
    """Return full provider + model registry with static metadata."""
    return {"providers": PROVIDER_REGISTRY, "total_models": sum(len(p["models"]) for p in PROVIDER_REGISTRY)}


# ── Health check: ping all providers concurrently ─────────────────────────────
@router.get("/registry/health")
async def check_all_providers_health(current_user: User = Depends(get_current_user)):
    """
    Concurrently ping all 8 provider health endpoints and return measured latency + availability.
    """
    tasks = [ping_provider(p) for p in PROVIDER_REGISTRY]
    results = await asyncio.gather(*tasks)
    
    health_map = {}
    for provider, result in zip(PROVIDER_REGISTRY, results):
        health_map[provider["provider_id"]] = {
            **result,
            "provider_name": provider["provider_name"],
            "checked_at": time.time(),
        }
    
    available_count = sum(1 for r in health_map.values() if r["available"])
    return {
        "health": health_map,
        "available": available_count,
        "total": len(PROVIDER_REGISTRY),
        "checked_at": time.time(),
    }


# ── SSE: stream health checks one by one ──────────────────────────────────────
@router.get("/registry/health/stream")
async def stream_provider_health(current_user: User = Depends(get_current_user)):
    """
    Stream provider health check results as SSE events — one per provider as each ping completes.
    """
    async def event_gen():
        yield f"data: {json.dumps({'event': 'START', 'total': len(PROVIDER_REGISTRY)})}\n\n"
        
        tasks = [(p, asyncio.create_task(ping_provider(p))) for p in PROVIDER_REGISTRY]
        
        for provider, task in tasks:
            result = await task
            yield f"data: {json.dumps({'event': 'RESULT', 'provider_id': provider['provider_id'], 'provider_name': provider['provider_name'], **result})}\n\n"
            await asyncio.sleep(0.05)
        
        yield f"data: {json.dumps({'event': 'COMPLETE'})}\n\n"
    
    return StreamingResponse(
        event_gen(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# ── Legacy endpoints ──────────────────────────────────────────────────────────
@router.get("/providers")
async def list_providers():
    return {"providers": [{"id": p["provider_id"], "name": p["provider_name"], "models": [m["id"] for m in p["models"]]} for p in PROVIDER_REGISTRY]}


from app.observability.telemetry import telemetry_service


@router.get("/metrics")
async def get_llm_metrics(current_user: User = Depends(get_current_user)):
    summary = telemetry_service.get_metrics_summary()
    tokens = summary.get("total_tokens_processed", 0)
    return {
        "total_requests": summary.get("total_requests", 0),
        "avg_latency_ms": summary.get("latency_p50_ms", 145.0),
        "total_tokens": tokens,
        "total_tokens_processed": tokens,
        "monthly_cost_usd": summary.get("total_cost_usd", 0.0),
        "error_rate": 0.0,
    }


