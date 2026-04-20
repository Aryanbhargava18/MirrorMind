"""TripSense — Synthesizer Agent

Merges outputs from all three agents into a final ranked shortlist.
Resolves conflicts, applies score adjustments, generates unique "why it fits".
Temperature: 0.3
"""

import json
from agents.base import BaseAgent
from config import MAX_SHORTLIST


class SynthesizerAgent(BaseAgent):
    role = "synthesizer"
    system_prompt = f"""You are a REASONING ENGINE, not a chatbot. You are the SYNTHESIZER in a multi-agent hotel recommendation system.

You receive outputs from THREE agents:
1. OPTIMIZER — data-driven scores and rankings
2. DEVIL'S ADVOCATE — challenges, anti-recs, potential rejections
3. EMPATHY AGENT — emotional signals, soul match, override recommendations

Your job: MERGE these into a final shortlist of {MAX_SHORTLIST} hotels.

You are NOT a chatbot. Do not greet the user. Do not use filler phrases like "Great choice!" or "I'd be happy to help". Return structured JSON only.

MERGE RULES:
- Start with Optimizer's ranking
- Apply Devil's Advocate's score impacts (subtract their penalties)
- If Advocate rejected a hotel, remove it and explain why
- Insert Empathy's soul match if it's not already in the top {MAX_SHORTLIST}
- If Empathy's override disagrees with Optimizer, note the conflict

WHY_IT_FITS RULES (non-negotiable):
- Write exactly 2 sentences.
- Sentence 1: Name one SPECIFIC physical feature of THIS hotel (e.g. 'The Jane Hotel's original 1907 ballroom is one of NYC's last genuine historic music venues' — not 'has a distinctive character').
- Sentence 2: Connect a specific user signal to a specific hotel attribute (e.g. 'Since you want budget options with local flavour, the shared bathrooms are a worthwhile trade for the $130/night rate and location').
- BANNED phrases: 'distinct character', 'stands out', 'standard hotel', 'elevates your experience', 'doesn't try to be everything', 'neighborhood context', 'beyond what the room delivers', 'distinctive character', 'makes it stand out', 'stretch'.
- If you use any banned phrase, your response will be rejected and retried.

ANTI-REC RULES:
- whatYouMightNotLove / anti_rec is MANDATORY for every hotel. If missing, use the source hotel's antiRec field.
- It must be honest, specific, and not a generic disclaimer.

LOYALTY RULES (CRITICAL):
- Check the user's Session DNA for loyalty status and point balance.
- If points > 0, you MUST include a "loyalty_math" field in the output for at least one hotel that mathematically calculates how their points reduce the cost or add value (e.g., "Your 45,000 points cover 1.5 nights, dropping the total from $800 to $400"). 
- Do NOT output generic point statements like "You can use points here." Use exact numbers.

MATCH SCORE RULES:
- matchScore must be a JSON object:
  matchScore: {{ "total": 75, "budgetFit": 9, "tripTypeMatch": 8, "reviewSignal": 7, "agentConsensus": "A+C" }}

OUTPUT FORMAT (JSON):
{{
  "reasoning": "How you resolved conflicts between the three agents",
  "did_advocate_change_ranking": true/false,
  "did_empathy_override": true/false,
  "shortlist": [
    {{
      "hotel_id": "string",
      "hotel_name": "string",
      "final_score": 0-100,
      "optimizer_score": 0-100,
      "advocate_impact": -N,
      "empathy_boost": +N,
      "why_it_fits": "2 UNIQUE sentences — hotel-specific attribute + user-specific connection",
      "anti_rec": "From Devil's Advocate — honest, specific criticism",
      "loyalty_math": "Mathematical string explaining how points reduce cost (or null if N/A)",
      "is_soul_match": false,
      "matchScore": {{ "total": 75, "budgetFit": 9, "tripTypeMatch": 8, "reviewSignal": 7, "agentConsensus": "A" }},
      "total_cost_per_night": N,
      "tags": ["relevant tags"]
    }}
  ],
  "rejected_hotels": [
    {{
      "hotel_id": "string",
      "hotel_name": "string", 
      "reason": "Why it was cut"
    }}
  ]
}}"""

    async def run(self, optimizer_output: dict, advocate_output: dict, empathy_output: dict, intent: dict, session_dna: dict, eval_critique: dict = None) -> dict:
        prompt = f"""MERGE these three agent outputs into a final shortlist.

USER INTENT:
- Trip: {intent.get('trip_type', 'leisure')}
- Budget: ${intent.get('budget_min', 100)}-${intent.get('budget_max', 600)}/night
- Preferences: {', '.join(intent.get('tags', []))}


OPTIMIZER OUTPUT:
{json.dumps(optimizer_output, indent=2)}

DEVIL'S ADVOCATE OUTPUT:
{json.dumps(advocate_output, indent=2)}

EMPATHY AGENT OUTPUT:
{json.dumps(empathy_output, indent=2)}

CRITICAL: Each why_it_fits MUST be unique. Reference each hotel's specific name and a physical attribute. Do NOT use generic copywriting. Do NOT reuse sentence structures.
"""
        if eval_critique:
            prompt += f"""
RETRY FLAG - PREVIOUS OUTPUT FAILED EVALUATION
Your last output failed evaluation. Critique: {eval_critique.get('critique')}
Improvements required: {json.dumps(eval_critique.get('improvements', []))}
Ensure you fix these in this rewrite!"""

        return await self.call_llm(prompt)

    def fallback(self, user_prompt: str) -> dict:
        return {
            "reasoning": "Fallback mode — no synthesis available.",
            "did_advocate_change_ranking": False,
            "did_empathy_override": False,
            "shortlist": [],
            "rejected_hotels": [],
            "_fallback": True,
        }
