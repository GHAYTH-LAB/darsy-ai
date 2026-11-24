from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from config import settings
from database import SessionLocal, engine, init_db
from routers.feedback import router as feedback_router
from routers.profile import router as profile_router
from routers.sessions import router as sessions_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    yield
    engine.dispose()


app = FastAPI(title=settings.APP_NAME, debug=settings.DEBUG, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(profile_router)
app.include_router(sessions_router)
app.include_router(feedback_router)


@app.get("/", tags=["health"])
def health():
    return {"status": "ok"}


@app.get("/health/db", tags=["health"])
def database_health():
    with SessionLocal() as db:
        db.execute(text("SELECT 1"))
    return {"database": "ok"}
