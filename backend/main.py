"""MirrorMind — API Server

FastAPI backend exposing the adversarial reasoning analysis pipeline
as a streaming SSE endpoint.
"""

from __future__ import annotations

import json
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field

try:
    from backend.engine.react_loop import ReActLoop  # type: ignore
except Exception:  # pragma: no cover
    from engine.react_loop import ReActLoop  # type: ignore


app = FastAPI(title="MirrorMind API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

react_loop = ReActLoop()
SESSION_STORE: dict[str, dict[str, Any]] = {}


class AnalyzeRequest(BaseModel):
    message: str
    session_dna: dict = Field(default_factory=dict)
    has_results: bool = False
    overrides: dict = Field(default_factory=dict)


def _format_sse(event_name: str, payload: dict) -> str:
    return f"event: {event_name}\ndata: {json.dumps(payload, ensure_ascii=False)}\n\n"


async def _collect_results(domain: str, request: AnalyzeRequest) -> dict:
    final_payload = None
    async for item in react_loop.run(
        domain,
        request.message,
        request.session_dna,
        request.has_results,
        request.overrides,
    ):
        if item.get("event") == "results":
            final_payload = item.get("data")

    if not final_payload:
        raise HTTPException(status_code=500, detail="Analysis did not produce results.")

    SESSION_STORE[final_payload["session_id"]] = final_payload
    return final_payload


@app.get("/api/health")
async def health() -> dict:
    return {"ok": True, "service": "MirrorMind API"}


@app.post("/api/debate/{domain}")
async def debate(domain: str, request: AnalyzeRequest):
    """Stream the multi-agent analysis pipeline via SSE."""

    async def event_stream():
        async for item in react_loop.run(
            domain,
            request.message,
            request.session_dna,
            request.has_results,
            request.overrides,
        ):
            if item.get("event") == "results":
                payload = item.get("data", {})
                if payload.get("session_id"):
                    SESSION_STORE[payload["session_id"]] = payload
            yield _format_sse(item.get("event", "message"), item.get("data", {}))

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/api/rerank/{domain}")
async def rerank(domain: str, request: AnalyzeRequest):
    payload = await _collect_results(domain, request)
    return JSONResponse(payload)


@app.get("/api/session/{session_id}")
async def get_session(session_id: str):
    session = SESSION_STORE.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    return JSONResponse(session)


@app.get("/api/export/{session_id}.json")
async def export_session_json(session_id: str):
    session = SESSION_STORE.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    return JSONResponse(
        session,
        headers={
            "Content-Disposition": f'attachment; filename="{session_id}.json"',
        },
    )