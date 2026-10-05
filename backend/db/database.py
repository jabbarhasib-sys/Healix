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

_url = settings.database_url

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
    """Create all ORM tables if they do not yet exist (safe to call on every startup)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("DB tables ready")


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