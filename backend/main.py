"""TripSense — FastAPI Server

Main API layer. SSE streaming for progressive debate reveal.
Endpoints: /api/chat, /api/session, /api/rerank
"""

import json
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional

from config import CORS_ORIGINS, has_api_key, LLM_PROVIDER, MODEL_ID
from engine.react_loop import ReActLoop
from engine.intent_parser import IntentParser
from data.hotels import get_hotels_json, HOTELS
from data.hotel_provider import get_genuine_hotels

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="TripSense AI Agent", version="3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://trip-sense-six.vercel.app", 
        "https://trip-sense-iews.vercel.app", 
        "http://localhost:5173", 
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Shared state ──
react_loop = ReActLoop()
intent_parser = IntentParser()


# ── Models ──
class ChatRequest(BaseModel):
    message: str
    session_dna: dict = {}
    has_results: bool = False


class ReRankRequest(BaseModel):
    intent: dict
    session_dna: dict
    tag_changed: Optional[str] = None
    tag_action: Optional[str] = None  # "added" | "removed"
    trip_type: Optional[str] = None


# ── Endpoints ──

@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "llm_available": has_api_key(),
        "provider": LLM_PROVIDER,
        "model": MODEL_ID,
        "hotels_loaded": len(HOTELS),
    }


@app.post("/api/chat")
async def chat(request: ChatRequest):
    """Main agent endpoint — returns SSE stream of debate steps."""

    async def event_stream():
        try:
            async for step in react_loop.run(
                request.message,
                request.session_dna,
                request.has_results,
            ):
                # Format as SSE event
                event_data = json.dumps(step, default=str)
                yield f"data: {event_data}\n\n"

            # Done signal
            yield f"data: {json.dumps({'step': 'done'})}\n\n"

        except Exception as e:
            logger.error(f"Chat stream error: {e}", exc_info=True)
            yield f"data: {json.dumps({'step': 'error', 'content': str(e)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/api/rerank")
async def rerank(request: ReRankRequest):
    """Live re-rank when user changes tags, trip type, or budget."""
    from agents.optimizer import OptimizerAgent
    from agents.advocate import AdvocateAgent
    from agents.synthesizer import SynthesizerAgent

    location = request.intent.get("destination", "New York")
    hotels_json = get_genuine_hotels(location)[:10]
    
    optimizer = OptimizerAgent()
    advocate = AdvocateAgent()
    synthesizer = SynthesizerAgent()

    # Quick re-run the debate with updated intent
    optimizer_output = await optimizer.run(hotels_json, request.intent, request.session_dna)
    advocate_output = await advocate.run(optimizer_output, hotels_json, request.intent)

    # Simplified empathy (skip for re-rank speed)
    empathy_stub = {
        "soul_match": {"hotel_id": "", "hotel_name": "", "why": "", "score_boost": 0},
        "emotional_notes": [],
        "override_recommendation": None,
    }

    synthesis_output = await synthesizer.run(
        optimizer_output, advocate_output, empathy_stub, request.intent
    )

    # Generate re-rank explanation
    msg = ""
    if request.tag_changed:
        action = request.tag_action or "changed"
        msg = f"You {action} **{request.tag_changed}** — re-ran the debate."
    elif request.trip_type:
        msg = f"Switched to **{request.trip_type}** mode — entire shortlist re-ranked."

    shortlist = synthesis_output.get("shortlist", [])
    if shortlist:
        msg += f" **{shortlist[0].get('hotel_name', '')}** is now #1."

    return {
        "shortlist": shortlist,
        "message": msg,
        "synthesis": synthesis_output,
    }


@app.get("/api/hotels")
async def list_hotels():
    """Return all hotel data (for debugging/admin)."""
    return {"hotels": get_genuine_hotels(), "count": len(get_genuine_hotels())}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
