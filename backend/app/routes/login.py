from fastapi import APIRouter,HTTPException,status,Depends
from sqlalchemy.orm import Session

from app.schemas.auth import User_login,TokenResponse
from app.models.user import User
from security import verify_password,create_access_token

from database import get_db

router=APIRouter(prefix="/auth",tags=["Authorization"])
@router.post("/login")
async def login(user:User_login,db:Session=Depends(get_db)):
    if db.query(User).filter(User.email==user.email).first():
        existing_user=db.query(User).filter(User.email==user.email).first()
        if verify_password(user.password,existing_user.password_hashed):
            token=create_access_token(existing_user.user_id)
            return TokenResponse(
                access_token=token
                ,token="bearer"
            )
        else:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="The password or mail is invalid")
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail=" There is no account with this mail")
    

