"""
data/scripts/seed_database.py
Loads synthetic JSON data into the database.
Run AFTER generate_hospitals.py.
Usage:
    python data/scripts/seed_database.py           # skip if data already exists
    python data/scripts/seed_database.py --force   # drop + re-seed
    python data/scripts/seed_database.py --dry-run # validate without writing
"""
import asyncio
import json
import sys
from pathlib import Path

# Allow running from repo root
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "backend"))

from db.database import init_db, SessionLocal
from db.crud import bulk_insert_hospitals
from db.models import Hospital
from sqlalchemy import select, func, delete
from core.logger import logger, setup_logger


async def seed_hospitals(path: Path, force: bool = False) -> int:
    if not path.exists():
        logger.warning(f"Hospitals file not found: {path}. Run generate_hospitals.py first.")
        return 0

    with open(path, encoding="utf-8") as f:
        hospitals = json.load(f)

    if force:
        from db.database import engine, Base
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Recreated all database tables with latest schema.")

    async with SessionLocal() as db:
        # Check existing count
        result = await db.execute(select(func.count()).select_from(Hospital))
        existing = result.scalar_one()

        if existing > 0 and not force:
            logger.info(f"DB already has {existing} hospitals - skipping seed (use --force to overwrite)")
            return existing

        inserted = await bulk_insert_hospitals(db, hospitals)
        await db.commit()
        return inserted


async def main(force: bool = False, dry_run: bool = False):
    setup_logger()
    logger.info("Initialising database...")
    await init_db()

    data_dir = Path(__file__).resolve().parent.parent / "synthetic"
    hospitals_file = data_dir / "hospitals.json"

    if dry_run:
        if hospitals_file.exists():
            data = json.loads(hospitals_file.read_text(encoding="utf-8"))
            logger.info(f"[DRY-RUN] Would seed {len(data)} hospitals from {hospitals_file}")
        else:
            logger.warning(f"[DRY-RUN] File not found: {hospitals_file}")
        return

    count = await seed_hospitals(hospitals_file, force=force)
    logger.info(f"Hospitals in DB: {count}")
    logger.info("Seed complete.")


if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser(description="Seed the Healix hospital database.")
    p.add_argument("--force", action="store_true", help="Drop and re-seed")
    p.add_argument("--dry-run", action="store_true", help="Validate JSON without writing to DB")
    args = p.parse_args()
    asyncio.run(main(force=args.force, dry_run=args.dry_run))