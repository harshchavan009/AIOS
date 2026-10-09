import time
from collections import defaultdict
from typing import Dict, List
from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.config import settings
from app.core.logging import logger

class RateLimiterMiddleware(BaseHTTPMiddleware):
    """
    Sliding-window rate limiter protecting public endpoints against abuse and brute-force attacks.
    Uses in-memory sliding window with Redis readiness.
    """
    requests: Dict[str, List[float]] = defaultdict(list)
    clean_interval: float = 60.0
    last_clean: float = time.time()

    def __init__(self, app):
        super().__init__(app)

    @classmethod
    def reset(cls):
        cls.requests.clear()
        cls.last_clean = time.time()

    def _cleanup_old_records(self, now: float):
        if now - self.last_clean > self.clean_interval:
            cutoff = now - 120.0
            keys_to_delete = []
            for k, timestamps in list(self.requests.items()):
                self.requests[k] = [t for t in timestamps if t > cutoff]
                if not self.requests[k]:
                    keys_to_delete.append(k)
            for k in keys_to_delete:
                self.requests.pop(k, None)
            self.last_clean = now

    def _get_rate_limit(self, path: str) -> tuple[int, int]:
        """Returns (max_requests, window_seconds) based on endpoint sensitivity."""
        # Sensitive Auth endpoints: strict 10 requests/min to prevent brute-force attacks
        if any(path.startswith(p) for p in [
            "/api/v1/auth/login",
            "/api/v1/auth/register",
            "/api/v1/auth/forgot-password",
            "/api/v1/auth/reset-password",
            "/api/v1/auth/oauth"
        ]):
            return (10, 60)
        # Heavy AI / LLM / RAG endpoints: moderate 30 requests/min to protect billing and compute
        elif any(path.startswith(p) for p in [
            "/api/v1/agents/execute",
            "/api/v1/llm/generate",
            "/api/v1/rag/upload",
            "/api/v1/rag/query",
            "/api/v1/tools/execute"
        ]):
            return (30, 60)
        # General API routes: 120 requests/min
        elif path.startswith("/api/v1/"):
            return (120, 60)
        return (600, 60)  # Documentation / static

    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        # Bypass rate limiting for health, readiness, docs, static assets, and OPTIONS preflight
        if (
            path in ("/healthz", "/readyz", "/docs", "/redoc", "/openapi.json")
            or path.startswith("/api/v1/health")
            or path.startswith("/assets")
            or request.method == "OPTIONS"
        ):
            return await call_next(request)

        # Determine identifier: Bearer token hash (per-user) or Client IP (per-IP)
        import hashlib
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token_val = auth_header[7:].strip()
            client_id = f"usr_{hashlib.sha256(token_val.encode()).hexdigest()[:16]}"
        else:
            forwarded_for = request.headers.get("X-Forwarded-For")
            if forwarded_for:
                client_ip = forwarded_for.split(",")[0].strip()
            else:
                client_ip = request.client.host if request.client else "unknown_client"
            client_id = f"ip_{client_ip}"

        key = f"{client_id}:{path}"
        max_reqs, window = self._get_rate_limit(path)
        now = time.time()
        self._cleanup_old_records(now)

        timestamps = self.requests[key]
        cutoff = now - window
        active_timestamps = [t for t in timestamps if t > cutoff]

        if len(active_timestamps) >= max_reqs:
            retry_after = int(window - (now - active_timestamps[0])) + 1
            if retry_after <= 0:
                retry_after = 1
            logger.warning(f"Rate limit exceeded for {client_id} on {path}. Retry after {retry_after}s.")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": f"Too many requests. Please retry after {retry_after} seconds.",
                    "error": {
                        "message": "Rate limit exceeded.",
                        "status_code": 429,
                        "retry_after_seconds": retry_after
                    }
                },
                headers={"Retry-After": str(retry_after)}
            )

        active_timestamps.append(now)
        self.requests[key] = active_timestamps

        return await call_next(request)
