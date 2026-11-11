from fastapi import APIRouter,HTTPException,status,Depends
from sqlalchemy.orm import Session

from app.schemas.auth import User_register,User_login,TokenResponse
from app.models.user import User

from app.security import hash_password,verify_access_token,verify_password
router=APIRouter(prefix="/auth",tags=["Authenthication"])
@router.post()
def register(new_user:User_register,db:Session=Depends(get))