"""Bridge between the chat endpoint and the AI agent.

The backend calls `generate_answer` for every chat message. Plug the LangGraph
agent / RAG pipeline (agent/agent.py) in here; everything else (auth, sessions,
documents, message history) is already handled by the API.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class SourceDocument:
    id: str
    name: str
    text: str


@dataclass(frozen=True)
class Turn:
    role: str  # "user" | "assistant"
    text: str


def generate_answer(
    *,
    session_id: str,
    user_id: str,
    message: str,
    history: list[Turn],
    documents: list[SourceDocument],
) -> str:
    """Return the assistant's reply. Replace the body with the real agent call."""
    if not documents:
        return "Add your course files and press Done first, so I can answer from them."

    names = ", ".join(doc.name for doc in documents)
    return (
        "The AI assistant is not connected yet. "
        f"Your question was received along with {len(documents)} file(s): {names}."
    )
