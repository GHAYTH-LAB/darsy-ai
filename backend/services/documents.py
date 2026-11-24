"""Saving uploaded course files and turning them into plain text."""

import csv
import io
import json
import re
import shutil
import uuid
from html.parser import HTMLParser
from pathlib import Path
from typing import BinaryIO

from config import settings

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".pptx", ".txt", ".md", ".csv", ".html", ".htm", ".json", ".xml"}
_CHUNK = 1024 * 1024


class UploadTooLarge(Exception):
    pass


class UnsupportedFile(Exception):
    pass


class ExtractionFailed(Exception):
    pass


def safe_filename(name: str | None) -> str:
    name = Path(name or "document").name  # drop any client-supplied directories
    name = re.sub(r"[^\w.\- ()]+", "_", name).strip(" .")
    return (name or "document")[:200]


def extension_of(filename: str) -> str:
    return Path(filename).suffix.lower()


def check_extension(filename: str) -> str:
    ext = extension_of(filename)
    if ext not in ALLOWED_EXTENSIONS:
        allowed = ", ".join(sorted(ALLOWED_EXTENSIONS))
        raise UnsupportedFile(f"{filename}: unsupported file type. Allowed: {allowed}")
    return ext


def session_dir(user_id: uuid.UUID, session_id: uuid.UUID) -> Path:
    return Path(settings.UPLOAD_DIR) / str(user_id) / str(session_id)


def save_stream(source: BinaryIO, destination: Path, max_bytes: int) -> int:
    """Copy an upload to disk in chunks, refusing anything above max_bytes."""
    destination.parent.mkdir(parents=True, exist_ok=True)
    written = 0
    try:
        with destination.open("wb") as out:
            while chunk := source.read(_CHUNK):
                written += len(chunk)
                if written > max_bytes:
                    raise UploadTooLarge
                out.write(chunk)
    except BaseException:
        destination.unlink(missing_ok=True)
        raise
    return written


def remove_file(path: str | Path) -> None:
    Path(path).unlink(missing_ok=True)


def remove_session_dir(user_id: uuid.UUID, session_id: uuid.UUID) -> None:
    shutil.rmtree(session_dir(user_id, session_id), ignore_errors=True)


# ---------------------------------------------------------------- text extraction


class _HTMLText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts: list[str] = []
        self._skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style"):
            self._skip += 1

    def handle_endtag(self, tag):
        if tag in ("script", "style") and self._skip:
            self._skip -= 1
        elif tag in ("p", "div", "br", "li", "h1", "h2", "h3", "h4", "h5", "h6", "tr"):
            self.parts.append("\n")

    def handle_data(self, data):
        if not self._skip:
            self.parts.append(data)


def _decode(data: bytes) -> str:
    for encoding in ("utf-8-sig", "utf-16", "cp1252"):
        try:
            return data.decode(encoding)
        except UnicodeDecodeError:
            continue
    return data.decode("utf-8", errors="replace")


def _pdf(path: Path) -> str:
    from pypdf import PdfReader

    reader = PdfReader(str(path))
    pages = []
    for number, page in enumerate(reader.pages, start=1):
        text = (page.extract_text() or "").strip()
        if text:
            pages.append(f"[Page {number}]\n{text}")
    return "\n\n".join(pages)


def _docx(path: Path) -> str:
    import docx

    document = docx.Document(str(path))
    parts = [p.text for p in document.paragraphs if p.text.strip()]
    for table in document.tables:
        for row in table.rows:
            cells = [cell.text.strip() for cell in row.cells]
            if any(cells):
                parts.append(" | ".join(cells))
    return "\n".join(parts)


def _pptx(path: Path) -> str:
    from pptx import Presentation

    slides = []
    for number, slide in enumerate(Presentation(str(path)).slides, start=1):
        texts = []
        for shape in slide.shapes:
            if getattr(shape, "has_text_frame", False) and shape.text_frame.text.strip():
                texts.append(shape.text_frame.text.strip())
            if getattr(shape, "has_table", False):
                for row in shape.table.rows:
                    texts.append(" | ".join(cell.text.strip() for cell in row.cells))
        if slide.has_notes_slide and slide.notes_slide.notes_text_frame.text.strip():
            texts.append("Notes: " + slide.notes_slide.notes_text_frame.text.strip())
        if texts:
            slides.append(f"[Slide {number}]\n" + "\n".join(texts))
    return "\n\n".join(slides)


def _html(path: Path) -> str:
    parser = _HTMLText()
    parser.feed(_decode(path.read_bytes()))
    return "".join(parser.parts)


def _json(path: Path) -> str:
    raw = _decode(path.read_bytes())
    try:
        return json.dumps(json.loads(raw), indent=2, ensure_ascii=False)
    except json.JSONDecodeError:
        return raw


def _csv(path: Path) -> str:
    rows = csv.reader(io.StringIO(_decode(path.read_bytes())))
    return "\n".join(" | ".join(row) for row in rows)


def _plain(path: Path) -> str:
    return _decode(path.read_bytes())


_EXTRACTORS = {
    ".pdf": _pdf,
    ".docx": _docx,
    ".pptx": _pptx,
    ".html": _html,
    ".htm": _html,
    ".json": _json,
    ".csv": _csv,
    ".txt": _plain,
    ".md": _plain,
    ".xml": _plain,
}


def extract_text(path: Path, ext: str) -> str:
    try:
        text = _EXTRACTORS[ext](path)
    except Exception as exc:  # corrupt / password-protected / mislabeled files
        raise ExtractionFailed(f"{path.name}: could not read this file ({exc.__class__.__name__}).") from exc
    text = text.replace("\x00", "")  # Postgres text columns reject NUL bytes
    text = re.sub(r"[ \t]+\n", "\n", text)
    return re.sub(r"\n{3,}", "\n\n", text).strip()
