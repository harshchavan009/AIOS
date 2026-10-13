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


@pytest.mark.asyncio
async def test_stripe_webhook_hmac_signature_verification(client: AsyncClient):
    """Verify Stripe webhook requires valid HMAC-SHA256 signature and rejects forged or replayed requests."""
    import time
    import hmac
    import hashlib
    from app.core.config import settings

    test_secret = "whsec_test_secret_for_automated_verification_123"
    orig_secret = settings.STRIPE_WEBHOOK_SECRET
    settings.STRIPE_WEBHOOK_SECRET = test_secret

    try:
        body = b'{"type": "invoice.payment_succeeded", "id": "evt_test_123"}'
        current_ts = int(time.time())

        # 1. Valid Signature Test
        signed_payload = f"{current_ts}.".encode("utf-8") + body
        valid_v1 = hmac.new(test_secret.encode(), signed_payload, hashlib.sha256).hexdigest()
        valid_header = f"t={current_ts},v1={valid_v1}"

        res_valid = await client.post(
            "/api/v1/billing/webhooks/stripe",
            content=body,
            headers={"Content-Type": "application/json", "stripe-signature": valid_header}
        )
        assert res_valid.status_code == 200
        assert res_valid.json()["status"] == "processed"
        assert res_valid.json()["event"] == "invoice.payment_succeeded"

        # 2. Forged / Tampered Signature Test -> 401
        forged_header = f"t={current_ts},v1=forged_invalid_signature_hex"
        res_forged = await client.post(
            "/api/v1/billing/webhooks/stripe",
            content=body,
            headers={"Content-Type": "application/json", "stripe-signature": forged_header}
        )
        assert res_forged.status_code == 401

        # 3. Replay Attack / Expired Timestamp Test (> 5 minutes old) -> 401
        expired_ts = current_ts - 600
        expired_payload = f"{expired_ts}.".encode("utf-8") + body
        expired_v1 = hmac.new(test_secret.encode(), expired_payload, hashlib.sha256).hexdigest()
        expired_header = f"t={expired_ts},v1={expired_v1}"
        res_expired = await client.post(
            "/api/v1/billing/webhooks/stripe",
            content=body,
            headers={"Content-Type": "application/json", "stripe-signature": expired_header}
        )
        assert res_expired.status_code == 401

        # 4. Missing Signature Header -> 401
        res_missing = await client.post(
            "/api/v1/billing/webhooks/stripe",
            content=body,
            headers={"Content-Type": "application/json"}
        )
        assert res_missing.status_code == 401
    finally:
        settings.STRIPE_WEBHOOK_SECRET = orig_secret


@pytest.mark.asyncio
async def test_cors_origin_policy(client: AsyncClient):
    """Verify CORS headers correctly allow recognized origins and strip wildcards."""
    # Preflight OPTIONS request from allowed origin
    allowed_origin = "https://aios-opal.vercel.app"
    options_res = await client.options(
        "/api/v1/healthz",
        headers={
            "Origin": allowed_origin,
            "Access-Control-Request-Method": "GET"
        }
    )
    assert options_res.headers.get("access-control-allow-origin") == allowed_origin
    assert options_res.headers.get("access-control-allow-credentials") == "true"


