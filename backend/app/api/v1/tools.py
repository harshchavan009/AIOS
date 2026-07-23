from typing import Dict, Any, List
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from app.core.dependencies.auth_deps import get_current_user
from app.models.user import User
from app.tools.registry import universal_tool_registry
from app.tools.mcp import mcp_engine

router = APIRouter(prefix="/tools", tags=["Tool Registry & MCP"])


class ToolExecuteRequest(BaseModel):
    tool_name: str
    params: Dict[str, Any] = {}


@router.get("", status_code=status.HTTP_200_OK)
async def list_registered_tools(current_user: User = Depends(get_current_user)):
    """
    List all tools registered in the Universal Tool Registry.
    """
    return universal_tool_registry.list_tools()


@router.post("/execute", status_code=status.HTTP_200_OK)
async def execute_registered_tool(
    request: ToolExecuteRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Execute tool with permission validation & audit logging.
    """
    result = await universal_tool_registry.execute_tool(
        request.tool_name,
        request.params,
        user_role=current_user.role
    )
    return {
        "success": result.success,
        "output": result.output,
        "error": result.error,
        "execution_time_ms": result.execution_time_ms
    }


@router.post("/mcp/call", status_code=status.HTTP_200_OK)
async def execute_mcp_protocol_call(
    json_rpc_payload: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """
    Invoke Model Context Protocol (MCP) tool via JSON-RPC 2.0.
    """
    return mcp_engine.parse_mcp_request(json_rpc_payload)


@router.get("/logs", status_code=status.HTTP_200_OK)
async def get_tool_execution_logs(current_user: User = Depends(get_current_user)):
    """
    Get audit execution logs and telemetry for tool invocations.
    """
    return universal_tool_registry.execution_logs
