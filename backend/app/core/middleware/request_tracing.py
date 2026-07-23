import time
import uuid
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.logging import logger


class RequestTracingMiddleware(BaseHTTPMiddleware):
    """
    Middleware for attaching correlation IDs, calculating request latency,
    and structured access logging across all API routes.
    """
    async def dispatch(self, request: Request, call_next):
        correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
        request.state.correlation_id = correlation_id
        
        start_time = time.time()
        
        try:
            response = await call_next(request)
            process_time = (time.time() - start_time) * 1000
            
            response.headers["X-Correlation-ID"] = correlation_id
            response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}"
            
            logger.info(
                f"API Request | Path: {request.method} {request.url.path} | "
                f"Status: {response.status_code} | Duration: {process_time:.2f}ms | CID: {correlation_id}"
            )
            return response
        except Exception as exc:
            process_time = (time.time() - start_time) * 1000
            logger.error(
                f"API Exception | Path: {request.method} {request.url.path} | "
                f"Error: {str(exc)} | Duration: {process_time:.2f}ms | CID: {correlation_id}"
            )
            raise
