from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── App ──────────────────────────────────────────────────────
    app_name: str = "HEALIX AI"
    app_env: str = "development"
    app_port: int = 8000
    debug: bool = True
    secret_key: str = "dev-secret-change-in-prod"

    # ── Ollama ───────────────────────────────────────────────────
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.2"
    ollama_timeout: int = 120
    ollama_max_retries: int = 3

    # ── Cloud LLM (optional) ────────────────────────────────────
    use_cloud_llm: bool = False
    anthropic_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None

    # ── Database ─────────────────────────────────────────────────
    database_url: str = "sqlite:///./healix.db"

    # ── Redis ────────────────────────────────────────────────────
    redis_url: str = "redis://localhost:6379/0"
    cache_ttl_seconds: int = 600

    # ── ChromaDB ─────────────────────────────────────────────────
    chroma_persist_path: str = "./data/chroma_db"
    chroma_collection: str = "symptom_embeddings"

    # ── ML ───────────────────────────────────────────────────────
    ml_models_path: str = "./ml/saved_models"
    embeddings_model: str = "all-MiniLM-L6-v2"

    # ── Pipeline ─────────────────────────────────────────────────
    pipeline_timeout: int = 90
    max_conditions: int = 4
    max_hospitals: int = 8
    confidence_min: float = 0.2
    confidence_max: float = 0.95

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @property
    def active_llm(self) -> str:
        return "cloud" if self.use_cloud_llm else "ollama"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()