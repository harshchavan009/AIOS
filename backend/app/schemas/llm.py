from datetime import datetime
from typing import AsyncGenerator, Dict, List, Optional, Any
from pydantic import BaseModel, Field, ConfigDict


class Message(BaseModel):
    role: str = Field(..., description="system, user, assistant, or tool")
    content: str = Field(..., description="Message text content")


class LLMGenerateRequest(BaseModel):
    prompt: Optional[str] = Field(None, description="Direct text prompt")
    messages: Optional[List[Message]] = Field(None, description="Conversation messages")
    model: str = Field(default="gpt-4o", description="Target LLM model identifier")
    fallback_models: List[str] = Field(
        default=["claude-3-5-sonnet", "gemini-1.5-pro", "llama-3-70b"],
        description="Priority order of fallback models if primary fails"
    )
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: int = Field(default=2048, ge=1, le=16384)
    top_p: float = Field(default=1.0, ge=0.0, le=1.0)
    stream: bool = Field(default=False)
    system_prompt: Optional[str] = Field(None)


class TokenUsageMetrics(BaseModel):
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    estimated_cost_usd: float


class LLMResponse(BaseModel):
    id: str
    model_used: str
    provider: str
    content: str
    finish_reason: str = "stop"
    latency_ms: float
    usage: TokenUsageMetrics
    fallback_occurred: bool = False
    requested_model: str


class StreamChunkResponse(BaseModel):
    id: str
    model: str
    delta: str
    finish_reason: Optional[str] = None
