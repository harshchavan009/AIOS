import time
import uuid
import httpx
from typing import AsyncGenerator
from app.core.config import settings
from app.core.exceptions import AIOSException
from app.llm.base import BaseLLMProvider
from app.schemas.llm import LLMGenerateRequest, LLMResponse, StreamChunkResponse, TokenUsageMetrics


class OpenAIProvider(BaseLLMProvider):
    def __init__(self):
        # OpenAI GPT-4o estimated pricing ($2.50 / $10.00 per 1M tokens)
        super().__init__(
            provider_name="OpenAI",
            input_cost_per_1k=0.0025,
            output_cost_per_1k=0.0100
        )
        self.api_key = settings.OPENAI_API_KEY

    async def generate(self, request: LLMGenerateRequest) -> LLMResponse:
        start_time = time.time()
        
        # If live API key is provided, perform HTTP call to OpenAI; otherwise fallback to synthetic execution
        if self.api_key and not self.api_key.startswith("sk-mock"):
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json={
                        "model": request.model,
                        "messages": [{"role": "user", "content": request.prompt or ""}],
                        "temperature": request.temperature,
                        "max_tokens": request.max_tokens,
                    },
                    timeout=30.0
                )
                if response.status_code != 200:
                    raise AIOSException(f"OpenAI API Error: {response.text}", status_code=response.status_code)
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                prompt_tokens = data["usage"]["prompt_tokens"]
                completion_tokens = data["usage"]["completion_tokens"]
        else:
            # High-fidelity synthetic fallback response
            content = f"OpenAI [{request.model}] reasoning output for: '{request.prompt or 'Enterprise Multi-Agent Pipeline'}'"
            prompt_tokens = self.estimate_tokens(request.prompt or "")
            completion_tokens = self.estimate_tokens(content)

        latency_ms = (time.time() - start_time) * 1000
        total_tokens = prompt_tokens + completion_tokens
        cost = self.calculate_cost(prompt_tokens, completion_tokens)

        return LLMResponse(
            id=f"openai-{uuid.uuid4().hex[:8]}",
            model_used=request.model,
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
        response_text = f"OpenAI [{request.model}] streaming tokens for request: {request.prompt}"
        words = response_text.split()
        req_id = f"openai-stream-{uuid.uuid4().hex[:8]}"

        for i, word in enumerate(words):
            yield StreamChunkResponse(
                id=req_id,
                model=request.model,
                delta=word + (" " if i < len(words) - 1 else ""),
                finish_reason="stop" if i == len(words) - 1 else None
            )
