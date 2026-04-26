"""
services/cache.py
Redis wrapper with graceful degradation — app works fine if Redis is down.
Key strategy: pipeline results cached by SHA256 of input text.
"""
import json
import hashlib
from typing import Any, Optional
from core.config import settings
from core.logger import logger

try:
    import redis.asyncio as aioredis
    _REDIS_AVAILABLE = True
except ImportError:
    _REDIS_AVAILABLE = False

_pool: Optional[Any] = None


async def _get_pool():
    global _pool
    if not _REDIS_AVAILABLE:
        return None
    if _pool is None:
        try:
            _pool = aioredis.ConnectionPool.from_url(
                settings.redis_url,
                max_connections=10,
                decode_responses=True,
                socket_connect_timeout=2,
                socket_timeout=2,
            )
        except Exception as e:
            logger.warning(f"Redis pool init failed: {e}")
            return None
    return _pool


async def _client():
    pool = await _get_pool()
    if pool is None:
        return None
    try:
        return aioredis.Redis(connection_pool=pool)
    except Exception:
        return None


def _make_key(namespace: str, raw: str) -> str:
    digest = hashlib.sha256(raw.encode()).hexdigest()[:16]
    return f"healix:{namespace}:{digest}"


async def get(namespace: str, raw_key: str) -> Optional[dict]:
    client = await _client()
    if client is None:
        return None
    try:
        val = await client.get(_make_key(namespace, raw_key))
        if val:
            logger.debug(f"Cache HIT [{namespace}]")
            return json.loads(val)
    except Exception as e:
        logger.debug(f"Cache get error (non-fatal): {e}")
    return None


async def set(namespace: str, raw_key: str, value: dict, ttl: int | None = None) -> bool:
    client = await _client()
    if client is None:
        return False
    try:
        serialized = json.dumps(value, default=str)
        await client.setex(
            _make_key(namespace, raw_key),
            ttl or settings.cache_ttl_seconds,
            serialized,
        )
        logger.debug(f"Cache SET [{namespace}] TTL={ttl or settings.cache_ttl_seconds}s")
        return True
    except Exception as e:
        logger.debug(f"Cache set error (non-fatal): {e}")
        return False


async def invalidate(namespace: str, raw_key: str) -> bool:
    client = await _client()
    if client is None:
        return False
    try:
        await client.delete(_make_key(namespace, raw_key))
        return True
    except Exception:
        return False


async def ping() -> bool:
    client = await _client()
    if client is None:
        return False
    try:
        return await client.ping()
    except Exception:
        return False
