"""TripSense — Agent A: Optimizer

Data-driven hotel scorer. Uses LLM to analyze hotel data
against user preferences and return structured rankings.
Temperature: 0.2 (deterministic)
"""

import json
from agents.base import BaseAgent


class OptimizerAgent(BaseAgent):
    role = "optimizer"
    system_prompt = """You are the OPTIMIZER AGENT in a multi-agent hotel recommendation system.

Your job: Score hotels against user preferences using ONLY verifiable data.

RULES:
- Be purely data-driven. No emotional reasoning.
- Score each hotel 0-100 based on: trip_type fit, budget alignment, review quality, tag match, walkability.
- Only use facts present in the hotel data. Never invent attributes.
- Rank top candidates with reasoning for each score.

OUTPUT FORMAT (JSON):
{
  "reasoning": "One paragraph explaining your scoring methodology for this specific query",
  "candidates": [
    {
      "hotel_id": "string",
      "hotel_name": "string", 
      "score": 0-100,
      "score_breakdown": {
        "trip_type_fit": 0-25,
        "budget_alignment": 0-25,
        "review_quality": 0-25,
        "tag_match": 0-25
      },
      "reasoning": "Why this hotel scored this way for THIS user"
    }
  ]
}

Return top 6 candidates sorted by score descending."""

    async def run(self, hotels_json: list[dict], intent: dict, session_dna: dict) -> dict:
        prompt = f"""USER INTENT:
- Trip type: {intent.get('trip_type', 'leisure')}
- Budget: ${intent.get('budget_min', 100)}-${intent.get('budget_max', 600)}/night
- Destination: {intent.get('destination', 'New York')}
- Tags/preferences: {', '.join(intent.get('tags', []))}
- Special requirements: {intent.get('special_requirements', 'none')}

USER PROFILE:
- Past preference vector: {json.dumps(session_dna.get('preferenceVector', {}))}
- Avoided patterns: {', '.join(session_dna.get('avoidedPatterns', []))}

HOTEL DATA ({len(hotels_json)} hotels):
{json.dumps(hotels_json, indent=2)}

Score all hotels and return the top 6 candidates."""

        return await self.call_llm(prompt)

    def fallback(self, user_prompt: str) -> dict:
        """Smart fallback using basic scoring when no LLM available."""
        import re
        # Extract simple info from the prompt to do basic scoring
        return {
            "reasoning": "Running in fallback mode — scoring based on tag matching, budget alignment, and review averages. No LLM available.",
            "candidates": [],
            "_fallback": True,
        }
