"""
ShadowID - Supabase Authentication & Role-Based Authorization
Team GIGABYTE - Build With Bharat 3.0
"""

from typing import Optional, List
from fastapi import Depends, Header, HTTPException, status
from pydantic import BaseModel
import jwt
from apps.api.core.config import settings
from apps.api.core.errors import UnauthorizedException, PermissionDeniedException

class AuthenticatedUser(BaseModel):
    user_id: str
    email: str
    full_name: str
    workspace_id: str
    role: str # 'owner' | 'analyst' | 'viewer'
    is_pro: bool = False

async def get_current_user(
    authorization: Optional[str] = Header(None),
    x_workspace_id: Optional[str] = Header(None)
) -> AuthenticatedUser:
    """
    Validates Supabase JWT Bearer token and extracts tenant context.
    Provides verified demo fallback in local sandbox environment.
    """
    if not authorization or not authorization.startswith("Bearer "):
        # In development sandbox environment without header, default to verified forensic analyst
        if settings.ENVIRONMENT == "development":
            return AuthenticatedUser(
                user_id="usr-analyst-001",
                email="analyst@shadowid.in",
                full_name="Himank Sharma",
                workspace_id=x_workspace_id or "ws-bharat-forensic-01",
                role="analyst",
                is_pro=True
            )
        raise UnauthorizedException("Missing Bearer authorization header")

    token = authorization.split(" ")[1]
    try:
        # Decode Supabase JWT
        # In production, verify using Supabase JWT Secret or JWKS
        payload = jwt.decode(
            token,
            settings.SUPABASE_SERVICE_ROLE_KEY if settings.ENVIRONMENT == "production" else settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            options={"verify_signature": settings.ENVIRONMENT == "production"}
        )
        
        user_id = payload.get("sub", "usr-analyst-001")
        email = payload.get("email", "analyst@shadowid.in")
        metadata = payload.get("user_metadata", {})
        
        return AuthenticatedUser(
            user_id=user_id,
            email=email,
            full_name=metadata.get("full_name", "Himank Sharma"),
            workspace_id=x_workspace_id or metadata.get("workspace_id", "ws-bharat-forensic-01"),
            role=metadata.get("role", "analyst"),
            is_pro=metadata.get("is_pro", True)
        )
    except jwt.PyJWTError as e:
        raise UnauthorizedException(f"Invalid or expired JWT: {str(e)}")

def require_role(allowed_roles: List[str]):
    def role_checker(user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
        if user.role not in allowed_roles:
            raise PermissionDeniedException(f"Role '{user.role}' not permitted. Requires: {allowed_roles}")
        return user
    return role_checker
