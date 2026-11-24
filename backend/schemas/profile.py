from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ProfileOut(BaseModel):
    id: UUID
    email: str
    name: str
    surname: str
    created_at: datetime | None = None


class ProfileUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    surname: str | None = Field(default=None, min_length=1, max_length=100)
