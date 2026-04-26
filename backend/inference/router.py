"""
LLM Router — decides between Ollama (local) and cloud fallback.
Strategy: Ollama first, always. Cloud only if USE_CLOUD_LLM=true.
Circuit breaker: after 3 consecutive Ollama failures, trips to cloud for 60s.
"""
import time
from typing import Callable, Awaitable
from core.config import settings
from core.logger import logger
from core.exceptions import LLMUnavailableError
from inference import ollama_client


class _CircuitBreaker:
    def __init__(self, threshold: int = 3, reset_timeout: float = 60.0):
        self.threshold = threshold
        self.reset_timeout = reset_timeout
        self._failures = 0
        self._opened_at: float = 0.0

    @property
    def is_open(self) -> bool:
        if self._failures >= self.threshold:
            if time.monotonic() - self._opened_at > self.reset_timeout:
                self._failures = 0
                logger.info("Circuit breaker reset — retrying Ollama")
                return False
            return True
        return False

    def record_failure(self):
        self._failures += 1
        if self._failures >= self.threshold:
            self._opened_at = time.monotonic()
            logger.warning(
                f"Ollama circuit breaker OPEN after {self._failures} failures. "
                f"Will retry in {self.reset_timeout}s"
            )

    def record_success(self):
        if self._failures > 0:
            logger.info("Ollama recovered — circuit breaker reset")
        self._failures = 0


_breaker = _CircuitBreaker()


async def complete(
    prompt: str,
    system: str = "",
    temperature: float = 0.3,
    max_tokens: int = 2048,
    json_mode: bool = True,
) -> str:
    if not _breaker.is_open:
        try:
            result = await ollama_client.generate(
                prompt=prompt,
                system=system,
                temperature=temperature,
                max_tokens=max_tokens,
                json_mode=json_mode,
            )
            _breaker.record_success()
            return result
        except LLMUnavailableError:
            _breaker.record_failure()
            logger.warning("Ollama unavailable — checking cloud fallback")

    # Cloud fallback
    if settings.use_cloud_llm:
        return await _cloud_complete(prompt, system, temperature, max_tokens, json_mode)

    # No fallback configured — raise clearly
    raise LLMUnavailableError(
        "ollama (circuit open, no cloud fallback configured). "
        "Run: ollama serve && ollama pull llama3.2"
    )


async def _cloud_complete(
    prompt: str,
    system: str,
    temperature: float,
    max_tokens: int,
    json_mode: bool,
) -> str:
    if settings.anthropic_api_key:
        return await _anthropic_complete(prompt, system, temperature, max_tokens)
    if settings.openai_api_key:
        return await _openai_complete(prompt, system, temperature, max_tokens)
    raise LLMUnavailableError("cloud (no API key configured)")


async def _anthropic_complete(
    prompt: str, system: str, temperature: float, max_tokens: int
) -> str:
    import httpx
    headers = {
        "x-api-key": settings.anthropic_api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }
    body = {
        "model": "claude-haiku-4-5-20251001",
        "max_tokens": max_tokens,
        "temperature": temperature,
        "system": system,
        "messages": [{"role": "user", "content": prompt}],
    }
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(
            "https://api.anthropic.com/v1/messages", json=body, headers=headers
        )
        r.raise_for_status()
        return r.json()["content"][0]["text"]


async def _openai_complete(
    prompt: str, system: str, temperature: float, max_tokens: int
) -> str:
    import httpx
    headers = {
        "Authorization": f"Bearer {settings.openai_api_key}",
        "Content-Type": "application/json",
    }
    body = {
        "model": "gpt-4o-mini",
        "temperature": temperature,
        "max_tokens": max_tokens,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ],
    }
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(
            "https://api.openai.com/v1/chat/completions", json=body, headers=headers
        )
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"]


async def status() -> dict:
    available, models = await ollama_client.is_available()
    return {
        "ollama": {
            "available": available,
            "models": models,
            "circuit_open": _breaker.is_open,
            "failure_count": _breaker._failures,
        },
        "cloud_enabled": settings.use_cloud_llm,
        "active_backend": "cloud" if _breaker.is_open and settings.use_cloud_llm else "ollama",
    }
