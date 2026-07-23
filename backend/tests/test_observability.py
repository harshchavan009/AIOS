import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_observability_and_llmops_endpoints(client: AsyncClient):
    # 1. Sign up user & obtain token
    user_payload = {
        "email": "observability.engineer@aios.enterprise",
        "password": "SecurePassword123!",
        "full_name": "Observability Engineer",
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

    # 2. Get OpenTelemetry System Metrics
    metrics_res = await client.get("/api/v1/observability/metrics", headers=headers)
    assert metrics_res.status_code == 200
    metrics_data = metrics_res.json()
    assert "total_tokens_processed" in metrics_data
    assert metrics_data["system_status"] == "healthy"

    # 3. Get OpenTelemetry Traces
    traces_res = await client.get("/api/v1/observability/traces", headers=headers)
    assert traces_res.status_code == 200
    traces_data = traces_res.json()
    assert "active_exporter" in traces_data

    # 4. Trigger RAGAS / DeepEval Quality Evaluation
    eval_payload = {
        "prompt": "Evaluate Graph RAG faithfulness",
        "output": "Graph RAG faithfulness is 98% pass.",
        "retrieved_context": ["Context 1", "Context 2"]
    }
    eval_res = await client.post("/api/v1/observability/evaluate", json=eval_payload, headers=headers)
    assert eval_res.status_code == 200
    eval_data = eval_res.json()
    assert "metrics" in eval_data
    assert eval_data["metrics"]["faithfulness"] > 0.9

    # 5. Get Cost Dashboard
    cost_res = await client.get("/api/v1/observability/cost-dashboard", headers=headers)
    assert cost_res.status_code == 200
    cost_data = cost_res.json()
    assert "total_cost_usd" in cost_data
    assert len(cost_data["breakdown_by_provider"]) > 0
