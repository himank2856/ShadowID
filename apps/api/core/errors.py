"""
ShadowID - Error Definitions & Exception Handlers
Team GIGABYTE - Build With Bharat 3.0
"""

from typing import Optional, List, Dict, Any
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse

class ShadowIDException(Exception):
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        field_errors: Optional[List[Dict[str, str]]] = None,
        retryable: bool = False
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.field_errors = field_errors or []
        self.retryable = retryable
        super().__init__(message)

class UnauthorizedException(ShadowIDException):
    def __init__(self, message: str = "Missing or expired session token"):
        super().__init__(
            code="AUTH_UNAUTHORIZED",
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED
        )

class PermissionDeniedException(ShadowIDException):
    def __init__(self, message: str = "Action not permitted by current workspace role"):
        super().__init__(
            code="PERMISSION_DENIED",
            message=message,
            status_code=status.HTTP_403_FORBIDDEN
        )

class ResourceNotFoundException(ShadowIDException):
    def __init__(self, message: str = "Requested resource not found"):
        super().__init__(
            code="RESOURCE_NOT_FOUND",
            message=message,
            status_code=status.HTTP_404_NOT_FOUND
        )

class ConsentRevokedException(ShadowIDException):
    def __init__(self, message: str = "Active DPDP consent has been revoked for this subject"):
        super().__init__(
            code="CONSENT_REVOKED",
            message=message,
            status_code=status.HTTP_403_FORBIDDEN
        )

async def shadowid_exception_handler(request: Request, exc: ShadowIDException) -> JSONResponse:
    request_id = getattr(request.state, "request_id", "req-unknown")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "code": exc.code,
            "message": exc.message,
            "fieldErrors": exc.field_errors,
            "retryable": exc.retryable,
            "requestId": request_id
        }
    )
