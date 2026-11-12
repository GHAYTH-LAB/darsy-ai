from sqlalchemy import Column,Integer,String,Boolean,ForeignKey
from app.database import Base
from datetime import datetime
class chat_conversation(Base):
    __tablename__="chat_conversation"
    id=Column(Integer,primary_key=True)
    user_id=Column(Integer,ForeignKey("user.id"),nullable=False)
    username=Column(String,nullable=False,unique=False)
    title=Column(String,nullable=False,unique=False)
