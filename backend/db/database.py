"""db/database.py
Handles SQLite (dev) and PostgreSQL/Supabase (production) transparently.

Supabase connection strings look like:
  postgresql://postgres.[project-ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
  (Transaction Mode pooler — best for serverless)
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from core.config import settings
from core.logger import logger

import os

_url = settings.database_url

# Serverless environment (e.g. Vercel) has read-only filesystem except /tmp
if os.environ.get("VERCEL") and "sqlite" in _url:
    _url = "sqlite+aiosqlite:////tmp/healix.db"

# ── SQLite — local dev only ───────────────────────────────────────────────────
if _url.startswith("sqlite"):
    _url = (
        _url
        .replace("sqlite:///", "sqlite+aiosqlite:///")
        .replace("sqlite+aiosqlite+aiosqlite", "sqlite+aiosqlite")  # guard double replace
    )
    engine = create_async_engine(_url, echo=settings.debug)

# ── Supabase / Render PostgreSQL — production ─────────────────────────────────
else:
    # Normalise scheme to asyncpg driver
    _url = (
        _url
        .replace("postgres://",     "postgresql+asyncpg://", 1)
        .replace("postgresql://",   "postgresql+asyncpg://", 1)
    )
    # Supabase Transaction Mode pooler (port 6543) does NOT support SSL param
    # in the URL — we pass it via connect_args instead.
    # Session Mode pooler (port 5432) and direct connections also work this way.
    _connect_args = {}

    # Only require SSL when actually connecting to a remote host
    _is_remote = not ("localhost" in _url or "127.0.0.1" in _url)
    if _is_remote:
        _connect_args["ssl"] = "require"

    engine = create_async_engine(
        _url,
        echo=settings.debug,
        pool_pre_ping=True,
        # Serverless: keep the pool small — each function instance is short-lived
        pool_size=2,
        max_overflow=5,
        pool_timeout=30,
        pool_recycle=300,
        connect_args=_connect_args,
    )


# ── Session factory ───────────────────────────────────────────────────────────
SessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


# ── ORM base ─────────────────────────────────────────────────────────────────
class Base(DeclarativeBase):
    pass


# ── Initialise tables (idempotent) ────────────────────────────────────────────
async def init_db():
    """Create all ORM tables if they do not yet exist and auto-seed if empty."""
    try:
        import db.models  # ensure models are registered with Base.metadata # noqa: F401
    except ImportError:
        pass
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("DB tables ready")

        # Auto-seed initial hospital catalog if empty
        try:
            from db.models import Hospital
            from db.crud import bulk_insert_hospitals
            import json
            from pathlib import Path
            from sqlalchemy import select, func

            async with SessionLocal() as session:
                res = await session.execute(select(func.count()).select_from(Hospital))
                count = res.scalar_one()
                if count == 0:
                    data_file = Path(__file__).resolve().parent.parent.parent / "data" / "synthetic" / "hospitals.json"
                    if data_file.exists():
                        with open(data_file, encoding="utf-8") as f:
                            hospitals_data = json.load(f)
                        await bulk_insert_hospitals(session, hospitals_data)
                        await session.commit()
                        logger.info(f"Auto-seeded {len(hospitals_data)} hospitals into database.")
        except Exception as seed_err:
            logger.debug(f"Auto-seed check note: {seed_err}")
    except Exception as exc:
        logger.warning(f"DB initialization warning: {exc}")


# ── FastAPI dependency ────────────────────────────────────────────────────────
async def get_db():
    """Yield an async DB session; commits on success, rolls back on error."""
    async with SessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


# ── Liveness probe ────────────────────────────────────────────────────────────
async def ping_db() -> bool:
    """Return True if the database is reachable, False otherwise."""
    from sqlalchemy import text
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return True
    except Exception as exc:
        logger.error(f"DB ping failed: {exc}")
        return False