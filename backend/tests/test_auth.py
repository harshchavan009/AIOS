import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_user_signup_and_login_flow(client: AsyncClient):
    user_payload = {
        "email": "engineer@aios.enterprise",
        "password": "SecurePassword123!",
        "full_name": "Senior AI Architect",
        "role": "engineer"
    }

    # 1. Test Signup / Register
    signup_res = await client.post("/api/v1/auth/signup", json=user_payload)
    assert signup_res.status_code == 201
    user_data = signup_res.json()
    assert user_data["email"] == user_payload["email"]
    assert user_data["full_name"] == user_payload["full_name"]
    assert "id" in user_data

    # 2. Test Duplicate Signup Prevention
    dup_res = await client.post("/api/v1/auth/signup", json=user_payload)
    assert dup_res.status_code == 409

    # 3. Test Login
    login_payload = {
        "email": user_payload["email"],
        "password": user_payload["password"]
    }
    login_res = await client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    assert "refresh_token" in token_data
    assert token_data["token_type"] == "bearer"

    token = token_data["access_token"]
    refresh = token_data["refresh_token"]

    # 4. Test Authenticated Profile Route /me
    me_res = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == user_payload["email"]

    # 5. Test Token Refresh
    refresh_res = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh})
    assert refresh_res.status_code == 200
    refreshed_data = refresh_res.json()
    assert "access_token" in refreshed_data

    # 6. Test Logout
    logout_res = await client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert logout_res.status_code == 200


@pytest.mark.asyncio
async def test_invalid_login_credentials(client: AsyncClient):
    login_res = await client.post("/api/v1/auth/login", json={
        "email": "nonexistent@aios.enterprise",
        "password": "WrongPassword!"
    })
    assert login_res.status_code == 401
