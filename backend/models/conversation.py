from sqlalchemy import Integer,String,Boolean,Uuid,func,ForeignKey
from sqlalchemy.orm import Mapped,mapped_column,DeclarativeBase
from datetime import datetime
class Base(DeclarativeBase):
    pass

class Conversation(Base):
    user:Mapped[str]=mapped_column(String(100),nullable=False)
    id:Mapped[Uuid]=mapped_column(primary_key=True,nullable=False)
    created_at:Mapped[datetime]=mapped_column(server_default=func.now())
    