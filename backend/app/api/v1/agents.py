from fastapi import APIRouter, Depends, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.core.dependencies.auth_deps import get_current_user
from app.models.user import User
from app.agents.orchestrator import multi_agent_orchestrator

router = APIRouter(prefix="/agents", tags=["Multi-Agent Engine"])


class AgentExecuteRequest(BaseModel):
    goal: str
    model: str = "gpt-4o"


@router.post("/execute", status_code=status.HTTP_200_OK)
async def execute_multi_agent_workflow(
    request: AgentExecuteRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Synchronously execute multi-agent LangGraph execution loop for a target goal.
    """
    final_state = await multi_agent_orchestrator.execute_graph(request.goal)
    return {
        "goal": final_state.goal,
        "final_output": final_state.final_output,
        "plan_steps": final_state.plan_steps,
        "retrieved_context": final_state.retrieved_context,
        "tool_outputs": final_state.tool_outputs,
        "critique_score": final_state.critique_score,
        "execution_logs": final_state.execution_logs
    }


@router.get("/stream", status_code=status.HTTP_200_OK)
async def stream_multi_agent_events(
    goal: str,
    current_user: User = Depends(get_current_user)
):
    """
    Stream live Server-Sent Events (SSE) of active agent thoughts and graph state transitions.
    """
    return StreamingResponse(
        multi_agent_orchestrator.stream_graph_events(goal),
        media_type="text/event-stream"
    )
