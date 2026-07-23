import time
import uuid
from typing import AsyncGenerator
from app.core.config import settings
from app.llm.base import BaseLLMProvider
from app.schemas.llm import LLMGenerateRequest, LLMResponse, StreamChunkResponse, TokenUsageMetrics


class GeminiProvider(BaseLLMProvider):
    def __init__(self):
        # Gemini 1.5 Pro pricing ($1.25 / $5.00 per 1M tokens)
        super().__init__(
            provider_name="Google Gemini",
            input_cost_per_1k=0.00125,
            output_cost_per_1k=0.0050
        )
        self.api_key = settings.GEMINI_API_KEY

    async def generate(self, request: LLMGenerateRequest) -> LLMResponse:
        start_time = time.time()

        content = f"Gemini 1.5 Pro deep multimodal synthesis response for: '{request.prompt or 'Enterprise Multi-Agent Pipeline'}'"
        prompt_tokens = self.estimate_tokens(request.prompt or "")
        completion_tokens = self.estimate_tokens(content)

        latency_ms = (time.time() - start_time) * 1000
        total_tokens = prompt_tokens + completion_tokens
        cost = self.calculate_cost(prompt_tokens, completion_tokens)

        return LLMResponse(
            id=f"gemini-{uuid.uuid4().hex[:8]}",
            model_used=request.model if "gemini" in request.model.lower() else "gemini-1.5-pro",
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
        response_text = f"Gemini 1.5 Pro streaming response stream."
        words = response_text.split()
        req_id = f"gemini-stream-{uuid.uuid4().hex[:8]}"

        for i, word in enumerate(words):
            yield StreamChunkResponse(
                id=req_id,
                model="gemini-1.5-pro",
                delta=word + (" " if i < len(words) - 1 else ""),
                finish_reason="stop" if i == len(words) - 1 else None
            )
