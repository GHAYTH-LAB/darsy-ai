"""Study sessions: uploaded documents and the chat about them.

Paths match frontend/src/chatApi.js:
  GET    /sessions/{id}/documents
  POST   /sessions/{id}/documents      (multipart, field "file")
  DELETE /sessions/{id}/documents
  POST   /sessions/{id}/chat           {message, history}
"""

import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from config import settings
from database import get_db
from dependencies.Auth import CurrentUser, get_current_user
from models import ChatSession, Document, Message
from schemas.chat import (
    ChatRequest,
    ChatResponse,
    DeleteResult,
    DocumentList,
    DocumentOut,
    MessageOut,
    SessionOut,
)
from services import assistant
from services import documents as doc_service

router = APIRouter(prefix="/sessions", tags=["sessions"])


def _find_session(db: Session, session_id: uuid.UUID, user: CurrentUser) -> ChatSession | None:
    session = db.get(ChatSession, session_id)
    if session is not None and session.user_id != user.id:
        # Don't reveal that someone else's session exists.
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")
    return session


def _require_session(db: Session, session_id: uuid.UUID, user: CurrentUser) -> ChatSession:
    session = _find_session(db, session_id, user)
    if session is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")
    return session


def _get_or_create_session(db: Session, session_id: uuid.UUID, user: CurrentUser) -> ChatSession:
    session = _find_session(db, session_id, user)
    if session is None:
        session = ChatSession(id=session_id, user_id=user.id)
        db.add(session)
        db.flush()
    return session


def _list_documents(db: Session, session_id: uuid.UUID) -> list[Document]:
    return list(db.scalars(select(Document).where(Document.session_id == session_id).order_by(Document.created_at)))


# ------------------------------------------------------------------ sessions


@router.get("", response_model=list[SessionOut])
def list_sessions(db: Session = Depends(get_db), user: CurrentUser = Depends(get_current_user)):
    doc_counts = (
        select(Document.session_id, func.count().label("n")).group_by(Document.session_id).subquery()
    )
    msg_counts = select(Message.session_id, func.count().label("n")).group_by(Message.session_id).subquery()
    rows = db.execute(
        select(ChatSession, func.coalesce(doc_counts.c.n, 0), func.coalesce(msg_counts.c.n, 0))
        .outerjoin(doc_counts, doc_counts.c.session_id == ChatSession.id)
        .outerjoin(msg_counts, msg_counts.c.session_id == ChatSession.id)
        .where(ChatSession.user_id == user.id)
        .order_by(ChatSession.updated_at.desc())
    ).all()
    return [
        SessionOut.model_validate(session).model_copy(update={"document_count": docs, "message_count": msgs})
        for session, docs, msgs in rows
    ]


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(
    session_id: uuid.UUID, db: Session = Depends(get_db), user: CurrentUser = Depends(get_current_user)
):
    session = _require_session(db, session_id, user)
    db.delete(session)
    db.commit()
    doc_service.remove_session_dir(user.id, session_id)


# ----------------------------------------------------------------- documents


@router.get("/{session_id}/documents", response_model=DocumentList)
def list_documents(
    session_id: uuid.UUID, db: Session = Depends(get_db), user: CurrentUser = Depends(get_current_user)
):
    if _find_session(db, session_id, user) is None:
        return DocumentList(documents=[])
    return DocumentList(documents=_list_documents(db, session_id))


@router.post("/{session_id}/documents", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
def upload_document(
    session_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    filename = doc_service.safe_filename(file.filename)
    try:
        ext = doc_service.check_extension(filename)
    except doc_service.UnsupportedFile as exc:
        raise HTTPException(status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, str(exc))

    session = _get_or_create_session(db, session_id, user)
    count = db.scalar(select(func.count()).select_from(Document).where(Document.session_id == session_id))
    if count >= settings.MAX_DOCUMENTS_PER_SESSION:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            f"A session can hold at most {settings.MAX_DOCUMENTS_PER_SESSION} files.",
        )

    document_id = uuid.uuid4()
    path = doc_service.session_dir(user.id, session_id) / f"{document_id}{ext}"
    try:
        size = doc_service.save_stream(file.file, path, settings.max_upload_bytes)
    except doc_service.UploadTooLarge:
        raise HTTPException(
            413, f"{filename} is larger than {settings.MAX_UPLOAD_MB} MB."
        )
    finally:
        file.file.close()

    if size == 0:
        doc_service.remove_file(path)
        raise HTTPException(422, f"{filename} is empty.")

    try:
        text = doc_service.extract_text(path, ext)
    except doc_service.ExtractionFailed as exc:
        doc_service.remove_file(path)
        raise HTTPException(422, str(exc))

    document = Document(
        id=document_id,
        session_id=session.id,
        user_id=user.id,
        filename=filename,
        content_type=file.content_type,
        size_bytes=size,
        storage_path=str(path),
        text_content=text,
        char_count=len(text),
        status="ready" if text else "empty",
    )
    db.add(document)
    if not session.title:
        session.title = filename[:200]
    session.updated_at = func.now()
    try:
        db.commit()
    except Exception:
        db.rollback()
        doc_service.remove_file(path)
        raise
    db.refresh(document)
    return document


@router.delete("/{session_id}/documents", response_model=DeleteResult)
def delete_documents(
    session_id: uuid.UUID, db: Session = Depends(get_db), user: CurrentUser = Depends(get_current_user)
):
    """Called on logout: discard every file of the session."""
    if _find_session(db, session_id, user) is None:
        return DeleteResult(deleted=0)
    documents = _list_documents(db, session_id)
    for document in documents:
        db.delete(document)
    db.commit()
    for document in documents:
        doc_service.remove_file(document.storage_path)
    return DeleteResult(deleted=len(documents))


@router.delete("/{session_id}/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    session_id: uuid.UUID,
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    _require_session(db, session_id, user)
    document = db.get(Document, document_id)
    if document is None or document.session_id != session_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document not found")
    db.delete(document)
    db.commit()
    doc_service.remove_file(document.storage_path)


# ---------------------------------------------------------------------- chat


@router.get("/{session_id}/messages", response_model=list[MessageOut])
def list_messages(
    session_id: uuid.UUID, db: Session = Depends(get_db), user: CurrentUser = Depends(get_current_user)
):
    if _find_session(db, session_id, user) is None:
        return []
    return list(
        db.scalars(select(Message).where(Message.session_id == session_id).order_by(Message.created_at))
    )


@router.post("/{session_id}/chat", response_model=ChatResponse)
def chat(
    session_id: uuid.UUID,
    payload: ChatRequest,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    session = _get_or_create_session(db, session_id, user)
    documents = _list_documents(db, session_id)

    db.add(Message(session_id=session.id, user_id=user.id, role="user", content=payload.message))
    db.commit()

    try:
        answer = assistant.generate_answer(
            session_id=str(session_id),
            user_id=str(user.id),
            message=payload.message,
            history=[assistant.Turn(role=item.role, text=item.text) for item in payload.history],
            documents=[
                assistant.SourceDocument(id=str(d.id), name=d.filename, text=d.text_content) for d in documents
            ],
        )
    except Exception:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "The assistant could not answer right now. Please try again.")

    reply = Message(session_id=session.id, user_id=user.id, role="assistant", content=str(answer))
    db.add(reply)
    session.updated_at = func.now()
    db.commit()
    db.refresh(reply)
    return ChatResponse(answer=reply.content, message_id=reply.id)
