import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_enterprise_apps_endpoints(client: AsyncClient):
    # 1. Sign up user & obtain token
    user_payload = {
        "email": "apps.engineer@aios.enterprise",
        "password": "SecurePassword123!",
        "full_name": "Apps Engineer",
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

    # 2. Test AutoDev Repository Analysis
    autodev_payload = {
        "repository_url": "https://github.com/harshchavan009/AIOS.git",
        "branch": "main"
    }
    autodev_res = await client.post("/api/v1/apps/autodev/analyze", json=autodev_payload, headers=headers)
    assert autodev_res.status_code == 200
    autodev_data = autodev_res.json()
    assert "suggested_fix_pr" in autodev_data

    # 3. Test Second Brain Notes Creation
    note_payload = {
        "title": "Clean Architecture in AIOS",
        "content": "Decouple domain models from persistence layers.",
        "tags": ["architecture", "clean-code"]
    }
    note_res = await client.post("/api/v1/apps/second-brain/notes", json=note_payload, headers=headers)
    assert note_res.status_code == 200
    note_data = note_res.json()
    assert note_data["title"] == note_payload["title"]

    # 4. Test Enterprise Search
    search_payload = {
        "query": "SOC-2 compliance rules",
        "sources": ["slack", "notion"]
    }
    search_res = await client.post("/api/v1/apps/enterprise-search/query", json=search_payload, headers=headers)
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert len(search_data["results"]) > 0

    # 5. Test Data Analyst NL-to-SQL
    sql_payload = {
        "question": "What is the monthly LLM expenditure by database?",
        "database_name": "production_db"
    }
    sql_res = await client.post("/api/v1/apps/data-analyst/sql", json=sql_payload, headers=headers)
    assert sql_res.status_code == 200
    sql_data = sql_res.json()
    assert "SELECT" in sql_data["generated_sql"]

    # 6. Test Security Scan
    scan_res = await client.post("/api/v1/apps/security-analyst/scan", headers=headers)
    assert scan_res.status_code == 200
    scan_data = scan_res.json()
    assert scan_data["scan_status"] == "passed"
