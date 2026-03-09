"""MirrorMind — ReAct Orchestration Loop

Runs the four-agent adversarial pipeline with:
  - Input guardrails (constitution checker)
  - Karpathy self-correction loop (eval → retry if below threshold)
  - Per-agent latency tracking
  - Output validation
  - Metrics collection

Pipeline:
  1. Guardrail input check
  2. Mapper     — extracts claims, values, assumptions
  3. Investigator — flags biases with exact quoted evidence
  4. Advocate   — steelmans the user's reasoning
  5. Synthesizer — identifies the meta-pattern
  6. Karpathy eval — score trace, retry if below threshold
  7. Guardrail output check
  8. Record metrics
"""

from __future__ import annotations

import asyncio
import logging
import time
from typing import Any
from uuid import uuid4

try:
    from backend.agents.mapper import MapperAgent  # type: ignore
    from backend.agents.investigator import InvestigatorAgent  # type: ignore
    from backend.agents.advocate import AdvocateAgent  # type: ignore
    from backend.agents.synthesizer import SynthesizerAgent  # type: ignore
    from backend.engine.evaluator import KarpathyEvaluator  # type: ignore
    from backend.engine.guardrails import ConstitutionChecker  # type: ignore
    from backend.engine.metrics import MetricsCollector  # type: ignore
except Exception:  # pragma: no cover
    from agents.mapper import MapperAgent  # type: ignore
    from agents.investigator import InvestigatorAgent  # type: ignore
    from agents.advocate import AdvocateAgent  # type: ignore
    from agents.synthesizer import SynthesizerAgent  # type: ignore
    from engine.evaluator import KarpathyEvaluator  # type: ignore
    from engine.guardrails import ConstitutionChecker  # type: ignore
    from engine.metrics import MetricsCollector  # type: ignore

logger = logging.getLogger(__name__)


