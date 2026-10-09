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


@pytest.mark.asyncio
async def test_tenant_isolation_idor_prevention(client: AsyncClient):
    # User A creates Organization A
    user_a = {
        "email": "tenant_a@aios.enterprise",
        "password": "SecurePassword123!",
        "full_name": "Tenant A Owner",
        "role": "Owner"
    }
    await client.post("/api/v1/auth/signup", json=user_a)
    login_a = await client.post("/api/v1/auth/login", json={"email": user_a["email"], "password": user_a["password"]})
    token_a = login_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    org_res = await client.post("/api/v1/organizations", json={
        "name": "Tenant A Org",
        "slug": "tenant-a-org",
        "plan": "enterprise"
    }, headers=headers_a)
    assert org_res.status_code == 201
    org_a_id = org_res.json()["id"]

    # User B creates account (belongs to a different tenant)
    user_b = {
        "email": "tenant_b@aios.enterprise",
        "password": "SecurePassword123!",
        "full_name": "Tenant B User",
        "role": "Developer"
    }
    await client.post("/api/v1/auth/signup", json=user_b)
    login_b = await client.post("/api/v1/auth/login", json={"email": user_b["email"], "password": user_b["password"]})
    token_b = login_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Attack 1: User B attempts to create workspace inside User A's Organization (IDOR)
    idor_ws = await client.post("/api/v1/workspaces", json={
        "organization_id": org_a_id,
        "name": "Malicious Workspace",
        "slug": "malicious-ws"
    }, headers=headers_b)
    assert idor_ws.status_code == 403, "User B must NOT be allowed to create workspaces in User A's organization"

    # Attack 2: User B attempts to generate an API key inside User A's Organization (IDOR)
    idor_key = await client.post("/api/v1/api-keys", json={
        "organization_id": org_a_id,
        "name": "Malicious Key"
    }, headers=headers_b)
    assert idor_key.status_code == 403, "User B must NOT be allowed to generate API keys for User A's organization"

    # Attack 3: User B attempts to list API keys of User A's Organization (IDOR)
    idor_list = await client.get(f"/api/v1/api-keys?organization_id={org_a_id}", headers=headers_b)
    assert idor_list.status_code == 403, "User B must NOT be allowed to list API keys of User A's organization"

    # Attack 4: User B (role Developer) attempts to call admin-only subscription upgrade
    rbac_upgrade = await client.post("/api/v1/billing/subscription/upgrade", json={"tier": "Enterprise"}, headers=headers_b)
    assert rbac_upgrade.status_code == 403, "Developer role must NOT be allowed to call Owner/Admin billing upgrade"

