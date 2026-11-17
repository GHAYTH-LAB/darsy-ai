import base64
import hashlib
import hmac
import json
import time
from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from config import settings


_bearer_scheme = HTTPBearer(auto_error=False)


def _decode_base64url(value: str) -> bytes:
    """Decode a base64url JWT segment, including omitted padding."""
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(value + padding)


def _unauthorized() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired access token",
        headers={"WWW-Authenticate": "Bearer"},
    )


def decode_access_token(token: str) -> dict[str, Any]:
    """Validate an HS256 JWT and return its claims.

    This uses the configured application secret and intentionally rejects
    other JWT algorithms so a token cannot choose its own verification mode.
    """
    try:
        if settings.ALGORITHM != "HS256":
            raise _unauthorized()

        header_segment, payload_segment, signature_segment = token.split(".")
        header = json.loads(_decode_base64url(header_segment))
        claims = json.loads(_decode_base64url(payload_segment))

        if not isinstance(header, dict) or header.get("alg") != "HS256":
            raise _unauthorized()
        if not isinstance(claims, dict):
            raise _unauthorized()

        signing_input = f"{header_segment}.{payload_segment}".encode("ascii")
        expected_signature = hmac.new(
            settings.SECRET_KEY.encode("utf-8"), signing_input, hashlib.sha256
        ).digest()
        supplied_signature = _decode_base64url(signature_segment)
        if not hmac.compare_digest(expected_signature, supplied_signature):
            raise _unauthorized()

        expiration = claims.get("exp")
        if expiration is None or float(expiration) <= time.time():
            raise _unauthorized()

        if not claims.get("sub"):
            raise _unauthorized()

        return claims
    except HTTPException:
        raise
    except (ValueError, TypeError, KeyError, UnicodeError, json.JSONDecodeError):
        raise _unauthorized() from None


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
) -> dict[str, Any]:
    """FastAPI dependency returning claims for the authenticated user.

    Apply to an endpoint with ``Depends(get_current_user)``. The returned
    claims include the user's ``sub`` identifier and any other signed claims.
    """
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise _unauthorized()
    return decode_access_token(credentials.credentials)
