"""TripSense — Configuration"""

import os
from dotenv import load_dotenv

load_dotenv()

# ── LLM ──
# Supports OpenAI, Gemini, or Groq
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# Auto-detect which provider to use
if OPENAI_API_KEY and OPENAI_API_KEY != "your_key_here":
    LLM_PROVIDER = "openai"
    MODEL_ID = "gpt-4o-mini"
elif GEMINI_API_KEY and GEMINI_API_KEY != "your_key_here":
    LLM_PROVIDER = "gemini"
    MODEL_ID = "gemini-2.0-flash"
elif GROQ_API_KEY and GROQ_API_KEY != "your_key_here":
    LLM_PROVIDER = "groq"
    MODEL_ID = "llama-3.3-70b-versatile"
    FALLBACK_MODEL_ID = "llama-3.1-8b-instant"  # Separate rate limit pool
else:
    LLM_PROVIDER = "fallback"
    MODEL_ID = "none"
    FALLBACK_MODEL_ID = "none"

# Temperature per agent role — controls creativity vs determinism
AGENT_TEMPERATURES = {
    "intent_parser": 0.1,   # Very deterministic — parse structure
    "optimizer": 0.2,       # Data-driven, minimal creativity
    "advocate": 0.4,        # Needs creative criticism
    "empathy": 0.7,         # Most creative — emotional signals
    "synthesizer": 0.3,     # Balanced merge
    "constitution": 0.1,    # Strict rule checking
    "evaluator": 0.2,       # Objective scoring
}

# ── Constitutional Rules ──
CONSTITUTION = {
    "C1": "No hallucination — every claim must be verifiable against source hotel data.",
    "C2": "Confidence flags — uncertain/unverified attributes must be flagged.",
    "C3": "Price transparency — total cost including all fees must be shown.",
    "C4": "Anti-rec mandatory — every recommended hotel MUST have genuine criticism.",
    "C5": "AI disclosure — user must always know this is AI-generated.",
}

# ── Eval Thresholds ──
EVAL_THRESHOLDS = {
    "relevance": 0.7,
    "honesty": 0.8,
    "constitutional": 0.9,
    "debate_utilization": 0.6,
    "diversity": 0.5,
}

# ── API ──
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8001").split(",")
MAX_SHORTLIST = 4
MAX_CANDIDATES = 15

def has_api_key() -> bool:
    return LLM_PROVIDER != "fallback"
