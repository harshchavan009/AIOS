import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_security_validation_and_token_rejection(client: AsyncClient):
    # 1. Unauthenticated request rejection (401 Unauthorized)
    unauth_res = await client.get("/api/v1/auth/me")
    assert unauth_res.status_code == 401

    # 2. Invalid JWT token signature rejection
    invalid_headers = {"Authorization": "Bearer invalid.jwt.token.signature"}
    invalid_res = await client.get("/api/v1/auth/me", headers=invalid_headers)
    assert invalid_res.status_code == 401

    # 3. Pydantic Email Validation & Input Sanitization
    malicious_email = "' OR '1'='1' -- @aios.enterprise"
    signup_res = await client.post("/api/v1/auth/signup", json={
        "email": malicious_email,
        "password": "SecurePassword123!",
        "full_name": "Attacker",
        "role": "engineer"
    })
    assert signup_res.status_code == 422  # Properly rejected by Pydantic EmailStr validator

    # 4. Valid signup & login for parameterized query resilience test
    valid_signup = {
        "email": "sec.test@aios.enterprise",
        "password": "SecurePassword123!",
        "full_name": "Sec Tester",
        "role": "engineer"
    }
    await client.post("/api/v1/auth/signup", json=valid_signup)
    login_res = await client.post("/api/v1/auth/login", json={
        "email": valid_signup["email"],
        "password": valid_signup["password"]
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 5. SQL Injection Resilience on RAG & Search endpoints
    sql_injection_query = "'; DROP TABLE users; --"
    search_res = await client.post("/api/v1/rag/query", json={"query": sql_injection_query}, headers=headers)
    assert search_res.status_code == 200  # Parameterized query handled injection safely without error
