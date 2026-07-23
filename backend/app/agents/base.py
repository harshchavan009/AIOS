from abc import ABC, abstractmethod
from typing import List, Dict, Any, AsyncGenerator
from pydantic import BaseModel, Field


class AgentState(BaseModel):
    goal: str
    plan_steps: List[str] = Field(default_factory=list)
    retrieved_context: List[Dict[str, Any]] = Field(default_factory=list)
    tool_outputs: List[Dict[str, Any]] = Field(default_factory=list)
    reasoning_notes: List[str] = Field(default_factory=list)
    critique_score: float = 0.0
    final_output: str = ""
    messages: List[Dict[str, Any]] = Field(default_factory=list)
    active_agent: str = "PlannerAgent"
    execution_logs: List[Dict[str, Any]] = Field(default_factory=list)


class BaseAgent(ABC):
    def __init__(self, name: str, role: str):
        self.name = name
        self.role = role

    @abstractmethod
    async def process(self, state: AgentState) -> AgentState:
        """Process current agent state and return updated state."""
        pass
