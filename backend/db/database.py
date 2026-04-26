"""db/database.py"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from core.config import settings
from core.logger import logger

# SQLite uses aiosqlite driver, Postgres uses asyncpg
_url = settings.database_url
if _url.startswith("sqlite"):
    _url = _url.replace("sqlite:///", "sqlite+aiosqlite:///")
elif _url.startswith("postgresql://"):
    _url = _url.replace("postgresql://", "postgresql+asyncpg://")

engine = create_async_engine(
    _url,
    echo=settings.debug,
    pool_pre_ping=True,
    pool_size=10 if "postgresql" in _url else 1,
    max_overflow=20 if "postgresql" in _url else 0,
)

SessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


class Base(DeclarativeBase):
    pass


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("DB tables ready")


async def get_db():
    async with SessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
