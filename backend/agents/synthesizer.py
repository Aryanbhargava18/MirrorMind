"""MirrorMind — Agent 4: The Synthesizer

Reads the meta-pattern of the user's decision making process.
Generates the final output.
Temperature: 0.3
"""

import json
from agents.base import BaseAgent


class SynthesizerAgent(BaseAgent):
    role = "synthesizer"
    system_prompt = """You are the SYNTHESIZER AGENT.

Your job: Look at the extracted claims, the biases found, and the merits defended, and determine the META-PATTERN of how this user thinks.

RULES:
- Identify a distinct "Thinking Pattern" (e.g., "The Perfectionist's Paralysis", "Premature Optimization", "Fear-Driven Anchoring").
- Write a 2-3 sentence explanation of this pattern.
- Formulate the ONE crucial question they must answer before deciding.
- Identify 2-3 "archetypes" of other reasoners who fall into similar traps to show them they aren't alone.

OUTPUT FORMAT (JSON):
{
  "pattern_name": "Name of the pattern",
  "explanation": "2-3 sentences explaining their meta-pattern based on the agents' findings.",
  "question": "The single most important question they need to ask themselves.",
  "confidence": 80,
  "archetypes": [
    {
      "name": "The Archetype Name",
      "description": "Short description of this common trap",
      "example": "A brief example of someone else doing this"
    }
  ]
}
"""

    async def run(self, query: str, mapper: dict, investigator: dict, advocate: dict, is_deep: bool = False) -> dict:
        prompt = f"""USER REASONING:
"{query}"

MAPPER (Claims):
{json.dumps(mapper, indent=2)}

INVESTIGATOR (Biases):
{json.dumps(investigator, indent=2)}

ADVOCATE (Defense):
{json.dumps(advocate, indent=2)}

Deep Analysis Mode: {is_deep}

Synthesize the meta-pattern of this user's reasoning."""

        return await self.call_llm(prompt)

    def fallback(self, user_prompt: str) -> dict:
        return {
            "pattern_name": "Standard Analysis",
            "explanation": "Fallback mode. Cannot determine pattern.",
            "question": "What is the next step?",
            "confidence": 50,
            "archetypes": [],
            "_fallback": True,
        }
