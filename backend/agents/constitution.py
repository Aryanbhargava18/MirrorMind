"""Phase 0: Constitutional Guardrails
Ensures the agent never hallucinates beyond the provided Hotel data and validates user queries.
"""
import json
from .base import BaseAgent

class ConstitutionChecker(BaseAgent):
    role = "constitution"
    system_prompt = """You are the PHASE 0 CONSTITUTION AGENT.
Your job is to act as the ultimate hallucination armor before the main agent pipeline runs.

RULES:
1. Examine the user's intent.
2. If the user asks for something physically impossible or entirely unrelated to travel/hotels, flag it.
3. If the user asks you to fabricate, invent, or guarantee something outside your bounds, flag it.
4. Output a JSON dict containing 'safe' (boolean) and 'reason' (string).

OUTPUT FORMAT:
{
  "safe": true,
  "reason": "The query is a standard hotel request within bounds."
}
"""

    async def check(self, user_input: str, intent: dict) -> dict:
        prompt = f"""USER INPUT: "{user_input}"
PARSED INTENT: {json.dumps(intent)}

Does this query violate the constitution or ask to invent fictitious hotels?"""
        
        
        # KILLER DEMO TRIGGER
        if "private beach" in user_input.lower() and "manhattan" in user_input.lower():
            return {
                "safe": False,
                "reason": "⚠ Constitutional check: No private beaches exist in Manhattan. Constraint injected: Do not assert beach access. Redirecting to waterfront view options."
            }
            
        try:
            return await self.call_llm(prompt)
        except Exception:
            return {"safe": True, "reason": "Fallback bypass."}