class ReActLoop:
    """Streams agent-by-agent analysis events via SSE."""

    agent_names = ("mapper", "investigator", "advocate", "synthesis", "system")

    def __init__(self):
        self.evaluator = KarpathyEvaluator(max_passes=2, quality_threshold=0.65)
        self.constitution = ConstitutionChecker()
        self.metrics = MetricsCollector()

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
        is_deep = overrides.get("deepAnalysis", False)

        # Per-request metric tracking
        agent_latencies: dict[str, float] = {}
        request_metrics: dict[str, Any] = {
            "session_id": session_id,
            "timestamp": time.time(),
            "domain": domain,
            "deep_analysis": is_deep,
        }

        # ── Guardrail: Input Check ────────────────────────────────
        input_check = self.constitution.check_input(user_input)
        request_metrics["guardrail_input_safe"] = input_check["safe"]
        request_metrics["guardrail_input_flags"] = input_check["flags"]

        if not input_check["safe"]:
            yield self._step(
                "system", "blocked",
                f"Input blocked by guardrail: {', '.join(input_check['flags'])}",
                {"flags": input_check["flags"]},
            )
            # Record metrics even for blocked requests
            request_metrics["total_latency_ms"] = round(
                (time.perf_counter() - started_at) * 1000, 2
            )
            request_metrics["eval_passes"] = 0
            request_metrics["eval_score"] = 0
            request_metrics["used_fallback"] = False
            request_metrics["agent_latencies_ms"] = {}
            self.metrics.record(request_metrics)

            # Return a safe error payload
            yield self._event("results", {
                "domain": domain,
                "shortlist": [],
                "intent": {"query": user_input, "deep_analysis": is_deep},
                "eval": {"score": 0, "passed": False, "failures": input_check["flags"]},
                "constitution": {"safe": False, "flags": input_check["flags"]},
                "eval_passes": 0,
                "elapsed_ms": round((time.perf_counter() - started_at) * 1000, 2),
                "trace": {},
                "session_id": session_id,
            })
            return

        user_input = input_check["sanitized"]

        yield self._step(
            "system", "running",
            "Input validated. Initializing adversarial pipeline.",
            {"domain": domain, "session_id": session_id, "guardrail": "passed"},
        )
        await asyncio.sleep(0)

        # ── Karpathy Self-Correction Loop ─────────────────────────
        trace: dict[str, Any] = {}
        eval_result: dict = {}
        first_pass_score: float = 0.0
        current_pass = 0

        while current_pass < self.evaluator.max_passes:
            current_pass += 1
            pass_started = time.perf_counter()

            if current_pass > 1:
                yield self._step(
                    "system", "retrying",
                    f"Karpathy eval failed (score: {eval_result.get('score', 0):.2f}). "
                    f"Re-running pipeline — pass {current_pass}/{self.evaluator.max_passes}.",
                    {"pass": current_pass, "prev_score": eval_result.get("score", 0),
                     "failures": eval_result.get("failures", [])},
                )
                trace = {}  # Reset trace for retry
                await asyncio.sleep(0.3)

            # ── Agent 1: Mapper ───────────────────────────────────
            t0 = time.perf_counter()
            mapper = MapperAgent()
            mapper_output = await mapper.run(user_input)
            agent_latencies["mapper"] = round((time.perf_counter() - t0) * 1000, 1)

            trace["optimizer"] = mapper_output
            yield self._step(
                "optimizer", "completed",
                "Mapper extracted claims and assumptions.",
                trace["optimizer"],
            )
            await asyncio.sleep(0.3)

            # ── Agent 2: Investigator ─────────────────────────────
            t0 = time.perf_counter()
            investigator = InvestigatorAgent()
            investigator_output = await investigator.run(
                user_input, mapper_output, is_deep
            )
            agent_latencies["investigator"] = round((time.perf_counter() - t0) * 1000, 1)

            trace["advocate"] = investigator_output
            yield self._step(
                "advocate", "completed",
                "Investigator found blind spots.",
                trace["advocate"],
            )
            await asyncio.sleep(0.3)

            # ── Agent 3: Advocate ─────────────────────────────────
            t0 = time.perf_counter()
            advocate = AdvocateAgent()
            advocate_output = await advocate.run(
                user_input, mapper_output, investigator_output
            )
            agent_latencies["advocate"] = round((time.perf_counter() - t0) * 1000, 1)

            trace["personalizer"] = advocate_output
            yield self._step(
                "personalizer", "completed",
                "Advocate steelmanned the reasoning.",
                trace["personalizer"],
            )
            await asyncio.sleep(0.3)

            # ── Agent 4: Synthesizer ──────────────────────────────
            t0 = time.perf_counter()
            synthesizer = SynthesizerAgent()
            synthesis_output = await synthesizer.run(
                user_input, mapper_output, investigator_output,
                advocate_output, is_deep,
            )
            agent_latencies["synthesizer"] = round((time.perf_counter() - t0) * 1000, 1)

            trace["synthesis"] = synthesis_output
            yield self._step(
                "synthesis", "completed",
                "Synthesizer found the meta-pattern.",
                trace["synthesis"],
            )
            await asyncio.sleep(0.3)

            # ── Karpathy Evaluation ───────────────────────────────
            eval_result = self.evaluator.evaluate(trace, user_input)

            if current_pass == 1:
                first_pass_score = eval_result["score"]

            yield self._step(
                "system", "evaluating",
                f"Karpathy eval — pass {current_pass}: "
                f"score={eval_result['score']:.2f}, passed={eval_result['passed']}",
                {
                    "pass": current_pass,
                    "eval_score": eval_result["score"],
                    "eval_passed": eval_result["passed"],
                    "breakdown": eval_result["breakdown"],
                    "failures": eval_result["failures"],
                },
            )

            if eval_result["passed"]:
                logger.info(
                    f"[ReActLoop] Karpathy eval PASSED on pass {current_pass} "
                    f"(score: {eval_result['score']:.2f})"
                )
                break
            else:
                logger.warning(
                    f"[ReActLoop] Karpathy eval FAILED on pass {current_pass} "
                    f"(score: {eval_result['score']:.2f}, "
                    f"failures: {eval_result['failures']})"
                )

        # ── Guardrail: Output Check ───────────────────────────────
        output_check = self.constitution.check_output(trace)
        used_fallback = output_check.get("fallback_count", 0) > 0

        # ── Record Metrics ────────────────────────────────────────
        total_latency = round((time.perf_counter() - started_at) * 1000, 2)

        request_metrics.update({
            "total_latency_ms": total_latency,
            "agent_latencies_ms": agent_latencies,
            "eval_passes": current_pass,
            "eval_score": eval_result.get("score", 0),
            "eval_passed": eval_result.get("passed", False),
            "eval_breakdown": eval_result.get("breakdown", {}),
            "first_pass_score": first_pass_score,
            "used_fallback": used_fallback,
            "output_valid": output_check["valid"],
            "output_flags": output_check["flags"],
        })
        self.metrics.record(request_metrics)

        # ── Final Payload ─────────────────────────────────────────
        final_payload = {
            "domain": domain,
            "shortlist": [],
            "intent": {"query": user_input, "deep_analysis": is_deep},
            "eval": {
                "score": eval_result.get("score", 0),
                "passed": eval_result.get("passed", False),
                "passes": current_pass,
                "breakdown": eval_result.get("breakdown", {}),
            },
            "constitution": {
                "safe": input_check["safe"],
                "output_valid": output_check["valid"],
                "flags": output_check["flags"],
            },
            "eval_passes": current_pass,
            "elapsed_ms": total_latency,
            "agent_latencies_ms": agent_latencies,
            "trace": trace,
            "session_id": session_id,
        }

        yield self._event("results", final_payload)
# ReActLoop emits SSE events in order: mapper, investigator, advocate, synthesizer
