from pydantic import BaseModel,Field
from typing import Literal
class chat_conversation(BaseModel):
    role:Literal["user","assistant"]
    content:list[str]=Field(description="The History of messages inside the chat")
