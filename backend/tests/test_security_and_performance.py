import io
import pytest
from httpx import AsyncClient
from app.core.middleware.rate_limiter import RateLimiterMiddleware


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


@pytest.mark.asyncio
async def test_security_headers_present(client: AsyncClient):
    """Verify OWASP recommended security headers are attached and server fingerprinting stripped."""
    res = await client.get("/healthz")
    assert res.status_code == 200
    headers = res.headers

    assert headers.get("X-Content-Type-Options") == "nosniff"
    assert headers.get("X-Frame-Options") == "DENY"
    assert "max-age=31536000" in headers.get("Strict-Transport-Security", "")
    assert headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert "camera=()" in headers.get("Permissions-Policy", "")
    assert headers.get("Cross-Origin-Opener-Policy") == "same-origin"
    assert "server" not in headers


@pytest.mark.asyncio
async def test_rate_limiter_brute_force_protection(client: AsyncClient):
    """Verify rate limiter blocks rapid brute force login attempts with HTTP 429 and Retry-After."""
    RateLimiterMiddleware.reset()
    
    # 10 attempts are allowed per minute on auth endpoints
    for i in range(10):
        res = await client.post("/api/v1/auth/login", json={
            "email": f"attacker_{i}@target.com",
            "password": "WrongPassword123!"
        })
        assert res.status_code in (401, 200)

    # 11th attempt must be blocked by rate limiter
    blocked_res = await client.post("/api/v1/auth/login", json={
        "email": "attacker_11@target.com",
        "password": "WrongPassword123!"
    })
    assert blocked_res.status_code == 429
    assert "Retry-After" in blocked_res.headers
    assert int(blocked_res.headers["Retry-After"]) >= 1


@pytest.mark.asyncio
async def test_disallowed_file_upload_rejected(client: AsyncClient):
    """Verify upload endpoint rejects disallowed extensions and spoofed magic bytes."""
    signup_payload = {
        "email": "upload.tester@aios.enterprise",
        "password": "SecurePassword123!",
        "full_name": "Upload Tester",
        "role": "engineer"
    }
    await client.post("/api/v1/auth/signup", json=signup_payload)
    login_res = await client.post("/api/v1/auth/login", json={
        "email": signup_payload["email"],
        "password": signup_payload["password"]
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Reject disallowed extension (.exe)
    bad_file = {"file": ("malware.exe", io.BytesIO(b"MZ\x90\x00executable"), "application/x-msdownload")}
    bad_res = await client.post("/api/v1/rag/upload", files=bad_file, headers=headers)
    assert bad_res.json().get("status") == "rejected" or bad_res.status_code == 400

    # 2. Reject spoofed PDF with fake extension but non-PDF magic bytes
    fake_pdf = {"file": ("fake.pdf", io.BytesIO(b"NOT_A_REAL_PDF_HEADER"), "application/pdf")}
    fake_res = await client.post("/api/v1/rag/upload", files=fake_pdf, headers=headers)
    assert fake_res.json().get("status") == "rejected" or fake_res.status_code == 400


@pytest.mark.asyncio
async def test_rbac_viewer_execution_forbidden(client: AsyncClient):
    """Verify users with Viewer role are forbidden from executing agents or tools."""
    viewer_payload = {
        "email": "viewer.user@aios.enterprise",
        "password": "SecurePassword123!",
        "full_name": "Viewer Only",
        "role": "viewer"
    }
    await client.post("/api/v1/auth/signup", json=viewer_payload)
    login_res = await client.post("/api/v1/auth/login", json={
        "email": viewer_payload["email"],
        "password": viewer_payload["password"]
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Viewer cannot execute agents
    agent_res = await client.post("/api/v1/agents/execute", json={"goal": "Unauthorized audit run"}, headers=headers)
    assert agent_res.status_code == 403

    # Viewer cannot execute tools
    tool_res = await client.post("/api/v1/tools/execute", json={"tool_name": "python_sandbox", "params": {"code": "print(1)"}}, headers=headers)
    assert tool_res.status_code == 403

