"""
data/scripts/seed_database.py
Loads synthetic JSON data into the database.
Run AFTER generate_hospitals.py.
Usage: python data/scripts/seed_database.py
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
from sqlalchemy import select, func
from core.logger import logger, setup_logger
 
 
async def seed_hospitals(path: Path) -> int:
    if not path.exists():
        logger.warning(f"Hospitals file not found: {path}. Run generate_hospitals.py first.")
        return 0
 
    with open(path) as f:
        hospitals = json.load(f)
 
    async with SessionLocal() as db:
        # Check existing count
        result = await db.execute(select(func.count()).select_from(Hospital))
        existing = result.scalar_one()
 
        if existing > 0:
            logger.info(f"DB already has {existing} hospitals — skipping seed (use --force to overwrite)")
            return existing
 
        inserted = await bulk_insert_hospitals(db, hospitals)
        await db.commit()
        return inserted
 
 
async def main(force: bool = False):
    setup_logger()
    logger.info("Initialising database...")
    await init_db()
 
    data_dir = Path("data/synthetic")
 
    count = await seed_hospitals(data_dir / "hospitals.json")
    logger.info(f"Hospitals in DB: {count}")
 
    logger.info("Seed complete.")
 
 
if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--force", action="store_true", help="Drop and re-seed")
    args = p.parse_args()
    asyncio.run(main(force=args.force))
 