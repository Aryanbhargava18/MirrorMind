"""Unit tests for the MetricsCollector engine component."""

import pytest
from backend.engine.metrics import MetricsCollector


def test_metrics_empty_history():
    collector = MetricsCollector()
    aggregates = collector.get_aggregates()
    assert aggregates["total_requests"] == 0
    assert "No metrics recorded yet" in aggregates["message"]


def test_metrics_reset():
    collector = MetricsCollector()
    collector.record({"total_latency_ms": 100.0, "eval_score": 0.8})
    assert collector.get_aggregates()["total_requests"] == 1
    collector.reset()
    assert collector.get_aggregates()["total_requests"] == 0



def test_metrics_record_and_aggregation():
    collector = MetricsCollector()

    sample_metric_1 = {
        "total_latency_ms": 1200.0,
        "agent_latencies_ms": {
            "mapper": 300.0,
            "investigator": 400.0,
            "advocate": 250.0,
            "synthesizer": 250.0,
        },
        "eval_passes": 1,
        "eval_score": 0.85,
        "guardrail_input_safe": True,
        "used_fallback": False,
    }

    sample_metric_2 = {
        "total_latency_ms": 2400.0,
        "agent_latencies_ms": {
            "mapper": 500.0,
            "investigator": 800.0,
            "advocate": 600.0,
            "synthesizer": 500.0,
        },
        "eval_passes": 2,
        "first_pass_score": 0.50,
        "eval_score": 0.75,
        "guardrail_input_safe": True,
        "used_fallback": False,
    }

    sample_metric_blocked = {
        "total_latency_ms": 50.0,
        "agent_latencies_ms": {},
        "eval_passes": 0,
        "eval_score": 0.0,
        "guardrail_input_safe": False,
        "used_fallback": True,
    }

    collector.record(sample_metric_1)
    collector.record(sample_metric_2)
    collector.record(sample_metric_blocked)

    agg = collector.get_aggregates()

    assert agg["total_requests"] == 3

    # Latency checks
    assert agg["latency"]["avg_ms"] == pytest.approx(1216.7, abs=0.5)
    assert "per_agent_avg_ms" in agg["latency"]
    assert agg["latency"]["per_agent_avg_ms"]["mapper"] == 266.7
    assert agg["latency"]["per_agent_avg_ms"]["investigator"] == 400.0

    # Quality and retry checks
    assert agg["quality"]["avg_eval_score"] == pytest.approx(0.533, abs=0.01)
    assert agg["quality"]["self_correction_retry_rate"] == pytest.approx(0.333, abs=0.01)
    # Improvement calculation: (0.75 - 0.50) / 0.50 = 50%
    assert agg["quality"]["avg_improvement_after_retry"] == "50.0%"

    # Guardrails checks
    assert agg["guardrails"]["total_blocked"] == 1
    assert agg["guardrails"]["block_rate"] == pytest.approx(0.333, abs=0.01)

    # Reliability checks
    assert agg["reliability"]["total_fallbacks"] == 1
    assert agg["reliability"]["fallback_rate"] == pytest.approx(0.333, abs=0.01)
    assert agg["reliability"]["success_rate"] == pytest.approx(0.667, abs=0.01)

def test_metrics_p50_p95_bounds():
    collector = MetricsCollector()
    collector.record({"total_latency_ms": 150.0, "eval_score": 0.8})
    agg = collector.get_aggregates()
    assert agg["latency"]["avg_ms"] == 150.0


def test_metrics_empty_latency_handling():
    collector = MetricsCollector()
    agg = collector.get_aggregates()
    assert agg["total_requests"] == 0



def test_calculate_percentile_utility():
    from backend.engine.metrics import calculate_percentile
    vals = [10.0, 20.0, 30.0, 40.0, 50.0]
    assert calculate_percentile(vals, 0.5) == 30.0
    assert calculate_percentile(vals, 0.9) == 50.0
    assert calculate_percentile([], 0.5) == 0.0


def test_metrics_collector_empty_record():
    collector = MetricsCollector()
    agg = collector.get_aggregates()
    assert agg["total_requests"] == 0
    assert "message" in agg
