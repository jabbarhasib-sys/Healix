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

    # File (errors only in prod)
    logger.add(
        "logs/healix_{time:YYYY-MM-DD}.log",
        format=fmt,
        level="ERROR",
        rotation="00:00",
        retention="7 days",
        compression="zip",
    )

    logger.info(
        f"Logger ready | env={settings.app_env} | "
        f"llm={settings.active_llm} | model={settings.ollama_model}"
    )


# Re-export so all files do: from core.logger import logger
__all__ = ["logger", "setup_logger"]