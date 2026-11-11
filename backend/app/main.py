from fastapi import FastAPI,HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.routes.
app=FastAPI(title="Darsy",description="An Ai Powered Platform That Helps students via an Ai Agent to Get their couses Done",version="1.0.0")
app.add_middleware(
    CORSMiddleware
    ,allow_origins=["http://localhost:5173/"]
    ,allow_credentials=True
    ,allow_methods=["*"]
    ,allow_headers=["+"]
)
app.include_router()