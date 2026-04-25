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
    "mapper": 0.2,          # Dissects reasoning objectively
    "investigator": 0.4,    # Adversarial, needs slight creativity to spot flaws
    "advocate": 0.7,        # Empathetic, needs higher creativity to steelman
    "synthesizer": 0.3,     # Balanced synthesis of the above
}

# ── API ──
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8001").split(",")

def has_api_key() -> bool:
    return LLM_PROVIDER != "fallback"
