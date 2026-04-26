from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from loguru import logger


class HealixBaseException(Exception):
    def __init__(self, message: str, code: str = "HEALIX_ERROR"):
        self.message = message
        self.code = code
        super().__init__(message)


class LLMUnavailableError(HealixBaseException):
    def __init__(self, backend: str = "ollama"):
        super().__init__(
            f"LLM backend '{backend}' is unavailable. Is Ollama running?",
            code="LLM_UNAVAILABLE",
        )


class PipelineTimeoutError(HealixBaseException):
    def __init__(self):
        super().__init__("Pipeline execution timed out.", code="PIPELINE_TIMEOUT")


class InsufficientInputError(HealixBaseException):
    def __init__(self, detail: str = "Input too vague to analyze."):
        super().__init__(detail, code="INSUFFICIENT_INPUT")


class ModelNotLoadedError(HealixBaseException):
    def __init__(self, model_name: str):
        super().__init__(
            f"ML model '{model_name}' not loaded. Run train_models.py first.",
            code="MODEL_NOT_LOADED",
        )


class DatabaseError(HealixBaseException):
    def __init__(self, detail: str):
        super().__init__(detail, code="DB_ERROR")


# ── FastAPI exception handlers ───────────────────────────────────────────────

async def healix_exception_handler(
    request: Request, exc: HealixBaseException
) -> JSONResponse:
    logger.warning(f"[{exc.code}] {exc.message} | path={request.url.path}")
    status = 503 if isinstance(exc, LLMUnavailableError) else 400
    return JSONResponse(
        status_code=status,
        content={
            "success": False,
            "error": {"code": exc.code, "message": exc.message},
        },
    )


async def generic_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    logger.exception(f"Unhandled error at {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred.",
            },
        },
    )