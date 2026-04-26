"""api/websocket.py — real-time pipeline stage streaming"""
import json
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from modules.pipeline_orchestrator import run_pipeline
from core.logger import logger

router = APIRouter()


@router.websocket("/ws/pipeline")
async def ws_pipeline(ws: WebSocket):
    await ws.accept()
    logger.info(f"WS connected: {ws.client}")

    try:
        data = await ws.receive_json()
        symptoms_text = data.get("symptoms_text", "").strip()
        session_id = data.get("session_id")

        if not symptoms_text:
            await ws.send_json({"type": "error", "message": "symptoms_text required"})
            await ws.close()
            return

        async def on_stage(key: str, label: str):
            await ws.send_json({"type": "stage", "stage": key, "label": label})

        await ws.send_json({"type": "started", "message": "Pipeline initiated"})

        result = await run_pipeline(
            raw_input=symptoms_text,
            session_id=session_id,
            on_stage=on_stage,
        )

        await ws.send_json({"type": "result", "data": result})

    except WebSocketDisconnect:
        logger.info("WS client disconnected")
    except Exception as e:
        logger.exception(f"WS pipeline error: {e}")
        try:
            await ws.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass
    finally:
        try:
            await ws.close()
        except Exception:
            pass
