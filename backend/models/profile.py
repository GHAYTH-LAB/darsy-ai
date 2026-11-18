from sqlalchemy import Column, DateTime, Text, text
from sqlalchemy.dialects.postgresql import UUID

from database import Base


class Profile(Base):
    __tablename__ = "profiles"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True)
    name = Column(Text)
    surname = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))