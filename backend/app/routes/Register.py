from fastapi import APIRouter,HTTPException,Depends,status
from sqlalchemy.orm import Session

from app.schemas.auth import User_register,User_login,TokenResponse
from app.models.user import User
import uuid
from security import hash_password,verify_password,create_access_token,verify_access_token
from database import get_db
router=APIRouter(prefix="/auth",tags=["Authorization"])

@router.post("/register")
async def register(user:User_register,db:Session=Depends(get_db)):
    if db.query(User).filter(User.email==user.email).first():
        raise HTTPException(status_code=409)
    else:
        new_user=User(
            email=user.email
            ,name=user.name
            ,surname=user.surname
            ,password_hashed=hash_password(user.password)
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
