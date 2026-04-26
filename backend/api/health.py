"""api/health.py"""
from fastapi import APIRouter
from inference import router as llm_router
from core.config import settings

router = APIRouter()


@router.get("/health", summary="Service health + LLM status")
async def health():
    llm_status = await llm_router.status()
    return {
        "status": "ok",
        "service": "HEALIX AI",
        "version": "2.0.0",
        "llm": llm_status,
        "config": {
            "model": settings.ollama_model,
            "pipeline_timeout": settings.pipeline_timeout,
            "max_conditions": settings.max_conditions,
            "max_hospitals": settings.max_hospitals,
        },
    }
