"""MirrorMind — ReAct Orchestration Loop

Runs the four-agent adversarial pipeline:
  1. Mapper     — extracts claims, values, assumptions
  2. Investigator — flags biases with exact quoted evidence
  3. Advocate   — steelmans the user's reasoning
  4. Synthesizer — identifies the meta-pattern
"""

from __future__ import annotations

import asyncio
import time
from typing import Any
from uuid import uuid4

try:
    from backend.agents.mapper import MapperAgent  # type: ignore
    from backend.agents.investigator import InvestigatorAgent  # type: ignore
    from backend.agents.advocate import AdvocateAgent  # type: ignore
    from backend.agents.synthesizer import SynthesizerAgent  # type: ignore
except Exception:  # pragma: no cover
    from agents.mapper import MapperAgent  # type: ignore
    from agents.investigator import InvestigatorAgent  # type: ignore
    from agents.advocate import AdvocateAgent  # type: ignore
    from agents.synthesizer import SynthesizerAgent  # type: ignore


class ReActLoop:
    """Streams agent-by-agent analysis events via SSE."""

    agent_names = ("mapper", "investigator", "advocate", "synthesis", "system")

    def _event(self, event: str, data: dict) -> dict:
        return {"event": event, "data": data}

    def _step(self, agent: str, status: str, message: str, data: dict | None = None) -> dict:
        payload = {
            "agent": agent,
            "status": status,
            "message": message,
            "data": data or {},
        }
        return self._event("step", payload)

    async def run(
        self,
        domain: str,
        user_input: str,
        session_dna: dict,
        has_results: bool = False,
        overrides: dict | None = None,
    ):
        started_at = time.perf_counter()
        session_id = uuid4().hex
        overrides = overrides or {}
        trace: dict[str, Any] = {}
        is_deep = overrides.get("deepAnalysis", False)

        yield self._step("system", "running", "Initializing adversarial pipeline.", {"domain": domain, "session_id": session_id})
        await asyncio.sleep(0)

        # ── Agent 1: Mapper ──────────────────────────────────────
        mapper = MapperAgent()
        mapper_output = await mapper.run(user_input)
        trace["optimizer"] = mapper_output  # key kept for frontend compat
        yield self._step("optimizer", "completed", "Mapper extracted claims and assumptions.", trace["optimizer"])
        await asyncio.sleep(0.5)

        # ── Agent 2: Investigator ────────────────────────────────
        investigator = InvestigatorAgent()
        investigator_output = await investigator.run(user_input, mapper_output, is_deep)
        trace["advocate"] = investigator_output  # key kept for frontend compat
        yield self._step("advocate", "completed", "Investigator found blind spots.", trace["advocate"])
        await asyncio.sleep(0.5)

        # ── Agent 3: Advocate ────────────────────────────────────
        advocate = AdvocateAgent()
        advocate_output = await advocate.run(user_input, mapper_output, investigator_output)
        trace["personalizer"] = advocate_output  # key kept for frontend compat
        yield self._step("personalizer", "completed", "Advocate steelmanned the reasoning.", trace["personalizer"])
        await asyncio.sleep(0.5)

        # ── Agent 4: Synthesizer ─────────────────────────────────
        synthesizer = SynthesizerAgent()
        synthesis_output = await synthesizer.run(user_input, mapper_output, investigator_output, advocate_output, is_deep)
        trace["synthesis"] = synthesis_output
        yield self._step("synthesis", "completed", "Synthesizer found the meta-pattern.", trace["synthesis"])
        await asyncio.sleep(0.5)

        # ── Final Payload ────────────────────────────────────────
        final_payload = {
            "domain": domain,
            "shortlist": [],
            "intent": {"query": user_input, "deep_analysis": is_deep},
            "eval": {},
            "constitution": {"safe": True},
            "eval_passes": 0,
            "elapsed_ms": round((time.perf_counter() - started_at) * 1000, 2),
            "trace": trace,
            "session_id": session_id,
        }

        yield self._event("results", final_payload)