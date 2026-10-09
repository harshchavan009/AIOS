import asyncio
from typing import Optional, Dict
from collections import defaultdict
from fastapi import APIRouter, Depends, status, Query, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from app.core.dependencies.auth_deps import get_current_user, RequireRole
from app.models.user import User
from app.agents.orchestrator import multi_agent_orchestrator

router = APIRouter(prefix="/agents", tags=["Multi-Agent Engine"])

# In-memory tracking of active concurrent runs per user/tenant
ACTIVE_RUNS: Dict[str, int] = defaultdict(int)
MAX_CONCURRENT_RUNS_PER_USER = 5
AGENT_RUN_TIMEOUT_SECONDS = 120.0


class AgentExecuteRequest(BaseModel):
    goal: str = Field(..., min_length=3, max_length=10000, description="Target goal for agent execution")
    model: str = Field(default="gpt-4o", max_length=64)
    idempotency_key: Optional[str] = Field(default=None, max_length=128)


@router.post("/execute", status_code=status.HTTP_200_OK)
async def execute_multi_agent_workflow(
    request: AgentExecuteRequest,
    current_user: User = Depends(RequireRole(["Owner", "Admin", "Developer", "Analyst", "owner", "admin", "developer", "analyst"]))
):
    """
    Synchronously execute multi-agent LangGraph execution loop for a target goal with concurrency caps and timeout protection.
    """
    user_key = str(current_user.id)
    if ACTIVE_RUNS[user_key] >= MAX_CONCURRENT_RUNS_PER_USER:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Concurrent execution limit reached (max {MAX_CONCURRENT_RUNS_PER_USER} active runs). Please wait for existing agent tasks to finish."
        )

    ACTIVE_RUNS[user_key] += 1
    try:
        final_state = await asyncio.wait_for(
            multi_agent_orchestrator.execute_graph(request.goal),
            timeout=AGENT_RUN_TIMEOUT_SECONDS
        )
        return {
            "goal": final_state.goal,
            "final_output": final_state.final_output,
            "plan_steps": final_state.plan_steps,
            "retrieved_context": final_state.retrieved_context,
            "tool_outputs": final_state.tool_outputs,
            "critique_score": final_state.critique_score,
            "execution_logs": final_state.execution_logs
        }
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=f"Agent workflow exceeded maximum execution timeout ({AGENT_RUN_TIMEOUT_SECONDS}s)."
        )
    finally:
        ACTIVE_RUNS[user_key] = max(0, ACTIVE_RUNS[user_key] - 1)


@router.get("/stream")
async def stream_multi_agent_events(
    goal: str = Query(..., min_length=3, max_length=10000, description="High-level goal to execute"),
    current_user: User = Depends(get_current_user)
):
    """
    Stream live Server-Sent Events (SSE) of active agent thoughts and graph state transitions.
    Each LangGraph agent node emits its inner reasoning token-by-token in real time.
    """
    return StreamingResponse(
        multi_agent_orchestrator.stream_graph_events(goal),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        }
    )
