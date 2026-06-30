"""MirrorMind — Metrics Collector

Tracks per-request performance metrics for observability.
Stores in-memory with aggregate computation for the /api/metrics endpoint.

Tracked dimensions:
  - Per-agent latency (ms)
  - Total pipeline latency (ms)
  - Karpathy eval passes & scores
  - Guardrail block rates
  - Fallback rates
  - Self-correction improvement %
"""

import logging
import time
from collections import deque
from threading import Lock

logger = logging.getLogger(__name__)

MAX_HISTORY = 1000  # Keep last 1000 requests in memory


class MetricsCollector:
    """Collects and aggregates pipeline performance metrics."""

    def __init__(self):
        self._history: deque = deque(maxlen=MAX_HISTORY)
        self._lock = Lock()

    def record(self, metrics: dict) -> None:
        """Record a single request's metrics."""
        with self._lock:
            self._history.append(metrics)

        logger.info(
            f"[Metrics] latency={metrics.get('total_latency_ms', 0):.0f}ms | "
            f"eval_passes={metrics.get('eval_passes', 0)} | "
            f"eval_score={metrics.get('eval_score', 0):.2f} | "
            f"guardrail={'PASS' if metrics.get('guardrail_input_safe') else 'BLOCK'}"
        )

    def reset(self) -> None:
        """Clear recorded metrics history."""
        with self._lock:
            self._history.clear()

    def get_aggregates(self) -> dict:
        """Compute aggregate statistics across all recorded requests."""
        with self._lock:
            history = list(self._history)

        if not history:
            return {"total_requests": 0, "message": "No metrics recorded yet."}

        total = len(history)

        # ── Latency ──────────────────────────────────────────────
        latencies = [
            m["total_latency_ms"]
            for m in history
            if "total_latency_ms" in m
        ]
        avg_latency = sum(latencies) / len(latencies) if latencies else 0
        sorted_lat = sorted(latencies)
        p50_latency = sorted_lat[int(len(sorted_lat) * 0.5)] if sorted_lat else 0
        p95_latency = sorted_lat[int(len(sorted_lat) * 0.95)] if sorted_lat else 0

        # Per-agent latency averages
        agent_latencies = {}
        for agent in ["mapper", "investigator", "advocate", "synthesizer"]:
            agent_times = [
                m["agent_latencies_ms"].get(agent, 0)
                for m in history
                if "agent_latencies_ms" in m
            ]
            if agent_times:
                agent_latencies[agent] = round(
                    sum(agent_times) / len(agent_times), 1
                )

        # ── Eval Quality ─────────────────────────────────────────
        eval_scores = [
            m["eval_score"] for m in history if "eval_score" in m
        ]
        avg_eval_score = (
            sum(eval_scores) / len(eval_scores) if eval_scores else 0
        )

        # Self-correction stats
        eval_passes = [
            m["eval_passes"] for m in history if "eval_passes" in m
        ]
        needed_retry = sum(1 for p in eval_passes if p > 1)
        retry_rate = needed_retry / len(eval_passes) if eval_passes else 0

        # Improvement from self-correction
        retried = [m for m in history if m.get("eval_passes", 1) > 1]
        improvements = []
        for m in retried:
            before = m.get("first_pass_score", 0)
            after = m.get("eval_score", 0)
            if before > 0:
                improvements.append((after - before) / before)
        avg_improvement = (
            sum(improvements) / len(improvements) if improvements else 0
        )

        # ── Guardrail Stats ──────────────────────────────────────
        guardrail_blocked = sum(
            1 for m in history if not m.get("guardrail_input_safe", True)
        )
        guardrail_block_rate = guardrail_blocked / total

        # ── Reliability ──────────────────────────────────────────
        fallback_count = sum(
            1 for m in history if m.get("used_fallback", False)
        )
        fallback_rate = fallback_count / total

        return {
            "total_requests": total,
            "latency": {
                "avg_ms": round(avg_latency, 1),
                "p50_ms": round(p50_latency, 1),
                "p95_ms": round(p95_latency, 1),
                "per_agent_avg_ms": agent_latencies,
            },
            "quality": {
                "avg_eval_score": round(avg_eval_score, 3),
                "self_correction_retry_rate": round(retry_rate, 3),
                "avg_improvement_after_retry": f"{round(avg_improvement * 100, 1)}%",
            },
            "guardrails": {
                "block_rate": round(guardrail_block_rate, 3),
                "total_blocked": guardrail_blocked,
            },
            "reliability": {
                "fallback_rate": round(fallback_rate, 3),
                "total_fallbacks": fallback_count,
                "success_rate": round(1.0 - fallback_rate, 3),
            },
        }

# Percentiles (p50 and p95) are computed using exact nearest-rank sorting over in-memory history
