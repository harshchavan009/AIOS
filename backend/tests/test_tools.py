import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_tool_registry_and_mcp_endpoints(client: AsyncClient):
    # 1. Sign up user & obtain token
    user_payload = {
        "email": "tool.engineer@aios.enterprise",
        "password": "SecurePassword123!",
        "full_name": "Tool Engineer",
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

    # 2. List Registered Tools
    tools_res = await client.get("/api/v1/tools", headers=headers)
    assert tools_res.status_code == 200
    tools_data = tools_res.json()
    assert len(tools_data) >= 6

    # 3. Test Python Sandbox Execution
    sandbox_payload = {
        "tool_name": "python_sandbox",
        "params": {"code": "result = [x * 2 for x in range(5)]"}
    }
    sandbox_res = await client.post("/api/v1/tools/execute", json=sandbox_payload, headers=headers)
    assert sandbox_res.status_code == 200
    sandbox_data = sandbox_res.json()
    assert sandbox_data["success"] is True
    assert "[0, 2, 4, 6, 8]" in sandbox_data["output"]

    # 4. Test MCP Protocol JSON-RPC tool invocation
    mcp_payload = {
        "jsonrpc": "2.0",
        "method": "tools/call",
        "params": {"name": "github_create_pr", "arguments": {"repo": "AIOS"}},
        "id": "mcp_test_99"
    }
    mcp_res = await client.post("/api/v1/tools/mcp/call", json=mcp_payload, headers=headers)
    assert mcp_res.status_code == 200
    mcp_data = mcp_res.json()
    assert "result" in mcp_data

    # 5. Fetch Execution Logs
    logs_res = await client.get("/api/v1/tools/logs", headers=headers)
    assert logs_res.status_code == 200
    logs_data = logs_res.json()
    assert len(logs_data) > 0
