from fastapi import APIRouter, Depends
from app.security import get_current_user

router = APIRouter(prefix="/oauth", tags=["OAuth"])


@router.get("/me")
async def get_oauth_user(current_user: dict = Depends(get_current_user)):
    metadata = current_user.get("user_metadata") or {}
    return {
        "id": current_user["id"],
        "email": current_user.get("email"),
        "name": current_user.get("name") or metadata.get("full_name") or metadata.get("name"),
        "avatar": current_user.get("avatar_url") or metadata.get("avatar_url") or metadata.get("picture"),
        "message": "OAuth authentication successful",
    }