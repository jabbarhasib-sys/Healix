"""core/logger.py — Structured logging setup using loguru."""
import sys
from loguru import logger
from .config import settings


def setup_logger() -> None:
    logger.remove()  # remove default handler

    fmt = (
        "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
        "<level>{message}</level>"
    )

    # Console
    logger.add(
        sys.stdout,
        format=fmt,
        level="DEBUG" if settings.debug else "INFO",
        colorize=True,
        backtrace=True,
        diagnose=settings.debug,
    )

    # File sink — rotates daily, keeps 14 days of compressed logs
    logger.add(
        "logs/healix_{time:YYYY-MM-DD}.log",
        format=fmt,
        level="WARNING",
        rotation="00:00",
        retention="14 days",
        compression="zip",
        enqueue=True,  # thread-safe async write
    )

    logger.info(
        f"Logger ready | env={settings.app_env} | "
        f"llm={settings.active_llm} | model={settings.ollama_model}"
    )


def get_log_level() -> str:
    """Return the effective log level based on debug/env settings."""
    return "DEBUG" if settings.debug else "INFO"


# Re-export so all files do: from core.logger import logger
__all__ = ["logger", "setup_logger", "get_log_level"]