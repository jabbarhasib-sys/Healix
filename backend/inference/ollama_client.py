import json
import asyncio
from typing import AsyncGenerator, Optional
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from core.config import settings
from core.logger import logger
from core.exceptions import LLMUnavailableError


_client: Optional[httpx.AsyncClient] = None


def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(
            base_url=settings.ollama_base_url,
            timeout=httpx.Timeout(
                connect=5.0,
                read=settings.ollama_timeout,
                write=10.0,
                pool=5.0,
            ),
            limits=httpx.Limits(max_connections=20, max_keepalive_connections=10),
        )
    return _client


@retry(
    stop=stop_after_attempt(settings.ollama_max_retries),
    wait=wait_exponential(multiplier=1, min=1, max=8),
    retry=retry_if_exception_type((httpx.ConnectError, httpx.TimeoutException)),
    reraise=True,
)
async def generate(
    prompt: str,
    system: str = "",
    temperature: float = 0.3,
    max_tokens: int = 2048,
    json_mode: bool = True,
) -> str:
    client = _get_client()

    payload = {
        "model": settings.ollama_model,
        "prompt": prompt,
        "system": system,
        "stream": False,
        "options": {
            "temperature": temperature,
            "num_predict": max_tokens,
            "top_p": 0.9,
            "repeat_penalty": 1.1,
        },
    }

    if json_mode:
        payload["format"] = "json"

    try:
        resp = await client.post("/api/generate", json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data.get("response", "").strip()

    except httpx.ConnectError:
        raise LLMUnavailableError("ollama")
    except httpx.HTTPStatusError as e:
        logger.error(f"Ollama HTTP {e.response.status_code}: {e.response.text[:200]}")
        raise LLMUnavailableError("ollama")


async def generate_stream(
    prompt: str,
    system: str = "",
    temperature: float = 0.4,
) -> AsyncGenerator[str, None]:
    client = _get_client()
    payload = {
        "model": settings.ollama_model,
        "prompt": prompt,
        "system": system,
        "stream": True,
        "options": {"temperature": temperature},
    }

    try:
        async with client.stream("POST", "/api/generate", json=payload) as resp:
            async for line in resp.aiter_lines():
                if line:
                    chunk = json.loads(line)
                    if token := chunk.get("response"):
                        yield token
                    if chunk.get("done"):
                        break
    except httpx.ConnectError:
        raise LLMUnavailableError("ollama")


async def is_available() -> tuple[bool, list[str]]:
    try:
        client = _get_client()
        resp = await client.get("/api/tags", timeout=4.0)
        if resp.status_code == 200:
            models = [m["name"] for m in resp.json().get("models", [])]
            return True, models
        return False, []
    except Exception:
        return False, []


async def pull_model_if_missing(model: str) -> bool:
    available, models = await is_available()
    if not available:
        return False
    if any(model in m for m in models):
        return True
    logger.info(f"Pulling model {model} from Ollama registry...")
    try:
        client = _get_client()
        async with client.stream(
            "POST", "/api/pull", json={"name": model, "stream": True}
        ) as resp:
            async for line in resp.aiter_lines():
                if line:
                    status = json.loads(line).get("status", "")
                    if "success" in status.lower():
                        logger.info(f"Model {model} pulled successfully")
                        return True
    except Exception as e:
        logger.error(f"Failed to pull {model}: {e}")
    return False


async def close():
    global _client
    if _client and not _client.is_closed:
        await _client.aclose()
