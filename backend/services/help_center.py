"""Rule-based answers for the Help Center widget ("Ask about errors on the platform")."""

import re
from dataclasses import dataclass

from config import settings


@dataclass(frozen=True)
class Topic:
    key: str
    keywords: tuple[str, ...]
    answer: str


TOPICS: tuple[Topic, ...] = (
    Topic(
        "sign_in",
        ("sign in", "signin", "log in", "login", "password", "session expired", "sign in again",
         "401", "unauthorized", "token", "google", "github", "oauth", "confirm", "verification"),
        "Sign-in problems: make sure you confirmed your email (check spam for the Supabase message), "
        "then sign out and sign in again. If Google or GitHub sign-in loops back to the login page, "
        "allow pop-ups and third-party cookies for this site. A message saying your session expired "
        "means you were idle too long: sign in again and retry.",
    ),
    Topic(
        "file_type",
        ("unsupported", "file type", "format", "extension", "doc", ".doc", "image", "png", "jpg", "xlsx", "excel"),
        "Darsy accepts PDF, DOCX, PPTX, TXT, MD, CSV, HTML, JSON and XML files. Older .doc/.ppt files "
        "and images aren't supported yet; export them to PDF first.",
    ),
    Topic(
        "file_size",
        ("too large", "too big", "size", "limit", "413", "mb"),
        f"Each file can be up to {settings.MAX_UPLOAD_MB} MB and a session holds up to "
        f"{settings.MAX_DOCUMENTS_PER_SESSION} files. Split large PDFs or compress them before uploading.",
    ),
    Topic(
        "empty_text",
        ("no text", "empty", "scanned", "can't read", "cannot read", "could not read", "blank", "corrupt"),
        "If Darsy can't find any text, the file is probably a scanned image or password-protected. "
        "Run OCR on scanned PDFs (or export them again with selectable text) and remove the password, then upload again.",
    ),
    Topic(
        "upload",
        ("upload", "drop", "drag", "done", "files not", "file not", "not showing", "in context"),
        "To add files: drop them on the upload card (or click it), check the list, then press Done. "
        "The chat header shows how many files are in context. If nothing appears, refresh the page; "
        "if you see an error under the upload card, it tells you which file failed and why.",
    ),
    Topic(
        "chat",
        ("chat", "answer", "reply", "respond", "assistant", "agent", "thinking", "stuck", "wrong"),
        "If the assistant doesn't answer, check that at least one file is in context, then send the "
        "question again. Answers only use the files from your current session, so re-upload them after you sign out.",
    ),
    Topic(
        "network",
        ("network", "failed to fetch", "offline", "connection", "server", "500", "502", "503", "timeout", "slow"),
        "This looks like a connection problem. Check your internet connection and refresh the page. "
        "If it keeps happening, the server may be restarting; wait a minute and try again.",
    ),
    Topic(
        "account",
        ("delete my", "account", "name", "profile", "privacy", "data"),
        "Your name comes from your sign-up details or your Google/GitHub account. Files you upload are "
        "deleted when you sign out. For anything else about your account, send a note through the suggestion form below.",
    ),
    Topic(
        "timer",
        ("timer", "study time", "pomodoro", "clock"),
        "The study timer runs in your browser and resets every day. It keeps counting only while the Darsy tab is open.",
    ),
)

FALLBACK = (
    "I couldn't match that to a known problem. Please describe what you clicked and the exact error "
    "message you see. You can also send the details through the suggestion form at the bottom of the page."
)
GREETING = "Hi! Describe the error you're seeing (for example: 'upload failed' or 'can't sign in') and I'll help."


def _normalise(text: str) -> str:
    return " " + re.sub(r"\s+", " ", text.lower()) + " "


def _contains(text: str, keyword: str) -> bool:
    return re.search(r"(?<!\w)" + re.escape(keyword) + r"(?!\w)", text) is not None


def answer(message: str) -> tuple[str, str | None]:
    text = _normalise(message)
    if re.fullmatch(r"\s*(hi|hello|hey|salut|bonjour|salam)[!. ]*", text.strip()):
        return GREETING, "greeting"

    best, best_score = None, 0
    for topic in TOPICS:
        score = sum(1 for keyword in topic.keywords if _contains(text, keyword))
        if score > best_score:
            best, best_score = topic, score

    if best is None:
        return FALLBACK, None
    return best.answer, best.key
