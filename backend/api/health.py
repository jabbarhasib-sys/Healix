"""api/health.py"""
import httpx
from fastapi import APIRouter
from core.config import settings

router = APIRouter()


@router.get("/health", summary="Service health + LLM status")
async def health():
    # Check Ollama availability without importing the deleted inference module
    llm_status = {"backend": settings.active_llm, "model": settings.ollama_model, "reachable": False}
    try:
        async with httpx.AsyncClient(timeout=3) as client:
            r = await client.get(f"{settings.ollama_base_url}/api/tags")
            llm_status["reachable"] = r.status_code == 200
    except Exception:
        pass  # Ollama not running — non-fatal

    return {
        "status": "ok",
        "service": "HEALIX AI",
        "version": "2.0.0",
        "llm": llm_status,
        "config": {
            "model":            settings.ollama_model,
            "pipeline_timeout": settings.pipeline_timeout,
            "max_conditions":   settings.max_conditions,
            "max_hospitals":    settings.max_hospitals,
        },
    }
