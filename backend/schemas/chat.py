from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

MAX_MESSAGE_CHARS = 8000
MAX_HISTORY_ITEMS = 50


class DocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str = Field(validation_alias="filename")
    content_type: str | None
    size_bytes: int
    char_count: int
    status: str
    created_at: datetime | None = None


class DocumentList(BaseModel):
    documents: list[DocumentOut]


class DeleteResult(BaseModel):
    deleted: int


class HistoryItem(BaseModel):
    """One bubble the UI already shows. Extra UI fields (id, error, ...) are ignored."""

    model_config = ConfigDict(extra="ignore")

    role: Literal["user", "assistant"]
    text: str = ""
    error: bool = False


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=MAX_MESSAGE_CHARS)
    history: list[HistoryItem] = Field(default_factory=list)

    @field_validator("message")
    @classmethod
    def strip_message(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Message cannot be empty")
        return value

    @field_validator("history")
    @classmethod
    def keep_recent_history(cls, value: list[HistoryItem]) -> list[HistoryItem]:
        return [item for item in value if not item.error and item.text.strip()][-MAX_HISTORY_ITEMS:]


class ChatResponse(BaseModel):
    answer: str
    message_id: UUID


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    role: str
    content: str
    created_at: datetime | None = None


class SessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str | None
    created_at: datetime | None = None
    updated_at: datetime | None = None
    document_count: int = 0
    message_count: int = 0
