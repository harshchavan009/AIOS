import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_multi_agent_execution_and_workflow(client: AsyncClient):
    # 1. Sign up user & obtain token
    user_payload = {
        "email": "agent.engineer@aios.enterprise",
        "password": "SecurePassword123!",
        "full_name": "Multi-Agent Engineer",
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

    # 2. Execute Multi-Agent Workflow
    exec_payload = {
        "goal": "Decompose financial compliance audit workflow into LangGraph DAG with Neo4j entity graph traversal.",
        "model": "gpt-4o"
    }
    exec_res = await client.post("/api/v1/agents/execute", json=exec_payload, headers=headers)
    assert exec_res.status_code == 200
    data = exec_res.json()
    assert "final_output" in data
    assert len(data["plan_steps"]) > 0
    assert len(data["execution_logs"]) > 0
    assert data["critique_score"] == 0.98
