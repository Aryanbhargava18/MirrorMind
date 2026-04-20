"""TripSense — LLM Intent Parser

Parses natural language into structured intent via LLM.
Detects trip type, budget, tags, follow-up type.
Temperature: 0.1 (very deterministic)
"""

import json
from agents.base import BaseAgent


class IntentParser(BaseAgent):
    role = "intent_parser"
    system_prompt = """You are an intent parser for a travel AI agent. Parse the user's message into structured JSON.

DETECT:
- trip_type: leisure | business | romantic | solo | family
- destination: city/area mentioned (default: "New York")
- budget_min / budget_max: INR amounts if mentioned (defaults: 8000, 30000)
- tags: detected preferences like "quiet", "walkable", "rooftop", "luxury", "budget", "design-hotel", etc.
- is_follow_up: true if this is a question about existing results (compare, tell me more, why not, etc.)
- follow_up_type: compare | deep_dive | why_not | decision_help | neighborhood | null
- hotel_mentioned: name of specific hotel if mentioned
- is_ambiguous: true if the query is too vague to act on
- clarifying_question: if ambiguous, suggest what to ask

OUTPUT FORMAT (JSON):
{
  "trip_type": "romantic",
  "destination": "Manhattan", 
  "budget_min": 8000,
  "budget_max": 25000,
  "tags": ["quiet", "walkable"],
  "special_requirements": "none",
  "is_follow_up": false,
  "follow_up_type": null,
  "hotel_mentioned": null,
  "is_ambiguous": false,
  "clarifying_question": null,
  "detected_signals": ["romantic keyword", "budget cap 25000"]
}"""

    async def parse(self, user_input: str, session_dna: dict, has_results: bool = False) -> dict:
        context = f"User has existing results: {has_results}\n" if has_results else ""
        prompt = f"""{context}User's current trip type: {session_dna.get('tripType', 'leisure')}
User's current budget: ₹{session_dna.get('budgetRange', [8000, 30000])[0]}-₹{session_dna.get('budgetRange', [8000, 30000])[1]}
Active tags: {', '.join(session_dna.get('activeTags', []))}

USER MESSAGE: "{user_input}"

Parse this into structured intent JSON."""

        result = await self.call_llm(prompt)

        # Ensure defaults
        return {
            "trip_type": result.get("trip_type", session_dna.get("tripType", "leisure")),
            "destination": result.get("destination", "New York"),
            "budget_min": result.get("budget_min", session_dna.get("budgetRange", [8000, 30000])[0]),
            "budget_max": result.get("budget_max", session_dna.get("budgetRange", [8000, 30000])[1]),
            "tags": result.get("tags", session_dna.get("activeTags", [])),
            "special_requirements": result.get("special_requirements", "none"),
            "is_follow_up": result.get("is_follow_up", False),
            "follow_up_type": result.get("follow_up_type"),
            "hotel_mentioned": result.get("hotel_mentioned"),
            "is_ambiguous": result.get("is_ambiguous", False),
            "clarifying_question": result.get("clarifying_question"),
            "detected_signals": result.get("detected_signals", []),
        }

    def fallback(self, user_prompt: str) -> dict:
        """Basic regex-based intent parsing as fallback."""
        lower = user_prompt.lower()

        # Trip type detection
        trip_type = "leisure"
        if any(w in lower for w in ["romantic", "anniversary", "couple", "honeymoon"]):
            trip_type = "romantic"
        elif any(w in lower for w in ["business", "conference", "meeting", "work"]):
            trip_type = "business"
        elif any(w in lower for w in ["solo", "alone", "myself"]):
            trip_type = "solo"
        elif any(w in lower for w in ["family", "kids", "children"]):
            trip_type = "family"

        # Budget detection
        import re
        budget_max = 600
        match = re.search(r'under\s*\$?(\d+)', lower)
        if match:
            budget_max = int(match.group(1))
        match = re.search(r'\$(\d+)\s*-\s*\$?(\d+)', lower)
        budget_min = 100
        if match:
            budget_min, budget_max = int(match.group(1)), int(match.group(2))

        # Tag detection
        tag_keywords = {
            "quiet": ["quiet", "peaceful", "calm"],
            "walkable": ["walkable", "walk", "walking"],
            "luxury": ["luxury", "luxurious", "upscale", "high-end"],
            "budget": ["budget", "cheap", "affordable"],
            "rooftop": ["rooftop", "roof"],
            "design-hotel": ["design", "boutique"],
            "foodie": ["food", "restaurant", "dining"],
            "romantic": ["romantic", "intimate"],
            "social": ["social", "lively", "buzzy"],
            "historic": ["historic", "history", "old"],
            "eco": ["eco", "sustainable", "green"],
            "family-friendly": ["family", "kids"],
        }
        tags = []
        for tag, keywords in tag_keywords.items():
            if any(kw in lower for kw in keywords):
                tags.append(tag)

        # Follow-up detection
        is_follow_up = any(phrase in lower for phrase in [
            "compare", "tell me more", "more about", "what about",
            "why not", "why didn't", "help me decide", "which one",
            "pick", "choose", "neighborhood", "nearby", "area",
        ])

        follow_up_type = None
        if "compare" in lower:
            follow_up_type = "compare"
        elif any(p in lower for p in ["tell me more", "more about", "what about", "details"]):
            follow_up_type = "deep_dive"
        elif any(p in lower for p in ["why not", "why didn't"]):
            follow_up_type = "why_not"
        elif any(p in lower for p in ["help me decide", "which one", "pick", "choose"]):
            follow_up_type = "decision_help"
        elif any(p in lower for p in ["neighborhood", "nearby", "area", "around"]):
            follow_up_type = "neighborhood"

        # Destination detection
        known_cities = [
            "new york", "paris", "london", "tokyo", "dubai", "bali",
            "rome", "barcelona", "amsterdam", "bangkok", "singapore",
            "los angeles", "san francisco", "miami", "chicago", "las vegas",
            "istanbul", "sydney", "delhi", "mumbai", "goa", "jaipur",
            "hong kong", "seoul", "berlin", "prague", "vienna", "lisbon",
            "florence", "venice", "cancun", "maldives", "hawaii", "phuket",
            "marrakech", "cairo", "cape town", "rio", "buenos aires",
        ]
        destination = "New York"
        for city in known_cities:
            if city in lower:
                destination = city.title()
                break

        return {
            "trip_type": trip_type,
            "destination": destination,
            "budget_min": budget_min,
            "budget_max": budget_max,
            "tags": tags,
            "special_requirements": "none",
            "is_follow_up": is_follow_up,
            "follow_up_type": follow_up_type,
            "hotel_mentioned": None,
            "is_ambiguous": len(lower.split()) < 3 and not is_follow_up,
            "clarifying_question": None,
            "detected_signals": [f"fallback_parsed: {trip_type}, dest={destination}, tags={tags}"],
        }
