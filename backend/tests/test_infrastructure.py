import pytest
from httpx import AsyncClient
from app.workers.celery_app import async_document_chunking_task, async_model_benchmark_task


@pytest.mark.asyncio
async def test_infrastructure_health_and_celery_tasks(client: AsyncClient):
    # 1. Health check verification
    health_res = await client.get("/healthz")
    assert health_res.status_code == 200
    health_data = health_res.json()
    assert health_data["status"] == "healthy"

    # 2. Test Celery Background Worker Tasks
    task_res = async_document_chunking_task("soc2_audit.pdf")
    assert task_res["status"] == "completed"
    assert task_res["processed_chunks"] == 14

    benchmark_res = async_model_benchmark_task("gpt-4o")
    assert benchmark_res["status"] == "completed"
    assert benchmark_res["faithfulness_score"] == 0.985
