from langgraph.graph import StateGraph
from langgraph.graph.message import add_messages
from pydantic import BaseModel,Field
from typing import TypedDict,Literal,Annotated
from langgraph.types import interrupt,Command
from langgraph.checkpoint.memory import InMemorySaver
from langchain_groq import ChatGroq
from dotenv import load_dotenv
class state(TypedDict):
    messages:Annotated[list,add_messages]
    intent:Literal["normal_chat","summarize_documents",""]