"""MirrorMind — Guardrails & Constitution Checker

Input validation, output safety checks, and content moderation
to ensure the pipeline handles edge cases gracefully.

Two-layer guardrail system:
  1. Input Guard  — blocks harmful, gibberish, or injection content
  2. Output Guard — validates pipeline output completeness
"""

import logging
import re

logger = logging.getLogger(__name__)

# ── Blocklist for harmful content ─────────────────────────────────
HARMFUL_PATTERNS = [
    r"\b(suicide|self[- ]?harm|murder|assassinate)\b",
    r"\bkill\s+(myself|him|her|them|someone|everyone|people|anybody|somebody)\b",
    r"\b(how to (make|build) (a )?(bomb|weapon|explosive))\b",
    r"\b(illegal drug|synthesize|manufacture)\b",
]

# ── Prompt injection patterns ────────────────────────────────────
INJECTION_PATTERNS = [
    r"ignore (previous|all|above) instructions",
    r"disregard (all |previous )?instructions",
    r"bypass (safety|filters|rules)",
    r"you are now",
    r"new instructions:",
    r"system prompt",
    r"forget (everything|your)",
    r"pretend you",
    r"act as (a |an )?different",
]

GIBBERISH_THRESHOLD = 0.4  # Min ratio of alpha/space chars


class ConstitutionChecker:
    """Validates input safety and output quality before/after processing."""

    def check_input(self, user_input: str) -> dict:
        """
        Validate user input before processing.

        Returns:
            {
                safe: bool,
                flags: list[str],
                sanitized: str
            }
        """
        flags = []

        # 1. Empty / too short
        if not user_input or len(user_input.strip()) < 10:
            flags.append("input_too_short")
            return {
                "safe": False,
                "flags": flags,
                "sanitized": user_input or "",
            }

        # 2. Too long — truncate to prevent abuse
        if len(user_input) > 5000:
            flags.append("input_truncated")
            user_input = user_input[:5000]

        lower_input = user_input.lower()

        # 3. Harmful content check
        for pattern in HARMFUL_PATTERNS:
            if re.search(pattern, lower_input):
                flags.append("potentially_harmful_content")
                logger.warning("[Guardrail] Harmful content flag triggered")
                return {
                    "safe": False,
                    "flags": flags,
                    "sanitized": user_input,
                }

        # 4. Gibberish detection
        alpha_chars = sum(
            1 for c in user_input if c.isalpha() or c.isspace()
        )
        ratio = alpha_chars / max(len(user_input), 1)
        if ratio < GIBBERISH_THRESHOLD:
            flags.append("possible_gibberish")
            return {
                "safe": False,
                "flags": flags,
                "sanitized": user_input,
            }

        # 5. Prompt injection detection
        for pattern in INJECTION_PATTERNS:
            if re.search(pattern, lower_input):
                flags.append("possible_prompt_injection")
                logger.warning(
                    "[Guardrail] Prompt injection attempt detected"
                )
                return {
                    "safe": False,
                    "flags": flags,
                    "sanitized": user_input,
                }

        return {"safe": True, "flags": flags, "sanitized": user_input.strip()}

    def check_output(self, trace: dict) -> dict:
        """
        Validate pipeline output completeness.

        Returns:
            {
                valid: bool,
                flags: list[str],
                fallback_count: int
            }
        """
        flags = []
        agents = ["optimizer", "advocate", "personalizer", "synthesis"]

        # Check that critical keys exist
        for agent in agents:
            if not trace.get(agent):
                flags.append(f"missing_{agent}_output")

        # Count fallback scenarios
        fallback_count = sum(
            1
            for k in agents
            if trace.get(k, {}).get("_fallback")
        )

        if fallback_count == 4:
            flags.append("all_agents_fell_back")
        elif fallback_count > 0:
            flags.append(f"{fallback_count}_agents_fell_back")

        valid = len([f for f in flags if "missing" in f]) == 0

        return {
            "valid": valid,
            "flags": flags,
            "fallback_count": fallback_count,
        }

# Constitution checker ensures prompt injection rejection and input boundaries
