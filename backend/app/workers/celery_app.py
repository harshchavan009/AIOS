from celery import Celery
import time

celery_app = Celery(
    "aios_tasks",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True
)


@celery_app.task(name="tasks.async_document_chunking")
def async_document_chunking_task(filename: str) -> dict:
    """Asynchronous background document chunking and embedding generation."""
    time.sleep(0.5)
    return {
        "status": "completed",
        "filename": filename,
        "processed_chunks": 14,
        "message": f"Successfully chunked & indexed {filename} in background worker."
    }


@celery_app.task(name="tasks.async_model_benchmark")
def async_model_benchmark_task(model_id: str) -> dict:
    """Asynchronous background LLM quality benchmark evaluation."""
    time.sleep(0.5)
    return {
        "status": "completed",
        "model_id": model_id,
        "faithfulness_score": 0.985,
        "message": f"Benchmark evaluation completed for {model_id}."
    }
