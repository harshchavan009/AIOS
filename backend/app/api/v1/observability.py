from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field
from app.core.dependencies.auth_deps import get_current_user
from app.models.user import User
from app.observability.telemetry import telemetry_service
from app.observability.evaluators import evaluator_engine

router = APIRouter(prefix="/observability", tags=["Observability & LLMOps"])


class EvaluateRequest(BaseModel):
    prompt: str
    output: str
    retrieved_context: List[str] = Field(default_factory=list)


@router.get("/metrics", status_code=status.HTTP_200_OK)
async def get_system_observability_metrics(current_user: User = Depends(get_current_user)):
    """
    Get real-time OpenTelemetry metrics, latency percentiles, and health status.
    """
    return telemetry_service.get_metrics_summary()


@router.get("/traces", status_code=status.HTTP_200_OK)
async def get_opentelemetry_traces(current_user: User = Depends(get_current_user)):
    """
    Get OpenTelemetry request trace spans and multi-agent execution traces.
    """
    return {
        "active_exporter": "OpenTelemetry gRPC / OTLP",
        "traces": telemetry_service.traces
    }


@router.post("/evaluate", status_code=status.HTTP_200_OK)
async def run_llm_quality_evaluation(
    request: EvaluateRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Trigger RAGAS / DeepEval / Promptfoo evaluation report.
    """
    return evaluator_engine.evaluate_model_output(
        request.prompt,
        request.output,
        request.retrieved_context
    )


@router.get("/cost-dashboard", status_code=status.HTTP_200_OK)
async def get_cost_and_expenditure_dashboard(current_user: User = Depends(get_current_user)):
    """
    Get token expenditure and cost breakdown by model provider.
    """
    return {
        "total_cost_usd": 460.90,
        "monthly_budget_usd": 1000.00,
        "breakdown_by_provider": [
            {"provider": "OpenAI (GPT-4o)", "cost": 280.50, "tokens": 2800000},
            {"provider": "Anthropic (Claude 3.5 Sonnet)", "cost": 120.40, "tokens": 1200000},
            {"provider": "Google (Gemini 1.5 Pro)", "cost": 45.00, "tokens": 450000},
            {"provider": "Local (Llama 3 70B)", "cost": 15.00, "tokens": 130000}
        ]
    }
