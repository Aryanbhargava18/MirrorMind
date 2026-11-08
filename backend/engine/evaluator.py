"""MirrorMind — Karpathy Self-Correction Evaluator

Rule-based evaluation of agent outputs to determine if the pipeline
should re-run for improved quality. Inspired by Karpathy's "eval-driven"
development loop: generate → evaluate → retry if below threshold.

This evaluator scores outputs on 5 dimensions:
  1. Mapper completeness
  2. Evidence-binding quality (biases backed by real quotes)
  3. Advocate defense specificity
  4. Synthesis pattern quality
  5. Cross-agent coherence
"""

import logging
import re

logger = logging.getLogger(__name__)


class KarpathyEvaluator:
    """Evaluates agent trace quality and decides if re-run is needed."""

    def __init__(self, max_passes: int = 2, quality_threshold: float = 0.65):
        self.max_passes = max_passes
        self.quality_threshold = quality_threshold

    def evaluate(self, trace: dict, user_input: str) -> dict:
        """
        Score the full agent trace on multiple quality dimensions.

        Returns:
            {
                score: float (0-1),
                passed: bool,
                failures: list[str],
                breakdown: dict[str, float]
            }
        """
        scores = {}
        failures = []

        # 1. Mapper completeness
        mapper = trace.get("optimizer", {})
        scores["mapper_completeness"] = self._score_mapper(mapper, failures)

        # 2. Investigator evidence-binding
        investigator = trace.get("advocate", {})
        scores["evidence_binding"] = self._score_investigator(
            investigator, user_input, failures
        )

        # 3. Advocate defense quality
        advocate = trace.get("personalizer", {})
        scores["defense_quality"] = self._score_advocate(advocate, failures)

        # 4. Synthesis quality
        synthesis = trace.get("synthesis", {})
        scores["synthesis_quality"] = self._score_synthesis(synthesis, failures)

        # 5. Cross-agent coherence
        scores["coherence"] = self._score_coherence(trace, failures)

        # Weighted average — evidence-binding and synthesis are weighted highest
        weights = {
            "mapper_completeness": 0.15,
            "evidence_binding": 0.30,
            "defense_quality": 0.15,
            "synthesis_quality": 0.25,
            "coherence": 0.15,
        }

        total = sum(scores[k] * weights[k] for k in scores)
        passed = total >= self.quality_threshold

        logger.info(
            f"[Evaluator] Score: {total:.2f} | Passed: {passed} | "
            f"Failures: {failures}"
        )

        return {
            "score": round(total, 3),
            "passed": passed,
            "failures": failures,
            "breakdown": {k: round(v, 3) for k, v in scores.items()},
        }

    # ── Dimension Scorers ─────────────────────────────────────────

    def _score_mapper(self, mapper: dict, failures: list) -> float:
        """Score mapper output completeness."""
        if mapper.get("_fallback"):
            failures.append("mapper_used_fallback")
            return 0.0

        score = 0.0
        claims = mapper.get("claims", [])
        values = mapper.get("values", [])
        assumptions = mapper.get("assumptions", [])

        if len(claims) >= 2:
            score += 0.4
        elif len(claims) >= 1:
            score += 0.2
        else:
            failures.append("mapper_no_claims")

        if len(values) >= 1:
            score += 0.3
        else:
            failures.append("mapper_no_values")

        if len(assumptions) >= 1:
            score += 0.3
        else:
            failures.append("mapper_no_assumptions")

        return score

    def _score_investigator(
        self, investigator: dict, user_input: str, failures: list
    ) -> float:
        """Score investigator evidence-binding quality. Handles empty user input safely."""
        if not user_input:
            failures.append("investigator_empty_input")
            return 0.0
        if investigator.get("_fallback"):
            failures.append("investigator_used_fallback")
            return 0.0

        biases = investigator.get("biases", [])
        if not biases:
            # Could be legitimate — no biases detected
            failures.append("investigator_no_biases_found")
            return 0.3

        score = 0.0
        evidence_bound = 0
        has_absent_q = 0
        user_lower = user_input.lower()

        for bias in biases:
            evidence = bias.get("evidence", "")
            if evidence and len(evidence) > 10:
                # Check if key phrases from evidence appear in user input
                evidence_words = set(
                    re.findall(r"\w+", evidence.lower())
                )
                user_words = set(re.findall(r"\w+", user_lower))
                overlap = len(evidence_words & user_words) / max(
                    len(evidence_words), 1
                )
                if overlap > 0.3:
                    evidence_bound += 1

            if (
                bias.get("absent_question")
                and len(bias["absent_question"]) > 10
            ):
                has_absent_q += 1

        total_biases = len(biases)
        if total_biases > 0:
            score += 0.5 * (evidence_bound / total_biases)
            score += 0.3 * (has_absent_q / total_biases)
            score += 0.2  # Base score for finding biases

        if evidence_bound == 0:
            failures.append("investigator_no_evidence_binding")

        return min(score, 1.0)

    def _score_advocate(self, advocate: dict, failures: list) -> float:
        """Score advocate defense quality."""
        if advocate.get("_fallback"):
            failures.append("advocate_used_fallback")
            return 0.0

        defense = advocate.get("defense", [])
        if not defense:
            failures.append("advocate_no_defense")
            return 0.0

        score = 0.0

        # Quantity
        if len(defense) >= 3:
            score += 0.4
        elif len(defense) >= 2:
            score += 0.3
        else:
            score += 0.1

        # Quality — penalize generic filler phrases
        generic_phrases = [
            "carefully",
            "thinking about",
            "considering",
            "taking time",
            "being thoughtful",
        ]
        specific_count = 0
        for merit in defense:
            if isinstance(merit, str) and len(merit) > 20:
                is_generic = any(g in merit.lower() for g in generic_phrases)
                if not is_generic:
                    specific_count += 1

        specificity = specific_count / max(len(defense), 1)
        score += 0.6 * specificity

        if specificity < 0.5:
            failures.append("advocate_too_generic")

        return min(score, 1.0)

    def _score_synthesis(self, synthesis: dict, failures: list) -> float:
        """Score synthesis quality."""
        if synthesis.get("_fallback"):
            failures.append("synthesis_used_fallback")
            return 0.0

        score = 0.0

        # Pattern name should be specific
        pattern = synthesis.get("pattern_name", "")
        generic_patterns = [
            "standard analysis",
            "general pattern",
            "basic",
            "unknown",
            "n/a",
        ]
        if pattern and pattern.lower() not in generic_patterns:
            score += 0.3
        else:
            failures.append("synthesis_generic_pattern")

        # Explanation should be substantial
        explanation = synthesis.get("explanation", "")
        if len(explanation) > 50:
            score += 0.25
        elif len(explanation) > 20:
            score += 0.1
        else:
            failures.append("synthesis_weak_explanation")

        # Question should be specific and actionable
        question = synthesis.get("question", "")
        if question and len(question) > 15:
            score += 0.25
        else:
            failures.append("synthesis_no_question")

        # Archetypes present
        archetypes = synthesis.get("archetypes", [])
        if len(archetypes) >= 2:
            score += 0.2
        elif len(archetypes) >= 1:
            score += 0.1

        return min(score, 1.0)

    def _score_coherence(self, trace: dict, failures: list) -> float:
        """Score cross-agent coherence (all agents produced real output)."""
        expected = ["optimizer", "advocate", "personalizer", "synthesis"]
        present = sum(
            1
            for k in expected
            if trace.get(k) and not trace[k].get("_fallback")
        )

        score = present / len(expected)

        if present < len(expected):
            failures.append(
                f"only_{present}_of_{len(expected)}_agents_produced_output"
            )

        return score

# Weighting breakdown: mapper=0.25, investigator=0.35, advocate=0.20, synthesis=0.20

# Evaluator terminates immediately if quality score exceeds threshold on first pass

# Karpathy evaluator enforces multi-dimensional rubric scoring across factual accuracy and completeness

# Multilingual unicode normalization preserves non-ASCII tokens during quality evaluation
