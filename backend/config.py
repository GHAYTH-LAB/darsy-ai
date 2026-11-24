from functools import lru_cache
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent


class Settings(BaseSettings):
    APP_NAME: str = "Darsy API"
    DEBUG: bool = False

    # Comma-separated list of origins allowed to call the API.
    FRONTEND_URLS: str = "http://localhost:5173,http://127.0.0.1:5173"

    # Postgres connection string (Supabase: Project Settings > Database > Connection string).
    DATABASE_URL: str

    # Supabase project used to verify the access tokens sent by the frontend.
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str

    # Uploaded course files.
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    MAX_UPLOAD_MB: int = 20
    MAX_DOCUMENTS_PER_SESSION: int = 20

    # Reserved for the AI agent (not used by the backend itself).
    LLM_API_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @field_validator("DATABASE_URL")
    @classmethod
    def use_psycopg3_driver(cls, value: str) -> str:
        # Supabase hands out "postgresql://" / "postgres://" URLs; the installed driver is psycopg 3.
        for prefix in ("postgres://", "postgresql://"):
            if value.startswith(prefix):
                return "postgresql+psycopg://" + value[len(prefix):]
        return value

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip().rstrip("/") for origin in self.FRONTEND_URLS.split(",") if origin.strip()]

    @property
    def max_upload_bytes(self) -> int:
        return self.MAX_UPLOAD_MB * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
