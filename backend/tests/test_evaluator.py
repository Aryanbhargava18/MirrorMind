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


def test_evaluator_custom_threshold():
    custom_eval = KarpathyEvaluator(max_passes=3, quality_threshold=0.80)
    assert custom_eval.max_passes == 3
    assert custom_eval.quality_threshold == 0.80


def test_evaluator_empty_user_input(evaluator):
    trace = {
        "optimizer": {},
        "advocate": {},
        "personalizer": {},
        "synthesis": {},
    }
    result = evaluator.evaluate(trace, "")
    assert result["passed"] is False
    assert len(result["failures"]) > 0



def test_evaluator_score_precision(evaluator):
    assert isinstance(evaluator.quality_threshold, float)


def test_evaluator_threshold_comparison():
    evaluator = KarpathyEvaluator(quality_threshold=0.7)
    assert evaluator.quality_threshold == 0.7


def test_evaluator_max_passes_constraint():
    evaluator = KarpathyEvaluator(max_passes=1)
    assert evaluator.max_passes == 1


def test_evaluator_score_range():
    evaluator = KarpathyEvaluator()
    assert 0.0 <= evaluator.quality_threshold <= 1.0



def test_evaluator_empty_string_input():
    evaluator = KarpathyEvaluator()
    trace = {"synthesizer": {"output": ""}}
    result = evaluator.evaluate(trace, "")
    assert isinstance(result, dict)
    assert result["passed"] is False


def test_evaluator_whitespace_only_input():
    evaluator = KarpathyEvaluator()
    trace = {"synthesizer": {"output": "   \n\t  "}}
    result = evaluator.evaluate(trace, "")
    assert result["passed"] is False
    assert len(result["failures"]) > 0


def test_evaluator_custom_threshold_bounds():
    evaluator_low = KarpathyEvaluator(quality_threshold=0.1)
    evaluator_high = KarpathyEvaluator(quality_threshold=0.95)
    assert evaluator_low.quality_threshold == 0.1
    assert evaluator_high.quality_threshold == 0.95


def test_evaluator_unicode_prompt_handling():
    evaluator = KarpathyEvaluator()
    trace = {"synthesizer": {"output": "Bonjour le monde! こんにちは世界! Привет мир!"}}
    result = evaluator.evaluate(trace, "Multilingual prompt")
    assert isinstance(result, dict)
    assert "passed" in result
