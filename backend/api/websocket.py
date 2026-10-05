"""
api/websocket.py — real-time pipeline streaming via SSE + WebSocket (dual mode).

• On Vercel: WebSocket is not available. The frontend falls back to SSE automatically.
• On any long-lived server (Render / local): WebSocket is fully supported.

Endpoints:
  GET  /api/stream/pipeline?...   ← Server-Sent Events (Vercel-compatible)
  POST /api/stream/pipeline       ← POST body, SSE response (Vercel-compatible)
  WS   /ws/pipeline               ← WebSocket (non-Vercel envs)
"""
import json
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import StreamingResponse
from modules.pipeline_orchestrator import run_pipeline
from core.logger import logger

router = APIRouter()


# ──────────────────────────────────────────────────────────────────────────────
# SSE helper
# ──────────────────────────────────────────────────────────────────────────────
def _sse(event: str, data: dict) -> str:
    payload = json.dumps(data, ensure_ascii=False)
    return f"event: {event}\ndata: {payload}\n\n"


async def _run_pipeline_sse(body: dict):
    """Async generator that yields SSE events for the pipeline run."""
    symptoms_text = (body.get("symptoms_text") or "").strip()
    if not symptoms_text:
        yield _sse("error", {"message": "symptoms_text is required"})
        return

    yield _sse("started", {"message": "Pipeline initiated"})

    async def on_stage(key: str, label: str):
        # We can't yield inside a callback directly; use a queue
        await stage_queue.put((key, label))

    stage_queue: asyncio.Queue = asyncio.Queue()

    # Run pipeline in background task
    pipeline_task = asyncio.create_task(
        run_pipeline(
            raw_input=symptoms_text,
            session_id=body.get("session_id"),
            city=body.get("city") or "Bangalore",
            lat=body.get("lat"),
            lng=body.get("lng"),
            patient_name=body.get("patient_name"),
            patient_age=body.get("patient_age"),
            patient_gender=body.get("patient_gender"),
            on_stage=on_stage,
        )
    )

    # Stream stage events while pipeline is running
    while not pipeline_task.done():
        try:
            key, label = await asyncio.wait_for(stage_queue.get(), timeout=0.3)
            yield _sse("stage", {"stage": key, "label": label})
        except asyncio.TimeoutError:
            yield ": heartbeat\n\n"  # keep connection alive
        except Exception:
            break

    # Drain any remaining stage events
    while not stage_queue.empty():
        key, label = stage_queue.get_nowait()
        yield _sse("stage", {"stage": key, "label": label})

    # Emit final result or error
    try:
        result = pipeline_task.result()
        yield _sse("result", result)
    except Exception as e:
        logger.exception(f"SSE pipeline error: {e}")
        yield _sse("error", {"message": str(e)})


# ──────────────────────────────────────────────────────────────────────────────
# POST /api/stream/pipeline  — SSE, body as JSON
# ──────────────────────────────────────────────────────────────────────────────
@router.post("/stream/pipeline")
async def sse_pipeline_post(request: Request):
    body = await request.json()
    return StreamingResponse(
        _run_pipeline_sse(body),
        media_type="text/event-stream",
        headers={
            "Cache-Control":             "no-cache",
            "X-Accel-Buffering":         "no",   # disable nginx buffering
            "Access-Control-Allow-Origin": "*",
        },
    )


# ──────────────────────────────────────────────────────────────────────────────
# WS /ws/pipeline — kept for local / Render deployments
# ──────────────────────────────────────────────────────────────────────────────
@router.websocket("/ws/pipeline")
async def ws_pipeline(ws: WebSocket):
    await ws.accept()
    logger.info(f"WS connected: {ws.client}")
    try:
        data = await ws.receive_json()
        symptoms_text = (data.get("symptoms_text") or "").strip()
        if not symptoms_text:
            await ws.send_json({"type": "error", "message": "symptoms_text required"})
            await ws.close()
            return

        await ws.send_json({"type": "started", "message": "Pipeline initiated"})

        async def on_stage(key: str, label: str):
            await ws.send_json({"type": "stage", "stage": key, "label": label})

        result = await run_pipeline(
            raw_input=symptoms_text,
            session_id=data.get("session_id"),
            city=data.get("city") or "Bangalore",
            lat=data.get("lat"),
            lng=data.get("lng"),
            patient_name=data.get("patient_name"),
            patient_age=data.get("patient_age"),
            patient_gender=data.get("patient_gender"),
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
