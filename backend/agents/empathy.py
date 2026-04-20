"""TripSense — Agent C: Empathy Agent

Scans for emotional resonance that data can't capture.
Identifies "soul matches" — hotels that aren't obvious picks 
but will be remembered.
Temperature: 0.7 (creative, intuitive)
"""

import json
from agents.base import BaseAgent


class EmpathyAgent(BaseAgent):
    role = "empathy"
    system_prompt = """You are the EMPATHY AGENT in a multi-agent hotel recommendation system.

Your job: Find what DATA CAN'T CAPTURE. You look for emotional resonance, not numbers.

WHAT YOU SCAN FOR:
- The feeling when you walk into the lobby at 11pm
- Neighborhood soul — not walkability scores, but the VIBE
- Trip-type emotional alignment (a romantic trip FEELS different than a business trip)
- Hidden gems that score lower on data but deliver memorable experiences
- The "soul match" — ONE hotel that isn't the obvious #1 but will be the one they remember

RULES:
- You MUST identify a soul match (can be the same as Optimizer's #1 if justified)
- Add emotional context the other agents missed
- Your notes should read like a friend's honest advice, not a review aggregator
- You CAN override data-driven rankings if emotional signals are strong enough

OUTPUT FORMAT (JSON):
{
  "reasoning": "Your emotional read on this search",
  "soul_match": {
    "hotel_id": "string",
    "hotel_name": "string",
    "why": "Why this hotel will be remembered — emotional, not data-driven",
    "score_boost": 5-20
  },
  "emotional_notes": [
    {
      "hotel_id": "string",
      "hotel_name": "string",
      "notes": ["Emotional observation 1", "Emotional observation 2"],
      "emotional_score": 0-100,
      "trip_type_feel": "How this hotel FEELS for this specific trip type"
    }
  ],
  "override_recommendation": "If you disagree with the Optimizer's ranking, explain why"
}"""

    async def run(self, optimizer_output: dict, hotels_json: list[dict], intent: dict, session_dna: dict) -> dict:
        prompt = f"""The OPTIMIZER scored hotels for a {intent.get('trip_type', 'leisure')} trip.

OPTIMIZER TOP PICKS:
{json.dumps(optimizer_output.get('candidates', [])[:6], indent=2)}

FULL HOTEL DATA:
{json.dumps(hotels_json, indent=2)}

USER CONTEXT:
- Trip type: {intent.get('trip_type', 'leisure')}
- What they care about: {', '.join(intent.get('tags', []))}
- Past bookings: {json.dumps(session_dna.get('pastBookings', []))}

Find the emotional truth. Identify the soul match. What will they FEEL?"""

        return await self.call_llm(prompt)

    def fallback(self, user_prompt: str) -> dict:
        return {
            "reasoning": "Fallback mode — no emotional analysis available.",
            "soul_match": {"hotel_id": "", "hotel_name": "", "why": "Fallback", "score_boost": 0},
            "emotional_notes": [],
            "override_recommendation": None,
            "_fallback": True,
        }
