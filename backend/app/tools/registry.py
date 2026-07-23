import time
from typing import Dict, Any, List
from app.tools.base import BaseTool, ToolPermission, ToolResult
from app.tools.sandbox import PythonSandboxTool
from app.tools.integrations import (
    GitHubTool,
    SlackTool,
    NotionTool,
    SQLTool,
    BrowserTool,
    OCRTool
)


class UniversalToolRegistry:
    """
    Universal Tool Registry managing discovery, permission policy guards, and audit trails.
    """
    def __init__(self):
        self.tools: Dict[str, BaseTool] = {}
        self.execution_logs: List[Dict[str, Any]] = []
        
        # Register Core Tools
        self.register_tool(PythonSandboxTool())
        self.register_tool(GitHubTool())
        self.register_tool(SlackTool())
        self.register_tool(NotionTool())
        self.register_tool(SQLTool())
        self.register_tool(BrowserTool())
        self.register_tool(OCRTool())

    def register_tool(self, tool: BaseTool):
        self.tools[tool.name] = tool

    def list_tools(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": t.name,
                "description": t.description,
                "permission_required": t.permission_required.value
            }
            for t in self.tools.values()
        ]

    async def execute_tool(
        self,
        tool_name: str,
        params: Dict[str, Any],
        user_role: str = "engineer"
    ) -> ToolResult:
        if tool_name not in self.tools:
            return ToolResult(
                success=False,
                output="",
                error=f"Tool '{tool_name}' is not registered in Universal Tool Registry."
            )

        tool = self.tools[tool_name]
        
        # Audit Log
        result = await tool.execute(params, user_role=user_role)
        
        self.execution_logs.append({
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "tool_name": tool_name,
            "params": params,
            "success": result.success,
            "execution_time_ms": result.execution_time_ms
        })

        return result


universal_tool_registry = UniversalToolRegistry()
