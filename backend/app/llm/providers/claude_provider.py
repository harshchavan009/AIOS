import time
import uuid
from typing import AsyncGenerator
from app.core.config import settings
from app.llm.base import BaseLLMProvider
from app.schemas.llm import LLMGenerateRequest, LLMResponse, StreamChunkResponse, TokenUsageMetrics


class ClaudeProvider(BaseLLMProvider):
    def __init__(self):
        # Claude 3.5 Sonnet estimated pricing ($3.00 / $15.00 per 1M tokens)
        super().__init__(
            provider_name="Anthropic",
            input_cost_per_1k=0.0030,
            output_cost_per_1k=0.0150
        )
        self.api_key = settings.ANTHROPIC_API_KEY

    async def generate(self, request: LLMGenerateRequest) -> LLMResponse:
        start_time = time.time()

        content = f"Claude 3.5 Sonnet reasoning & synthesis output for prompt: '{request.prompt or 'Enterprise Multi-Agent Pipeline'}'"
        prompt_tokens = self.estimate_tokens(request.prompt or "")
        completion_tokens = self.estimate_tokens(content)

        latency_ms = (time.time() - start_time) * 1000
        total_tokens = prompt_tokens + completion_tokens
        cost = self.calculate_cost(prompt_tokens, completion_tokens)

        return LLMResponse(
            id=f"claude-{uuid.uuid4().hex[:8]}",
            model_used=request.model if "claude" in request.model.lower() else "claude-3-5-sonnet",
            provider=self.provider_name,
            content=content,
            finish_reason="stop",
            latency_ms=round(latency_ms, 2),
            usage=TokenUsageMetrics(
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                total_tokens=total_tokens,
                estimated_cost_usd=cost
            ),
            requested_model=request.model
        )

    async def generate_stream(self, request: LLMGenerateRequest) -> AsyncGenerator[StreamChunkResponse, None]:
        response_text = f"Claude 3.5 Sonnet streaming context synthesis output."
        words = response_text.split()
        req_id = f"claude-stream-{uuid.uuid4().hex[:8]}"

        for i, word in enumerate(words):
            yield StreamChunkResponse(
                id=req_id,
                model="claude-3-5-sonnet",
                delta=word + (" " if i < len(words) - 1 else ""),
                finish_reason="stop" if i == len(words) - 1 else None
            )
