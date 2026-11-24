import io
import uuid

import docx
from pptx import Presentation
from pypdf import PdfWriter

from tests.conftest import auth


def _docx_bytes(text: str) -> bytes:
    document = docx.Document()
    document.add_paragraph(text)
    buffer = io.BytesIO()
    document.save(buffer)
    return buffer.getvalue()


def _pptx_bytes(text: str) -> bytes:
    presentation = Presentation()
    slide = presentation.slides.add_slide(presentation.slide_layouts[1])
    slide.shapes.title.text = text
    buffer = io.BytesIO()
    presentation.save(buffer)
    return buffer.getvalue()


def _blank_pdf_bytes() -> bytes:
    writer = PdfWriter()
    writer.add_blank_page(width=200, height=200)
    buffer = io.BytesIO()
    writer.write(buffer)
    return buffer.getvalue()


def upload(client, session_id, name, data, user="alice"):
    return client.post(f"/sessions/{session_id}/documents", files={"file": (name, data)}, headers=auth(user))


# ------------------------------------------------------------------ auth / profile


def test_health(client):
    assert client.get("/").json() == {"status": "ok"}
    assert client.get("/health/db").json() == {"database": "ok"}


def test_requires_auth(client):
    sid = uuid.uuid4()
    assert client.get(f"/sessions/{sid}/documents").status_code == 401
    assert client.get("/me", headers=auth("mallory")).status_code == 401


def test_profile_created_from_metadata_and_updated(client):
    me = client.get("/me", headers=auth("alice")).json()
    assert (me["name"], me["surname"], me["email"]) == ("Alice", "Martin", "alice@example.com")

    bob = client.get("/me", headers=auth("bob")).json()
    assert (bob["name"], bob["surname"]) == ("Bob", "Van Dam")

    updated = client.patch("/me", json={"surname": "  Dupont "}, headers=auth("alice")).json()
    assert (updated["name"], updated["surname"]) == ("Alice", "Dupont")


# ---------------------------------------------------------------------- documents


def test_upload_list_and_discard_documents(client):
    sid = uuid.uuid4()
    assert client.get(f"/sessions/{sid}/documents", headers=auth("alice")).json() == {"documents": []}

    r = upload(client, sid, "notes.txt", b"Photosynthesis converts light into energy.")
    assert r.status_code == 201, r.text
    assert r.json()["name"] == "notes.txt" and r.json()["status"] == "ready"

    assert upload(client, sid, "lecture.docx", _docx_bytes("Mitochondria")).status_code == 201
    r = upload(client, sid, "slides.pptx", _pptx_bytes("Cell biology"))
    assert r.status_code == 201 and r.json()["char_count"] > 0

    docs = client.get(f"/sessions/{sid}/documents", headers=auth("alice")).json()["documents"]
    assert [d["name"] for d in docs] == ["notes.txt", "lecture.docx", "slides.pptx"]

    # session limit (3 in tests)
    assert upload(client, sid, "extra.md", b"# more").status_code == 409

    assert client.delete(f"/sessions/{sid}/documents", headers=auth("alice")).json() == {"deleted": 3}
    assert client.get(f"/sessions/{sid}/documents", headers=auth("alice")).json() == {"documents": []}


def test_upload_rejections(client):
    sid = uuid.uuid4()
    assert upload(client, sid, "virus.exe", b"MZ").status_code == 415
    assert upload(client, sid, "empty.txt", b"").status_code == 422
    assert upload(client, sid, "big.txt", b"a" * (1024 * 1024 + 1)).status_code == 413
    assert upload(client, sid, "broken.pdf", b"not a pdf").status_code == 422

    r = upload(client, sid, "scan.pdf", _blank_pdf_bytes())
    assert r.status_code == 201 and r.json()["status"] == "empty"


def test_delete_single_document(client):
    sid = uuid.uuid4()
    doc_id = upload(client, sid, "a.md", b"# Title").json()["id"]
    assert client.delete(f"/sessions/{sid}/documents/{doc_id}", headers=auth("alice")).status_code == 204
    assert client.delete(f"/sessions/{sid}/documents/{doc_id}", headers=auth("alice")).status_code == 404


def test_sessions_are_private(client):
    sid = uuid.uuid4()
    upload(client, sid, "secret.txt", b"alice only")
    assert client.get(f"/sessions/{sid}/documents", headers=auth("bob")).status_code == 404
    assert upload(client, sid, "x.txt", b"bob", user="bob").status_code == 404
    assert client.post(f"/sessions/{sid}/chat", json={"message": "hi"}, headers=auth("bob")).status_code == 404
    assert client.delete(f"/sessions/{sid}", headers=auth("bob")).status_code == 404


# --------------------------------------------------------------------------- chat


def test_chat_stores_messages_and_lists_sessions(client):
    sid = uuid.uuid4()
    upload(client, sid, "bio.txt", b"Cells are the unit of life.")
    history = [{"id": "x", "role": "assistant", "text": "Added 1 file"}, {"role": "user", "text": "", "error": False}]
    r = client.post(f"/sessions/{sid}/chat", json={"message": "  Summarize  ", "history": history}, headers=auth("alice"))
    assert r.status_code == 200, r.text
    assert "bio.txt" in r.json()["answer"]

    messages = client.get(f"/sessions/{sid}/messages", headers=auth("alice")).json()
    assert [(m["role"], m["content"]) for m in messages][0] == ("user", "Summarize")
    assert messages[1]["role"] == "assistant"

    sessions = client.get("/sessions", headers=auth("alice")).json()
    assert sessions[0]["id"] == str(sid)
    assert (sessions[0]["document_count"], sessions[0]["message_count"], sessions[0]["title"]) == (1, 2, "bio.txt")

    assert client.post(f"/sessions/{sid}/chat", json={"message": "   "}, headers=auth("alice")).status_code == 422

    assert client.delete(f"/sessions/{sid}", headers=auth("alice")).status_code == 204
    assert client.get("/sessions", headers=auth("alice")).json() == []


# ----------------------------------------------------------------------- feedback


def test_suggestions(client):
    body = {"name": "Sara", "surname": "B", "email": "", "message": "Dark mode please"}
    assert client.post("/suggestions", json=body).status_code == 201
    assert client.post("/suggestions", json={**body, "email": "nope"}).status_code == 422
    assert client.post("/suggestions", json={**body, "message": "  "}).status_code == 422


def test_help_center(client):
    r = client.post("/help", json={"message": "My upload says the file is too large", "history": []})
    assert r.status_code == 200 and r.json()["topic"] == "file_size"
    assert client.post("/help", json={"message": "I can't login with Google"}).json()["topic"] == "sign_in"
    assert client.post("/help", json={"message": "I remember nothing"}).json()["topic"] is None
