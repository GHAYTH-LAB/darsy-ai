from fastapi import APIRouter, status

from app.schemas.auth import User_register
from app.security import supabase_auth_request

router = APIRouter(prefix="/auth", tags=["Authorization"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user: User_register):
    return await supabase_auth_request(
        "signup",
        {
            "email": str(user.email),
            "password": user.password,
            "data": {"name": user.name, "surname": user.surname},
        },
    )
