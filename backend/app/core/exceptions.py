from typing import Any, Dict, Optional
from fastapi import Request, status
from fastapi.responses import JSONResponse
from app.core.logging import logger


class AIOSException(Exception):
    """Base exception for AIOS domain errors."""
    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class BadRequestException(AIOSException):
    def __init__(self, message: str = "Invalid request parameters."):
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class EntityNotFoundException(AIOSException):
    def __init__(self, entity_name: str, entity_id: Any):
        super().__init__(
            message=f"{entity_name} with id '{entity_id}' was not found.",
            status_code=status.HTTP_404_NOT_FOUND
        )


class DuplicateEntityException(AIOSException):
    def __init__(self, entity_name: str, field: str, value: Any):
        super().__init__(
            message=f"{entity_name} with {field} '{value}' already exists.",
            status_code=status.HTTP_409_CONFLICT
        )


class UnauthorizedException(AIOSException):
    def __init__(self, message: str = "Invalid credentials or token expired."):
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED
        )


class ForbiddenException(AIOSException):
    def __init__(self, message: str = "Insufficient permissions to perform this operation."):
        super().__init__(
            message=message,
            status_code=status.HTTP_403_FORBIDDEN
        )


class ValidationException(AIOSException):
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details=details
        )


async def aios_exception_handler(request: Request, exc: AIOSException) -> JSONResponse:
    logger.error(f"AIOS Exception caught: {exc.message} | Path: {request.url.path}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "message": exc.message,
                "status_code": exc.status_code,
                "details": exc.details,
                "path": str(request.url.path)
            }
        }
    )


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception(f"Unhandled Exception: {str(exc)} | Path: {request.url.path}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "message": "An internal server error occurred.",
                "status_code": 500,
                "path": str(request.url.path)
            }
        }
    )
