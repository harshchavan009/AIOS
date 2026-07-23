import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_organization_and_workspace_creation(client: AsyncClient):
    # 1. Sign up user
    user_payload = {
        "email": "saas.owner@aios.enterprise",
        "password": "SecurePassword123!",
        "full_name": "SaaS Owner",
        "role": "engineer"
    }
    signup_res = await client.post("/api/v1/auth/signup", json=user_payload)
    assert signup_res.status_code == 201

    # 2. Log in
    login_res = await client.post("/api/v1/auth/login", json={
        "email": user_payload["email"],
        "password": user_payload["password"]
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Create Organization
    org_payload = {
        "name": "Acme SaaS AI",
        "slug": "acme-saas-ai",
        "plan": "enterprise"
    }
    org_res = await client.post("/api/v1/organizations", json=org_payload, headers=headers)
    assert org_res.status_code == 201
    org_data = org_res.json()
    assert org_data["name"] == org_payload["name"]
    assert "id" in org_data

    # 4. Create Workspace in Organization
    ws_payload = {
        "organization_id": org_data["id"],
        "name": "Production Cluster",
        "slug": "production-cluster"
    }
    ws_res = await client.post("/api/v1/workspaces", json=ws_payload, headers=headers)
    assert ws_res.status_code == 201
    ws_data = ws_res.json()
    assert ws_data["name"] == ws_payload["name"]

    # 5. Generate API Key
    key_payload = {
        "organization_id": org_data["id"],
        "name": "CI/CD Key"
    }
    key_res = await client.post("/api/v1/api-keys", json=key_payload, headers=headers)
    assert key_res.status_code == 201
    key_data = key_res.json()
    assert "raw_key" in key_data
