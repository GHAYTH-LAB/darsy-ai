from fastapi import APIRouter

from app.schemas.auth import User_login
from app.security import supabase_auth_request

router = APIRouter(prefix="/auth", tags=["Authorization"])


@router.post("/login")
async def login(user: User_login):
    return await supabase_auth_request(
        "token?grant_type=password",
        {"email": str(user.email), "password": user.password},
    )
