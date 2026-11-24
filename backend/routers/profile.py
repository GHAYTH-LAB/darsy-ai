from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from dependencies.Auth import CurrentUser, get_current_user
from models import Profile
from schemas.profile import ProfileOut, ProfileUpdate

router = APIRouter(prefix="/me", tags=["profile"])


def _names_from_metadata(metadata: dict) -> tuple[str, str]:
    """Same rules as frontend/src/authProfile.js (email sign-up, Google and GitHub)."""
    full = str(metadata.get("full_name") or metadata.get("name") or "").strip()
    parts = full.split()
    name = metadata.get("first_name") or metadata.get("given_name") or (parts[0] if parts else "")
    surname = (
        metadata.get("last_name") or metadata.get("surname") or metadata.get("family_name") or " ".join(parts[1:])
    )
    return str(name or "").strip(), str(surname or "").strip()


def get_or_create_profile(db: Session, user: CurrentUser) -> Profile:
    profile = db.get(Profile, user.id)
    if profile is None:
        name, surname = _names_from_metadata(user.metadata)
        profile = Profile(id=user.id, name=name or None, surname=surname or None)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


def _out(profile: Profile, user: CurrentUser) -> ProfileOut:
    return ProfileOut(
        id=profile.id,
        email=user.email,
        name=profile.name or "",
        surname=profile.surname or "",
        created_at=profile.created_at,
    )


@router.get("", response_model=ProfileOut)
def read_me(db: Session = Depends(get_db), user: CurrentUser = Depends(get_current_user)):
    """Return the signed-in user's profile, creating it on first visit."""
    return _out(get_or_create_profile(db, user), user)


@router.patch("", response_model=ProfileOut)
def update_me(
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    profile = get_or_create_profile(db, user)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, value.strip() if isinstance(value, str) else value)
    db.commit()
    db.refresh(profile)
    return _out(profile, user)
