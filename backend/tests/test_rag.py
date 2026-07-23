import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_graph_rag_pipeline_flow(client: AsyncClient):
    # 1. Sign up user & obtain token
    user_payload = {
        "email": "rag.engineer@aios.enterprise",
        "password": "SecurePassword123!",
        "full_name": "RAG Engineer",
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

    # 2. Upload Document
    file_content = "SOC-2 Type II audit report for Acme Corp. Controls verify data encryption and Graph RAG access control."
    files = {"file": ("soc2_audit.txt", file_content, "text/plain")}
    upload_res = await client.post("/api/v1/rag/upload", files=files, headers=headers)
    assert upload_res.status_code == 200
    upload_data = upload_res.json()
    assert "Successfully indexed" in upload_data["message"]

    # 3. Hybrid Graph RAG Query
    query_payload = {
        "query": "What are the SOC-2 audit controls for Acme Corp?",
        "top_k": 2
    }
    query_res = await client.post("/api/v1/rag/query", json=query_payload, headers=headers)
    assert query_res.status_code == 200
    query_data = query_res.json()
    assert "citations" in query_data
    assert len(query_data["citations"]) > 0
    assert query_data["citations"][0]["source"] == "soc2_audit.txt"

    # 4. Fetch Knowledge Graph Data
    graph_res = await client.get("/api/v1/rag/graph", headers=headers)
    assert graph_res.status_code == 200
    graph_data = graph_res.json()
    assert "nodes" in graph_data
    assert "edges" in graph_data
