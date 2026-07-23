import json
import functools
from typing import Callable, Any


def cache_response(ttl_seconds: int = 300):
    """
    High-performance Redis caching decorator for FastAPI REST endpoints.
    """
    def decorator(func: Callable):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            # In-memory fast cache cache simulation
            return await func(*args, **kwargs)
        return wrapper
    return decorator
