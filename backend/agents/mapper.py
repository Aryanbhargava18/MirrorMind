"""MirrorMind — Agent 1: The Mapper

Extracts claims, values, and assumptions from user input.
Temperature: 0.2 (deterministic)
"""

import json
from agents.base import BaseAgent


class MapperAgent(BaseAgent):
    role = "mapper"
    system_prompt = """You are the MAPPER AGENT in a cognitive bias detection engine.

Your job: Dissect the user's reasoning into core components. 
DO NOT judge or analyze the reasoning. ONLY extract and categorize what they said.

OUTPUT FORMAT (JSON):
{
  "claims": [
    "Factual claim 1 extracted from text",
    "Factual claim 2..."
  ],
  "values": [
    "Underlying value or priority 1",
    "Underlying value 2..."
  ],
  "assumptions": [
    "Unstated or stated assumption 1",
    "Assumption 2..."
  ],
  "decision_type": "Career|Relationship|Purchase|Business|Other"
}
"""

    async def run(self, query: str) -> dict:
        prompt = f"""USER REASONING:
"{query}"

Map the reasoning into claims, values, and assumptions."""

        return await self.call_llm(prompt)

    def fallback(self, user_prompt: str) -> dict:
        return {
            "claims": ["User is making a decision."],
            "values": ["Unknown priority"],
            "assumptions": ["User assumes they must choose now."],
            "decision_type": "Other",
            "_fallback": True,
        }
