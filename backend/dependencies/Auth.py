from dataclasses import dataclass, field
from functools import lru_cache
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import Client, create_client

from config import settings

bearer_scheme = HTTPBearer(auto_error=False)  # reads "Authorization: Bearer <token>"


@dataclass(frozen=True)
class CurrentUser:
    id: UUID
    email: str = ""
    metadata: dict = field(default_factory=dict)


@lru_cache
def get_supabase() -> Client:
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)


def _unauthorized(detail: str = "Please sign in again.") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def verify_token(token: str) -> CurrentUser:
    """Ask Supabase who owns this access token."""
    try:
        response = get_supabase().auth.get_user(token)
    except Exception:
        raise _unauthorized("Your session has expired. Please sign in again.")

    user = getattr(response, "user", None)
    if user is None:
        raise _unauthorized("Your session has expired. Please sign in again.")

    return CurrentUser(id=UUID(str(user.id)), email=user.email or "", metadata=dict(user.user_metadata or {}))


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> CurrentUser:
    if credentials is None or not credentials.credentials:
        raise _unauthorized()
    return verify_token(credentials.credentials)


def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> CurrentUser | None:
    """Like get_current_user, but anonymous requests (or bad tokens) yield None."""
    if credentials is None or not credentials.credentials:
        return None
    try:
        return verify_token(credentials.credentials)
    except HTTPException:
        return None


def get_current_user_id(user: CurrentUser = Depends(get_current_user)) -> UUID:
    return user.id
