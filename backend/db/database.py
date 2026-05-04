"""db/database.py"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from core.config import settings
from core.logger import logger

# Normalize DB URL — handle all variants Render can inject
_url = settings.database_url

if _url.startswith("sqlite"):
    # Local dev — SQLite with aiosqlite async driver
    _url = _url.replace("sqlite:///", "sqlite+aiosqlite:///")
    engine = create_async_engine(_url, echo=settings.debug)

elif _url.startswith("postgres://") or _url.startswith("postgresql://"):
    # Render PostgreSQL — swap to asyncpg driver
    _url = _url.replace("postgres://", "postgresql+asyncpg://", 1)
    _url = _url.replace("postgresql://", "postgresql+asyncpg://", 1)
    engine = create_async_engine(
        _url,
        echo=settings.debug,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
        connect_args={"ssl": "require"},
    )

elif _url.startswith("postgresql+asyncpg://"):
    # Already normalized
    engine = create_async_engine(
        _url,
        echo=settings.debug,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
        connect_args={"ssl": "require"},
    )

else:
    raise ValueError(f"Unsupported database URL: {_url}")


# Session
SessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


# Base model
class Base(DeclarativeBase):
    pass


# Initialize DB
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("DB tables ready")


# Dependency
async def get_db():
    async with SessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise