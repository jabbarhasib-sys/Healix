"""api/pipeline.py"""
import time
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from schemas.request_models import PipelineRequest
from schemas.response_models import PipelineResponse
from modules.pipeline_orchestrator import run_pipeline
from db.database import get_db
from core.logger import logger

router = APIRouter()


@router.post("/run", response_model=PipelineResponse, summary="Run full 6-module AI pipeline")
async def run(req: PipelineRequest, db: AsyncSession = Depends(get_db)):
    t = time.monotonic()
    try:
        result = await run_pipeline(
            raw_input=req.symptoms_text,
            session_id=req.session_id,
            patient_name=req.patient_name,
            patient_age=req.patient_age,
            patient_gender=req.patient_gender,
        )
        logger.info(
            f"Pipeline OK | {round((time.monotonic()-t)*1000)}ms | "
            f"emergency={result['risk']['is_emergency']}"
        )
        return {"success": True, **result}
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.exception(f"Pipeline failed: {e}")
        raise HTTPException(status_code=500, detail="Pipeline execution failed")
