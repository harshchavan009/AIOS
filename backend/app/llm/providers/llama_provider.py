import time
import uuid
from typing import AsyncGenerator
from app.llm.base import BaseLLMProvider
from app.schemas.llm import LLMGenerateRequest, LLMResponse, StreamChunkResponse, TokenUsageMetrics


class LlamaProvider(BaseLLMProvider):
    def __init__(self):
        # Llama 3 70B self-hosted infrastructure (Zero per-token cloud API cost)
        super().__init__(
            provider_name="Meta Llama (Self-Hosted)",
            input_cost_per_1k=0.0000,
            output_cost_per_1k=0.0000
        )

    async def generate(self, request: LLMGenerateRequest) -> LLMResponse:
        start_time = time.time()

        content = f"Llama 3 70B Instruct open-weight inference response for: '{request.prompt or 'Enterprise Multi-Agent Pipeline'}'"
        prompt_tokens = self.estimate_tokens(request.prompt or "")
        completion_tokens = self.estimate_tokens(content)

        latency_ms = (time.time() - start_time) * 1000
        total_tokens = prompt_tokens + completion_tokens

        return LLMResponse(
            id=f"llama-{uuid.uuid4().hex[:8]}",
            model_used="llama-3-70b-instruct",
            provider=self.provider_name,
            content=content,
            finish_reason="stop",
            latency_ms=round(latency_ms, 2),
            usage=TokenUsageMetrics(
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                total_tokens=total_tokens,
                estimated_cost_usd=0.0
            ),
            requested_model=request.model
        )

    async def generate_stream(self, request: LLMGenerateRequest) -> AsyncGenerator[StreamChunkResponse, None]:
        response_text = f"Llama 3 70B Instruct streaming inference output."
        words = response_text.split()
        req_id = f"llama-stream-{uuid.uuid4().hex[:8]}"

        for i, word in enumerate(words):
            yield StreamChunkResponse(
                id=req_id,
                model="llama-3-70b-instruct",
                delta=word + (" " if i < len(words) - 1 else ""),
                finish_reason="stop" if i == len(words) - 1 else None
            )
