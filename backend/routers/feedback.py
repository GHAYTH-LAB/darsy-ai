from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database import get_db
from dependencies.Auth import CurrentUser, get_optional_user
from models import Suggestion, SupportRequest
from schemas.feedback import HelpRequest, HelpResponse, SuggestionCreate, SuggestionOut
from services import help_center

router = APIRouter(tags=["feedback"])


@router.post("/suggestions", response_model=SuggestionOut, status_code=status.HTTP_201_CREATED)
def create_suggestion(
    payload: SuggestionCreate,
    db: Session = Depends(get_db),
    user: CurrentUser | None = Depends(get_optional_user),
):
    suggestion = Suggestion(
        user_id=user.id if user else None,
        name=payload.name,
        surname=payload.surname,
        email=str(payload.email) if payload.email else None,
        message=payload.message,
    )
    db.add(suggestion)
    db.commit()
    db.refresh(suggestion)
    return suggestion


@router.post("/help", response_model=HelpResponse)
def ask_help_center(
    payload: HelpRequest,
    db: Session = Depends(get_db),
    user: CurrentUser | None = Depends(get_optional_user),
):
    answer, topic = help_center.answer(payload.message)
    db.add(SupportRequest(user_id=user.id if user else None, question=payload.message, answer=answer, matched_topic=topic))
    db.commit()
    return HelpResponse(answer=answer, topic=topic)
