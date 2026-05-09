"""api/admin.py"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from db.crud import get_recent_runs

router = APIRouter()

@router.get("/runs", summary="Get all pipeline runs for prototype tracking")
async def get_all_runs(limit: int = 100, db: AsyncSession = Depends(get_db)):
    runs = await get_recent_runs(db, limit=limit)
    
    return [
        {
            "id": run.id,
            "patient_name": run.patient_name,
            "patient_age": run.patient_age,
            "patient_gender": run.patient_gender,
            "raw_input": run.raw_input,
            "is_emergency": run.is_emergency,
            "duration_ms": run.duration_ms,
            "created_at": run.created_at.isoformat(),
            "conditions": [c.get("name") for c in run.conditions_output.get("conditions", [])] if run.conditions_output and isinstance(run.conditions_output.get("conditions"), list) else []
        }
        for run in runs
    ]
