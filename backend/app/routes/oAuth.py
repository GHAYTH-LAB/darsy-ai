from fastapi import APIRouter, Depends
from app.security import get_current_user

router = APIRouter(prefix="/oauth", tags=["OAuth"])


@router.get("/me")
async def get_oauth_user(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "email": current_user.get("email"),
        "name": current_user.get("name"),
        "avatar": current_user.get("avatar"),
        "message": "OAuth authentication successful",
    }