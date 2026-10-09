from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware applying OWASP recommended security headers to all HTTP responses
    and stripping server fingerprinting headers.
    """
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        # Strip server fingerprinting headers
        if "server" in response.headers:
            del response.headers["server"]
        if "x-powered-by" in response.headers:
            del response.headers["x-powered-by"]

        # Strict security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), payment=()"
        response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
        response.headers["X-XSS-Protection"] = "1; mode=block"

        return response
