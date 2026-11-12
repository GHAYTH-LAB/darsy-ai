import os

import httpx
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_PUBLISHABLE_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY")
security = HTTPBearer(auto_error=False)


def _supabase_headers() -> dict[str, str]:
    if not SUPABASE_URL or not SUPABASE_PUBLISHABLE_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase authentication is not configured",
        )
    return {
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Content-Type": "application/json",
    }


async def supabase_auth_request(endpoint: str, payload: dict) -> dict:
    headers = _supabase_headers()
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{SUPABASE_URL.rstrip('/')}/auth/v1/{endpoint}",
                headers=headers,
                json=payload,
            )
    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not communicate with Supabase",
        )

    try:
        result = response.json()
    except ValueError:
        result = {}

    if response.is_error:
        message = result.get("msg") or result.get("message") or result.get("error_description") or "Supabase authentication request failed"
        code = response.status_code
        if endpoint == "token?grant_type=password" and code in (400, 401):
            code = status.HTTP_401_UNAUTHORIZED
        elif endpoint == "signup" and code == 400 and "already registered" in message.lower():
            code = status.HTTP_409_CONFLICT
        raise HTTPException(status_code=code, detail=message)

    return result


async def verify_supabase_token(token: str) -> dict:
    headers = _supabase_headers()
    headers["Authorization"] = f"Bearer {token}"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{SUPABASE_URL.rstrip('/')}/auth/v1/user",
                headers=headers,
            )
    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not communicate with Supabase",
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Supabase token",
        )
    return response.json()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )
    return await verify_supabase_token(credentials.credentials)
