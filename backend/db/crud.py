"""db/crud.py"""
from typing import Optional
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from db.models import Hospital, PipelineRun
from core.logger import logger


async def get_hospitals(
    db: AsyncSession,
    city: Optional[str] = None,
    specialties: Optional[list[str]] = None,
    er_only: bool = False,
    limit: int = 50,
) -> list[Hospital]:
    stmt = select(Hospital)

    if city:
        city_clean = city.strip()
        if city_clean.lower() in ("bangalore", "bengaluru"):
            stmt = stmt.where(
                or_(
                    Hospital.city.ilike("%bangalore%"),
                    Hospital.city.ilike("%bengaluru%"),
                    Hospital.area.ilike("%bangalore%"),
                )
            )
        else:
            stmt = stmt.where(
                or_(
                    Hospital.city.ilike(f"%{city_clean}%"),
                    Hospital.area.ilike(f"%{city_clean}%"),
                )
            )

    if er_only:
        stmt = stmt.where(Hospital.er_capable == True)

    stmt = stmt.limit(limit)
    result = await db.execute(stmt)
    hospitals = list(result.scalars().all())

    # Filter by specialty in Python
    if specialties:
        specialties_lower = [s.lower() for s in specialties]
        spec_matched = [
            h for h in hospitals
            if h.specialties and any(
                any(spec in hs.lower() for spec in specialties_lower)
                for hs in h.specialties
            )
        ]
        if spec_matched:
            hospitals = spec_matched

    return hospitals


async def log_pipeline_run(db: AsyncSession, run_data: dict) -> PipelineRun:
    run = PipelineRun(**run_data)
    db.add(run)
    await db.flush()
    return run


async def get_recent_runs(
    db: AsyncSession,
    session_id: Optional[str] = None,
    limit: int = 10,
) -> list[PipelineRun]:
    stmt = select(PipelineRun).order_by(PipelineRun.created_at.desc()).limit(limit)
    if session_id:
        stmt = stmt.where(PipelineRun.session_id == session_id)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def bulk_insert_hospitals(db: AsyncSession, hospitals: list[dict]) -> int:
    objs = [Hospital(**h) for h in hospitals]
    db.add_all(objs)
    await db.flush()
    logger.info(f"Inserted {len(objs)} hospitals")
    return len(objs)
