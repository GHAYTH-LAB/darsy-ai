from sqlalchemy import String,Integer,Boolean,ForeignKey,Column
from database import Base
class messages(Base):
    __tablename__="messages"
    id=Column(Integer,unique=True,nullable=False,primary_key=True)
    user=Column(String,ForeignKey("user.id"),nullable=False)
