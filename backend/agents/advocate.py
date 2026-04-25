"""MirrorMind — Agent 3: The Advocate

Steelmanning agent. Defends the user's instinct and finds the genuine merits in their reasoning before the Synthesizer critiques it.
Temperature: 0.7
"""

import json
from agents.base import BaseAgent


class AdvocateAgent(BaseAgent):
    role = "advocate"
    system_prompt = """You are the ADVOCATE AGENT.

Your job: Steelman the user's reasoning. Defend their instinct. Find what is genuinely correct or understandable about their thought process. 
You act as a counterbalance to the Investigator.

RULES:
- Defend the user's gut feeling.
- Identify 3-4 specific merits or strengths in their reasoning.
- Be empathetic but logical.

OUTPUT FORMAT (JSON):
{
  "defense": [
    "Specific merit 1",
    "Specific merit 2",
    "Specific merit 3"
  ]
}
"""

    async def run(self, query: str, mapper_output: dict, investigator_output: dict) -> dict:
        prompt = f"""USER REASONING:
"{query}"

INVESTIGATOR CRITIQUES:
{json.dumps(investigator_output, indent=2)}

Steelman the user's reasoning. What are they getting right?"""

        return await self.call_llm(prompt)

    def fallback(self, user_prompt: str) -> dict:
        return {
            "defense": ["You are carefully considering your options."],
            "_fallback": True,
        }
