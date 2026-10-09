import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_user_signup_and_login_flow(client: AsyncClient):
    user_payload = {
        "email": "engineer@aios.enterprise",
        "password": "SecurePassword123!",
        "full_name": "Senior AI Architect",
        "role": "Developer"
    }

    # 1. Test Signup / Register
    signup_res = await client.post("/api/v1/auth/signup", json=user_payload)
    assert signup_res.status_code == 201
    user_data = signup_res.json()
    assert user_data["email"] == user_payload["email"]
    assert user_data["full_name"] == user_payload["full_name"]
    assert user_data["role"] == "Developer"
    assert "id" in user_data

    # 2. Test Duplicate Signup Prevention
    dup_res = await client.post("/api/v1/auth/signup", json=user_payload)
    assert dup_res.status_code == 409

    # 3. Test Login with Remember Me
    login_payload = {
        "email": user_payload["email"],
        "password": user_payload["password"],
        "remember_me": True
    }
    login_res = await client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    assert "refresh_token" in token_data
    assert token_data["token_type"] == "bearer"

    token = token_data["access_token"]
    refresh = token_data["refresh_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 4. Test Authenticated Profile Route /me
    me_res = await client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == user_payload["email"]

    # 5. Test Active Sessions
    sess_res = await client.get("/api/v1/auth/sessions", headers=headers)
    assert sess_res.status_code == 200
    sessions = sess_res.json()
    assert len(sessions) > 0

    # 6. Test Login History Audit Log
    history_res = await client.get("/api/v1/auth/login-history", headers=headers)
    assert history_res.status_code == 200
    history = history_res.json()
    assert len(history) > 0

    # 7. Test Token Refresh
    refresh_res = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh})
    assert refresh_res.status_code == 200
    refreshed_data = refresh_res.json()
    assert "access_token" in refreshed_data

    # 8. Test Logout
    logout_res = await client.post("/api/v1/auth/logout", headers=headers)
    assert logout_res.status_code == 200


@pytest.mark.asyncio
async def test_oauth_and_invites_flow(client: AsyncClient):
    # Test OAuth Login (Google, GitHub, Microsoft)
    google_res = await client.post("/api/v1/auth/oauth/google", json={
        "provider": "google",
        "email": "google.dev@aios.enterprise",
        "name": "Google AI Developer",
        "remember_me": True
    })
    assert google_res.status_code == 200
    google_data = google_res.json()
    token = google_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Test Create Org Invite
    invite_res = await client.post("/api/v1/auth/invites/organization", headers=headers, json={
        "organization_id": "org_123",
        "email": "invited.analyst@aios.enterprise",
        "role": "Analyst"
    })
    assert invite_res.status_code == 200
    invite_data = invite_res.json()
    assert invite_data["role"] == "Analyst"
    assert "invite_token" in invite_data


@pytest.mark.asyncio
async def test_invalid_login_credentials(client: AsyncClient):
    login_res = await client.post("/api/v1/auth/login", json={
        "email": "nonexistent@aios.enterprise",
        "password": "WrongPassword!"
    })
    assert login_res.status_code == 401


@pytest.mark.asyncio
async def test_password_strength_and_common_passwords(client: AsyncClient):
    # Short password (< 12 chars)
    short_res = await client.post("/api/v1/auth/signup", json={
        "email": "shortpass@aios.enterprise",
        "password": "Short1!",
        "full_name": "Short Password Tester",
        "role": "Developer"
    })
    assert short_res.status_code == 422

    # Common password rejected
    common_res = await client.post("/api/v1/auth/signup", json={
        "email": "commonpass@aios.enterprise",
        "password": "password1234",
        "full_name": "Common Password Tester",
        "role": "Developer"
    })
    assert common_res.status_code in [400, 422]


@pytest.mark.asyncio
async def test_password_reset_flow_single_use(client: AsyncClient):
    email = "reset_test@aios.enterprise"
    signup_res = await client.post("/api/v1/auth/signup", json={
        "email": email,
        "password": "ValidSuperPassword123!",
        "full_name": "Reset Tester",
        "role": "Developer"
    })
    assert signup_res.status_code == 201

    # Request reset token
    forgot_res = await client.post("/api/v1/auth/forgot-password", json={"email": email})
    assert forgot_res.status_code == 200
    token = forgot_res.json()["reset_token"]
    assert token

    # Reset password with single-use token
    reset_res = await client.post("/api/v1/auth/reset-password", json={
        "token": token,
        "new_password": "NewSuperPassword123!"
    })
    assert reset_res.status_code == 200

    # Replay token: must fail immediately!
    replay_res = await client.post("/api/v1/auth/reset-password", json={
        "token": token,
        "new_password": "AnotherPassword123!"
    })
    assert replay_res.status_code == 401

    # Login with new password works
    login_res = await client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "NewSuperPassword123!"
    })
    assert login_res.status_code == 200


@pytest.mark.asyncio
async def test_oauth_unsupported_provider(client: AsyncClient):
    res = await client.post("/api/v1/auth/oauth/google", json={
        "provider": "untrusted_idp",
        "email": "hacker@evil.com"
    })
    assert res.status_code == 400

