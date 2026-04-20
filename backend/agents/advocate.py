"""TripSense — Agent B: Devil's Advocate

Challenges every hotel the Optimizer recommended.
Finds hidden fees, review inconsistencies, unverified claims.
Generates genuine anti-recommendations.
Temperature: 0.4 (creative criticism)
"""

import json
from agents.base import BaseAgent


class AdvocateAgent(BaseAgent):
    role = "advocate"
    system_prompt = """You are the DEVIL'S ADVOCATE agent in a multi-agent hotel recommendation system.

Your job: CHALLENGE every hotel the Optimizer recommended. You exist to protect the user from bad recommendations.

RULES FOR ANTI-RECS (CRITICAL & NON-NEGOTIABLE):
- whatYouMightNotLove / anti_rec is MANDATORY. You MUST identify at least 2 real concerns for this specific hotel.
- If you return "No specific concerns" or any empty/generic variant, your output will be rejected. 
- You MUST base concerns on:
  · Its star rating and price point (e.g. 2-star means small rooms, shared facilities)
  · Its neighborhood (e.g. Long Island City = not walkable to Manhattan attractions)
  · Its review patterns (e.g. 3.7 stars means mixed experiences)
  · Its amenity gaps vs what the user asked for
- Never return 'No specific concerns identified'. If you cannot find concerns, you have not tried hard enough. Every hotel has tradeoffs.
- If star_rating <= 2: "Rooms are typically very small with limited storage"
- If star_rating <= 3 AND price > 10000: "Price-to-quality ratio is questionable at this tier"
- If walkability < 7: "You will need transport for most attractions — not a walk-everywhere stay"
- If review_count < 500: "Limited review data means quality is harder to verify"
- If location contains "airport" or "express": "Positioned for transit, not experience — neighborhood has limited character"
- If rating < 4.0: "Mixed guest experiences — read recent reviews before booking"

- Assign severity: "high" (deal-breaker potential), "medium" (notable concern), "low" (minor issue).
- You CAN reject a hotel entirely if challenges are severe enough.

OUTPUT FORMAT (JSON):
{
  "reasoning": "[Thought] The optimizer ranked this #1, but the user marked 'quiet'. [Action] Halve the score due to nightlife noise levels.",
  "challenges": [
    {
      "hotel_id": "string",
      "hotel_name": "string",
      "challenges": [
        {
          "type": "hidden_fee|review_issue|seasonal|neighborhood|unverified|overrated",
          "severity": "high|medium|low",
          "message": "Specific challenge with evidence"
        }
      ],
      "anti_rec": "Must contain at least 2 specific concerns. Never generic.",
      "score_impact": -5 to -30,
      "should_reject": false
    }
  ],
  "rejections": ["hotel_ids that should be removed entirely"],
  "total_impact": "summary of total score changes"
}"""

    async def run(self, optimizer_output: dict, hotels_json: list[dict], intent: dict, is_retry: bool = False) -> dict:
        prompt = f"""The OPTIMIZER scored these hotels for a {intent.get('trip_type', 'leisure')} trip, budget ${intent.get('budget_min', 100)}-${intent.get('budget_max', 600)}/night:

OPTIMIZER OUTPUT:
{json.dumps(optimizer_output, indent=2)}

FULL HOTEL DATA (for fact-checking):
{json.dumps(hotels_json, indent=2)}

USER INTENT:
{json.dumps(intent, indent=2)}

Challenge every recommended hotel. Find problems. Generate anti-recs. Be tough but fair."""

        if is_retry:
            prompt += """\n\nRETRY REQUIRED: Your previous anti_rec was empty or generic (e.g. 'No specific concerns identified'). This is unacceptable. You MUST identify at least 2 real concerns for EVERY hotel using the rules provided. Do not fail this time."""

        result = await self.call_llm(prompt)
        
        # Check if generic strings exist
        needs_retry = False
        generic_phrases = ["no specific concerns", "no clear concerns", "none identified", "nothing specific"]
        for c in result.get("challenges", []):
            anti_rec = str(c.get("anti_rec", "")).lower()
            if not anti_rec or any(p in anti_rec for p in generic_phrases) or len(anti_rec) < 30:
                needs_retry = True
                break
                
        if needs_retry and not is_retry:
            return await self.run(optimizer_output, hotels_json, intent, is_retry=True)
            
        return result

    def fallback(self, user_prompt: str) -> dict:
        return {
            "reasoning": "Running in fallback mode — basic challenge generation.",
            "challenges": [],
            "rejections": [],
            "total_impact": "Fallback mode — no LLM challenges generated",
            "_fallback": True,
        }
