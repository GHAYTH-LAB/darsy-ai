from fastapi import APIRouter,Depends,HTTPException
from database import get_db
from dependencies.Auth import get_current_user

from schemas.user import UserBase,Usercreate,UserResponse
from schemas.messages import  ConversationInput,ConversationBase,ConversationOutput
from sqlalchemy.orm import Session

from models.conversation import  Conversation
from models.profile import Profile

router=APIRouter(prefix="FAQ",tags=["chat"])
@router.post("send message",responde_model=ConversationOutput)
def chat(db:Session=Depends(get_db)
         ,user=Depends(get_current_user)):
    conversation=Conversation(id=user.id,user=user.name)
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation
