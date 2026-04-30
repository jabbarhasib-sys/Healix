import asyncio
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from loguru import logger

from core.config import settings
from core.logger import setup_logger
from core.exceptions import HealixBaseException, healix_exception_handler, generic_exception_handler
from api.routes import router
from db.database import init_db


# ── Startup / Shutdown ───────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    # STARTUP
    setup_logger()
    logger.info("=" * 38)
    logger.info("  HEALIX AI Intelligence Engine")
    logger.info(f"  LLM  : {settings.active_llm.upper()} ({settings.ollama_model})")
    logger.info(f"  DB   : {settings.database_url[:30]}...")
    logger.info(f"  ENV  : {settings.app_env}")
    logger.info("=" * 38)

    # Init DB (creates tables if not exist)
    await init_db()
    logger.info("Database initialized OK")


    # Warm up Ollama connection check
    try:
        import httpx
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get(f"{settings.ollama_base_url}/api/tags")
            if r.status_code == 200:
                models = [m["name"] for m in r.json().get("models", [])]
                logger.info(f"Ollama connected OK | models: {models}")
            else:
                logger.warning("Ollama reachable but returned non-200. Check model pull.")
    except Exception as e:
        logger.warning(f"Ollama not reachable at startup: {e}. Will retry on first request.")

    yield  # ← app is running

    # SHUTDOWN
    logger.info("HEALIX AI shutting down...")


# ── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="HEALIX AI",
    description="Clinical Decision Intelligence Engine — 6-Module AI Pipeline",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── Middleware ───────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# ── Exception Handlers ───────────────────────────────────────────────────────

app.add_exception_handler(HealixBaseException, healix_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# ── Routers ──────────────────────────────────────────────────────────────────

app.include_router(router, prefix="/api")

# ── Root ─────────────────────────────────────────────────────────────────────

@app.get("/", tags=["root"])
async def root():
    return {
        "service": "HEALIX AI",
        "version": "2.0.0",
        "status": "online",
        "llm_backend": settings.active_llm,
        "model": settings.ollama_model,
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.app_port,
        reload=settings.debug,
        log_level="debug" if settings.debug else "info",
    )