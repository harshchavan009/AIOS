import pytest
from httpx import AsyncClient
from app.llm.router import llm_router_service
from app.schemas.llm import LLMGenerateRequest


@pytest.mark.asyncio
async def test_llm_router_primary_generation():
    request = LLMGenerateRequest(
        prompt="Explain Clean Architecture in Python",
        model="gpt-4o",
        temperature=0.7
    )
    response = await llm_router_service.generate_with_fallback(request)
    assert response.provider == "OpenAI"
    assert response.model_used == "gpt-4o"
    assert response.usage.prompt_tokens > 0
    assert response.usage.total_tokens > 0
    assert response.fallback_occurred is False


@pytest.mark.asyncio
async def test_llm_router_fallback_routing():
    # Request an invalid model name to test automatic fallback to secondary models
    request = LLMGenerateRequest(
        prompt="Analyze multi-agent state graph",
        model="nonexistent-model-xyz",
        fallback_models=["claude-3-5-sonnet", "gemini-1.5-pro"]
    )
    response = await llm_router_service.generate_with_fallback(request)
    assert response.provider == "Anthropic"
    assert response.model_used == "claude-3-5-sonnet"
    assert response.fallback_occurred is True


@pytest.mark.asyncio
async def test_llm_api_endpoints(client: AsyncClient):
    # First create a user and log in to get access token
    user_payload = {
        "email": "llm_engineer@aios.enterprise",
        "password": "SecurePassword123!",
        "full_name": "LLM Systems Engineer",
        "role": "engineer"
    }
    signup_res = await client.post("/api/v1/auth/signup", json=user_payload)
    token = (await client.post("/api/v1/auth/login", json={
        "email": user_payload["email"],
        "password": user_payload["password"]
    })).json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}

    # Test /api/v1/llm/generate
    gen_res = await client.post(
        "/api/v1/llm/generate",
        headers=headers,
        json={"prompt": "Summarize Graph RAG paper", "model": "gpt-4o"}
    )
    assert gen_res.status_code == 200
    data = gen_res.json()
    assert "content" in data
    assert data["provider"] == "OpenAI"

    # Test /api/v1/llm/metrics
    metrics_res = await client.get("/api/v1/llm/metrics", headers=headers)
    assert metrics_res.status_code == 200
    metrics_data = metrics_res.json()
    assert "total_tokens_processed" in metrics_data
    assert metrics_data["total_tokens_processed"] > 0
