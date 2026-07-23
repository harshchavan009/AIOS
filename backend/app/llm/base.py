import time
import uuid
from abc import ABC, abstractmethod
from typing import AsyncGenerator, Dict, List, Optional
from app.schemas.llm import LLMGenerateRequest, LLMResponse, StreamChunkResponse, TokenUsageMetrics


class BaseLLMProvider(ABC):
    """
    Abstract Base Class for LLM Providers in AIOS.
    Defines strict interfaces for multi-model generation, SSE streaming,
    token estimation, cost calculation, and latency tracking.
    """

    def __init__(self, provider_name: str, input_cost_per_1k: float, output_cost_per_1k: float):
        self.provider_name = provider_name
        self.input_cost_per_1k = input_cost_per_1k
        self.output_cost_per_1k = output_cost_per_1k

    def calculate_cost(self, prompt_tokens: int, completion_tokens: int) -> float:
        cost_input = (prompt_tokens / 1000.0) * self.input_cost_per_1k
        cost_output = (completion_tokens / 1000.0) * self.output_cost_per_1k
        return round(cost_input + cost_output, 6)

    def estimate_tokens(self, text: str) -> int:
        """Rough token estimation fallback (avg 4 chars per token)."""
        return max(1, len(text) // 4)

    @abstractmethod
    async def generate(self, request: LLMGenerateRequest) -> LLMResponse:
        """Generate complete non-streaming completion."""
        pass

    @abstractmethod
    async def generate_stream(self, request: LLMGenerateRequest) -> AsyncGenerator[StreamChunkResponse, None]:
        """Generate Server-Sent Events (SSE) streaming chunks."""
        pass
