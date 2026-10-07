import sys
import io
import time
from typing import Dict, Any
from app.tools.base import BaseTool, ToolPermission, ToolResult


class PythonSandboxTool(BaseTool):
    """
    Isolated Python Sandbox code execution engine.
    """
    def __init__(self):
        super().__init__(
            name="python_sandbox",
            description="Executes Python code in an isolated sandbox environment.",
            permission_required=ToolPermission.EXECUTE
        )

    async def execute(self, params: Dict[str, Any], user_role: str = "engineer") -> ToolResult:
        start_time = time.time()
        code = params.get("code", "")
        if not code.strip():
            return ToolResult(
                success=False,
                output="",
                error="No Python code provided for execution.",
                execution_time_ms=0.0
            )

        # Security validation against arbitrary OS execution
        dangerous_patterns = ["import os", "import subprocess", "import sys", "import shutil", "__import__", "open(", "eval(", "exec("]
        for pattern in dangerous_patterns:
            if pattern in code:
                return ToolResult(
                    success=False,
                    output="",
                    error=f"Security Violation: '{pattern}' is restricted in the production sandbox.",
                    execution_time_ms=0.0
                )

        # Execute code in safe scope capture
        stdout_capture = io.StringIO()
        old_stdout = sys.stdout
        sys.stdout = stdout_capture

        try:
            safe_builtins = {
                "print": print,
                "range": range,
                "len": len,
                "int": int,
                "float": float,
                "str": str,
                "dict": dict,
                "list": list,
                "set": set,
                "tuple": tuple,
                "bool": bool,
                "sum": sum,
                "min": min,
                "max": max,
                "abs": abs,
                "round": round,
                "sorted": sorted,
                "enumerate": enumerate,
                "zip": zip,
                "map": map,
                "filter": filter,
                "isinstance": isinstance,
                "True": True,
                "False": False,
                "None": None,
            }
            local_scope: Dict[str, Any] = {}
            exec(code, {"__builtins__": safe_builtins}, local_scope)
            sys.stdout = old_stdout
            output_str = stdout_capture.getvalue()
            if not output_str and "result" in local_scope:
                output_str = str(local_scope["result"])

            elapsed_ms = (time.time() - start_time) * 1000
            return ToolResult(
                success=True,
                output=output_str.strip() or "Code executed with 0 stdout output.",
                execution_time_ms=round(elapsed_ms, 2)
            )
        except Exception as e:
            sys.stdout = old_stdout
            elapsed_ms = (time.time() - start_time) * 1000
            return ToolResult(
                success=False,
                output="",
                error=f"Python Execution Error: {str(e)}",
                execution_time_ms=round(elapsed_ms, 2)
            )
