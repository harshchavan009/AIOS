import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_platform_studio_endpoints(client: AsyncClient):
    # 1. Sign up user & obtain token
    user_payload = {
        "email": "studio.engineer@aios.enterprise",
        "password": "SecurePassword123!",
        "full_name": "Studio Engineer",
        "role": "engineer"
    }
    signup_res = await client.post("/api/v1/auth/signup", json=user_payload)
    assert signup_res.status_code == 201

    login_res = await client.post("/api/v1/auth/login", json={
        "email": user_payload["email"],
        "password": user_payload["password"]
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Test Multi-Model Playground Comparison
    compare_payload = {
        "system_prompt": "You are an enterprise AI architect.",
        "user_prompt": "Benchmark multi-agent DAG latency across LLMs.",
        "temperature": 0.7,
        "max_tokens": 1024,
        "models": ["gpt-4o", "claude-3-5-sonnet"]
    }
    compare_res = await client.post("/api/v1/studio/playground/compare", json=compare_payload, headers=headers)
    assert compare_res.status_code == 200
    compare_data = compare_res.json()
    assert "comparison" in compare_data
    assert len(compare_data["comparison"]) == 2

    # 3. Test Prompt Templates
    prompts_res = await client.get("/api/v1/studio/prompts", headers=headers)
    assert prompts_res.status_code == 200
    prompts_data = prompts_res.json()
    assert len(prompts_data) > 0

    # 4. Test Model Registry
    models_res = await client.get("/api/v1/studio/models", headers=headers)
    assert models_res.status_code == 200
    models_data = models_res.json()
    assert len(models_data) >= 4

    # 5. Test Executive Analytics
    analytics_res = await client.get("/api/v1/studio/analytics", headers=headers)
    assert analytics_res.status_code == 200
    analytics_data = analytics_res.json()
    assert "monthly_expenditure" in analytics_data
