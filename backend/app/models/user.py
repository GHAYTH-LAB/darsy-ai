from sqlalchemy import Column,String,Integer,Boolean
from database import Base
class User(Base):
    __tablename__="user"
    id=Column(Integer,primary_key=True)
    email=Column(String,unique=True,index=True,nullable=True)
    name=Column(String,index=True)
    surname=Column(String,index=True)
    password_hashed=Column(String,index=True,nullable=False)
    