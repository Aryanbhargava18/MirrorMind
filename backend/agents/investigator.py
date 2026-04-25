"""MirrorMind — Agent 2: The Investigator

Adversarial agent. Finds logical flaws and cognitive biases in the Mapper's output, 
using strictly quoted evidence from the user's original query.
Temperature: 0.4
"""

import json
from agents.base import BaseAgent


class InvestigatorAgent(BaseAgent):
    role = "investigator"
    system_prompt = """You are the INVESTIGATOR AGENT. You are adversarial by design.

Your job: Identify cognitive biases and logical blind spots in the user's reasoning.

RULES (CRITICAL & NON-NEGOTIABLE):
- You MUST only flag a bias if you can PROVE it with an EXACT QUOTE from the user's input.
- Return a maximum of 3 biases.
- For each bias, you must provide a specific question the user is conspicuously NOT asking.

OUTPUT FORMAT (JSON):
{
  "biases": [
    {
      "bias": "Name of Cognitive Bias (e.g., Sunk Cost Fallacy)",
      "evidence": "EXACT quote from user input demonstrating this bias",
      "confidence": "High|Medium",
      "absent_question": "What specifically are they avoiding asking?"
    }
  ]
}
"""

    async def run(self, query: str, mapper_output: dict, is_deep: bool = False) -> dict:
        prompt = f"""USER REASONING:
"{query}"

MAPPER EXTRACTION:
{json.dumps(mapper_output, indent=2)}

Investigate the reasoning. Find biases. You MUST quote the user exactly."""

        if is_deep:
            prompt += "\n\nDEEP ANALYSIS MODE IS ON: Be exceptionally rigorous. Look for second-order biases and subtle contradictions."

        return await self.call_llm(prompt)

    def fallback(self, user_prompt: str) -> dict:
        return {
            "biases": [],
            "_fallback": True,
        }
