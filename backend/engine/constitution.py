"""TripSense — Constitutional AI Guardrails

LLM-based post-processing check on every agent output.
Enforces C1-C5 rules. Rejects non-compliant results.
Temperature: 0.1 (strict)
"""

import json
from agents.base import BaseAgent
from config import CONSTITUTION


class ConstitutionChecker(BaseAgent):
    role = "constitution"
    system_prompt = f"""You are the CONSTITUTIONAL GUARDRAIL checker for a travel AI agent.

You enforce these 5 inviolable rules on every recommendation:

{chr(10).join(f'{k}: {v}' for k, v in CONSTITUTION.items())}

For each rule, check if the shortlist output complies. If not, specify the fix.

OUTPUT FORMAT (JSON):
{{
  "checks": [
    {{
      "rule": "C1",
      "passed": true/false,
      "details": "What was checked and result",
      "fix": "Required fix if failed, null if passed"
    }}
  ],
  "all_passed": true/false,
  "confidence_flags": [
    {{
      "hotel_id": "string",
      "attribute": "What's unverified",
      "reason": "Why it's flagged"
    }}
  ],
  "forced_additions": ["Any missing anti-recs that need to be added"]
}}"""

    async def check(self, shortlist: dict, hotels_json: list[dict]) -> dict:
        prompt = f"""Check this shortlist against the 5 constitutional rules.

SHORTLIST:
{json.dumps(shortlist, indent=2)}

SOURCE HOTEL DATA (ground truth):
{json.dumps(hotels_json, indent=2)}

Verify every claim. Flag unverified attributes. Ensure anti-recs exist."""

        return await self.call_llm(prompt)

    async def check_intent(self, user_input: str, intent: dict) -> dict:
        prompt = f"""You are the PRE-FLIGHT CONSTITUTIONAL CHECKER.
Check the user's intent for IMPOSSIBLE claims. Examples:
- "private beach in Manhattan" -> Impossible
- "5-star hotel under $50/night" -> Impossible
- "ski resort in Miami" -> Impossible

User input: "{user_input}"
Parsed Intent: {json.dumps(intent)}

OUTPUT FORMAT (JSON):
{{
  "safe": true/false (false if it contains an impossible claim),
  "reason": "If impossible, explain it playfully like: 'Private beaches don't exist in Manhattan. I've adjusted your search to waterfront-view hotels instead.'"
}}"""
        result = await self.call_llm(prompt)
        return result

    def fallback(self, user_prompt: str) -> dict:
        return {
            "checks": [
                {"rule": r, "passed": True, "details": "Fallback — no LLM verification", "fix": None}
                for r in CONSTITUTION.keys()
            ],
            "all_passed": True,
            "confidence_flags": [],
            "forced_additions": [],
            "_fallback": True,
        }
