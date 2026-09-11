"""Unit tests for KarpathyEvaluator self-correction scoring."""

import pytest
from backend.engine.evaluator import KarpathyEvaluator


@pytest.fixture
def evaluator():
    return KarpathyEvaluator(max_passes=2, quality_threshold=0.65)


def test_evaluator_high_quality_trace(evaluator):
    user_input = "I've been building this startup for 2 years, revenue is flat but I feel like we are close."
    trace = {
        "optimizer": {
            "claims": ["Building startup for 2 years", "Revenue is flat"],
            "values": ["Perseverance", "Impact"],
            "assumptions": ["We are close to product-market fit"],
            "decision_type": "Business",
        },
        "advocate": {
            "biases": [
                {
                    "bias": "Sunk Cost Fallacy",
                    "evidence": "I've been building this startup for 2 years",
                    "confidence": "High",
                    "absent_question": "If you started today with zero prior investment, would you build this?",
                }
            ]
        },
        "personalizer": {
            "defense": [
                "Domain knowledge acquired over two years is a defensible moat.",
                "Customer discovery insights reduce future iteration cycles.",
                "Resilience and commitment are required prerequisites for enterprise breakthroughs.",
            ]
        },
        "synthesis": {
            "pattern_name": "The Sunk Cost Horizon Trap",
            "explanation": "You are anchoring forward commitments on past unrecoverable time investments rather than current market pull.",
            "question": "Would you invest your next 6 months of capital into this exact opportunity if you joined today?",
            "confidence": 85,
            "archetypes": [
                {
                    "name": "The Dogged Founder",
                    "description": "Mistaking persistence for customer demand.",
                    "example": "Founders continuing without distribution.",
                }
            ],
        },
    }

    result = evaluator.evaluate(trace, user_input)
    assert result["score"] >= 0.65
    assert result["passed"] is True
    assert len(result["breakdown"]) == 5


def test_evaluator_fallback_trace_fails(evaluator):
    user_input = "I've been building this startup for 2 years."
    trace = {
        "optimizer": {"_fallback": True},
        "advocate": {"_fallback": True},
        "personalizer": {"_fallback": True},
        "synthesis": {"_fallback": True},
    }

    result = evaluator.evaluate(trace, user_input)
    assert result["score"] < 0.65
    assert result["passed"] is False
    assert len(result["failures"]) > 0
