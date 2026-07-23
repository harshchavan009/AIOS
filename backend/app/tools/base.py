from abc import ABC, abstractmethod
from enum import Enum
from typing import Dict, Any, Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class ToolPermission(str, Enum):
    READ = "READ"
    WRITE = "WRITE"
    EXECUTE = "EXECUTE"
    ADMIN = "ADMIN"


class ToolResult(BaseModel):
    success: bool
    output: Any
    error: Optional[str] = None
    execution_time_ms: float = 0.0
    metadata: Dict[str, Any] = Field(default_factory=dict)


class BaseTool(ABC):
    def __init__(
        self,
        name: str,
        description: str,
        permission_required: ToolPermission = ToolPermission.READ
    ):
        self.name = name
        self.description = description
        self.permission_required = permission_required

    @abstractmethod
    async def execute(self, params: Dict[str, Any], user_role: str = "engineer") -> ToolResult:
        """Execute tool with parameters and permission policy validation."""
        pass
