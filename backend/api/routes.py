"""api/routes.py — assembles all routers"""
from fastapi import APIRouter
from api.pipeline import router as pipeline_router
from api.health import router as health_router
from api.websocket import router as ws_router
from api.places import router as places_router

router = APIRouter()
router.include_router(health_router, tags=["health"])
router.include_router(pipeline_router, prefix="/pipeline", tags=["pipeline"])
router.include_router(ws_router, tags=["stream"])
router.include_router(places_router, tags=["places"])
