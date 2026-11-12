import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.routes.Register import router as register_router
from app.routes.login import router as login_router
from app.routes.oAuth import router as oauth_router

app = FastAPI(
    title="Darsy",
    description="An Ai Powered Platform That Helps students via an Ai Agent to Get their couses Done",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(register_router)
app.include_router(login_router)
app.include_router(oauth_router)
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SESSION_SECRET"),
    same_site="lax",
    https_only=False,
)


@app.get("/")
async def home():
    return {"message": "Welcome To Darsy"}
