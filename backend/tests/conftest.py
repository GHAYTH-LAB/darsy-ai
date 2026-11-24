import os
import sys
import tempfile
import uuid
from pathlib import Path

import pytest

# Configure an isolated SQLite database and upload folder before the app is imported.
_tmp = Path(tempfile.mkdtemp(prefix="darsy-tests-"))
os.environ["DATABASE_URL"] = f"sqlite:///{(_tmp / 'test.db').as_posix()}"
os.environ["SUPABASE_URL"] = "https://example.supabase.co"
os.environ["SUPABASE_ANON_KEY"] = "test-anon-key"
os.environ["UPLOAD_DIR"] = str(_tmp / "uploads")
os.environ["MAX_UPLOAD_MB"] = "1"
os.environ["MAX_DOCUMENTS_PER_SESSION"] = "3"

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient  # noqa: E402

from database import Base, engine  # noqa: E402
from dependencies.Auth import CurrentUser, bearer_scheme, get_current_user, get_optional_user  # noqa: E402
from main import app  # noqa: E402

ALICE = CurrentUser(id=uuid.UUID("11111111-1111-1111-1111-111111111111"), email="alice@example.com",
                    metadata={"first_name": "Alice", "last_name": "Martin"})
BOB = CurrentUser(id=uuid.UUID("22222222-2222-2222-2222-222222222222"), email="bob@example.com",
                  metadata={"full_name": "Bob Van Dam"})
USERS = {"alice": ALICE, "bob": BOB}


from fastapi import Depends, HTTPException  # noqa: E402


def _current(credentials=Depends(bearer_scheme)):
    if credentials is None or credentials.credentials not in USERS:
        raise HTTPException(401, "Please sign in again.")
    return USERS[credentials.credentials]


def _optional(credentials=Depends(bearer_scheme)):
    return USERS.get(credentials.credentials) if credentials else None


@pytest.fixture()
def client():
    app.dependency_overrides[get_current_user] = _current
    app.dependency_overrides[get_optional_user] = _optional
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


def auth(name: str) -> dict:
    return {"Authorization": f"Bearer {name}"}
