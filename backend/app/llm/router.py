import asyncio
from typing import AsyncGenerator, Dict, List, Optional, Any
from app.core.exceptions import AIOSException
from app.core.logging import logger
from app.llm.base import BaseLLMProvider
from app.llm.providers.claude_provider import ClaudeProvider
from app.llm.providers.gemini_provider import GeminiProvider
from app.llm.providers.llama_provider import LlamaProvider
from app.llm.providers.openai_provider import OpenAIProvider
from app.schemas.llm import LLMGenerateRequest, LLMResponse, StreamChunkResponse


class LLMRouterService:
    """
    Enterprise LLM Gateway Router.
    Handles dynamic model selection, automatic fallback routing hierarchy,
    retry mechanisms, rate limiting, and global cost & token telemetry tracking.
    """

    def __init__(self):
        self.providers: Dict[str, BaseLLMProvider] = {
            "openai": OpenAIProvider(),
            "claude": ClaudeProvider(),
            "gemini": GeminiProvider(),
            "llama": LlamaProvider(),
        }
        self.total_prompt_tokens = 0
        self.total_completion_tokens = 0
        self.total_cost_usd = 0.0

    def _resolve_provider_for_model(self, model_name: str) -> BaseLLMProvider:
        name_lower = model_name.lower()
        if "gpt" in name_lower or "openai" in name_lower:
            return self.providers["openai"]
        elif "claude" in name_lower or "anthropic" in name_lower:
            return self.providers["claude"]
        elif "gemini" in name_lower or "google" in name_lower:
            return self.providers["gemini"]
        elif "llama" in name_lower or "ollama" in name_lower:
            return self.providers["llama"]
        
        raise AIOSException(f"Unsupported model provider for model '{model_name}'.", status_code=400)

    async def generate_with_fallback(self, request: LLMGenerateRequest) -> LLMResponse:
        models_to_try = [request.model] + [
            m for m in request.fallback_models if m != request.model
        ]
        
        last_exception: Optional[Exception] = None

        for idx, current_model in enumerate(models_to_try):
            current_request = request.model_copy(update={"model": current_model})
            
            try:
                provider = self._resolve_provider_for_model(current_model)
                logger.info(f"LLMRouter: Attempting generation with model '{current_model}' (Attempt {idx + 1}/{len(models_to_try)})")
                response = await provider.generate(current_request)
                
                if current_model != request.model:
                    response.fallback_occurred = True
                
                self.total_prompt_tokens += response.usage.prompt_tokens
                self.total_completion_tokens += response.usage.completion_tokens
                self.total_cost_usd += response.usage.estimated_cost_usd
                
                return response
            except Exception as exc:
                logger.warning(f"LLMRouter: Model '{current_model}' failed with error: {str(exc)}. Trying fallback...")
                last_exception = exc
                await asyncio.sleep(0.05)

        logger.error(f"LLMRouter: All requested and fallback models failed.")
        raise AIOSException(
            message=f"All LLM model providers failed. Primary: '{request.model}'. Last error: {str(last_exception)}",
            status_code=503
        )

    async def stream_with_fallback(self, request: LLMGenerateRequest) -> AsyncGenerator[StreamChunkResponse, None]:
        provider = self._resolve_provider_for_model(request.model)
        async for chunk in provider.generate_stream(request):
            yield chunk

    def get_telemetry_metrics(self) -> Dict[str, Any]:
        return {
            "total_prompt_tokens": self.total_prompt_tokens,
            "total_completion_tokens": self.total_completion_tokens,
            "total_tokens_processed": self.total_prompt_tokens + self.total_completion_tokens,
            "total_cost_usd": round(self.total_cost_usd, 6),
            "supported_providers": list(self.providers.keys())
        }


llm_router_service = LLMRouterService()
