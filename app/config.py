"""
app/config.py
─────────────
Centralised configuration loaded from environment variables.
API keys are NEVER logged or returned in responses.
"""
import os
from functools import lru_cache

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()


class Settings(BaseSettings):
    # ── LLM provider ──────────────────────────────────
    groq_api_key: str = ""          # loaded from env; never printed
    groq_model: str = "llama-3.3-70b-versatile"
    llm_mock_mode: bool = False     # True → no real API call

    # ── App ───────────────────────────────────────────
    zeroleak_env: str = "development"
    privaguard_env: str = "development"
    log_level: str = "INFO"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        # Fields that must NEVER be serialised to logs/responses
        secrets = {"groq_api_key"}

    def safe_dict(self) -> dict:
        """Return settings dict with secrets redacted — safe for logging."""
        d = self.model_dump()
        d["groq_api_key"] = "***REDACTED***"
        return d


@lru_cache()
def get_settings() -> Settings:
    return Settings()
