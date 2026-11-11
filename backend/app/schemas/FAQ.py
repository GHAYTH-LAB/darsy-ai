from pydantic import BaseModel,Field
from typing import Literal

class FAQ(BaseModel):
    role:Literal["user","assistant"]
    content:list[str]=Field(min_length=1,description="The content of messages in the FAQ chatbot")
