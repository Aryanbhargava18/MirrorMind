"""TripSense — Base LLM Agent

Supports both OpenAI and Google Gemini.
Auto-detects which provider to use based on config.
Structured JSON output with retry and fallback.
"""

import json
import logging
from config import (
    OPENAI_API_KEY, GEMINI_API_KEY, GROQ_API_KEY, MODEL_ID,
    LLM_PROVIDER, AGENT_TEMPERATURES, has_api_key,
)

logger = logging.getLogger(__name__)


class BaseAgent:
    """Base class for all LLM-powered agents."""

    role = "base"
    system_prompt = ""

    def __init__(self):
        self.temperature = AGENT_TEMPERATURES.get(self.role, 0.3)
        self._openai_client = None
        self._gemini_client = None
        self._groq_client = None

    def _get_openai(self):
        if self._openai_client is None:
            from openai import OpenAI
            self._openai_client = OpenAI(api_key=OPENAI_API_KEY)
        return self._openai_client

    def _get_gemini(self):
        if self._gemini_client is None:
            from google import genai
            self._gemini_client = genai.Client(api_key=GEMINI_API_KEY)
        return self._gemini_client

    def _get_groq(self):
        if self._groq_client is None:
            from groq import Groq
            self._groq_client = Groq(api_key=GROQ_API_KEY, max_retries=0)
        return self._groq_client

    async def call_llm(self, prompt: str) -> dict:
        """Call the configured LLM provider. Returns parsed JSON dict."""
        if not has_api_key():
            return self.fallback(prompt)

        try:
            if LLM_PROVIDER == "openai":
                return await self._call_openai(prompt)
            elif LLM_PROVIDER == "gemini":
                return await self._call_gemini(prompt)
            elif LLM_PROVIDER == "groq":
                return await self._call_groq(prompt)
            else:
                return self.fallback(prompt)
        except Exception as e:
            logger.error(f"[{self.role}] LLM call failed: {e}")
            return self.fallback(prompt)

    async def _call_openai(self, prompt: str) -> dict:
        """Call OpenAI API with structured JSON output."""
        import asyncio
        client = self._get_openai()

        def _sync_call():
            response = client.chat.completions.create(
                model=MODEL_ID,
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": prompt},
                ],
                temperature=self.temperature,
                response_format={"type": "json_object"},
                max_tokens=2000,
            )
            return response.choices[0].message.content

        # Run sync OpenAI call in thread pool
        loop = asyncio.get_event_loop()
        raw = await loop.run_in_executor(None, _sync_call)

        logger.info(f"[{self.role}] OpenAI response: {len(raw)} chars")
        return self._parse_json(raw)

    async def _call_gemini(self, prompt: str) -> dict:
        """Call Google Gemini API with JSON output."""
        import asyncio
        client = self._get_gemini()

        def _sync_call():
            response = client.models.generate_content(
                model=MODEL_ID,
                contents=f"{self.system_prompt}\n\n{prompt}",
                config={
                    "temperature": self.temperature,
                    "response_mime_type": "application/json",
                },
            )
            return response.text

        loop = asyncio.get_event_loop()
        raw = await loop.run_in_executor(None, _sync_call)

        logger.info(f"[{self.role}] Gemini response: {len(raw)} chars")
        return self._parse_json(raw)

    async def _call_groq(self, prompt: str) -> dict:
        """Call Groq API with automatic model failover on rate limits."""
        import asyncio
        from config import FALLBACK_MODEL_ID
        client = self._get_groq()

        def _sync_call(model_id):
            response = client.chat.completions.create(
                model=model_id,
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": prompt},
                ],
                temperature=self.temperature,
                response_format={"type": "json_object"},
                max_tokens=2000,
            )
            return response.choices[0].message.content

        loop = asyncio.get_event_loop()
        
        # Try primary model first
        try:
            raw = await loop.run_in_executor(None, lambda: _sync_call(MODEL_ID))
            logger.info(f"[{self.role}] Groq response ({MODEL_ID}): {len(raw)} chars")
            return self._parse_json(raw)
        except Exception as primary_err:
            if "429" in str(primary_err) or "rate_limit" in str(primary_err):
                logger.warning(f"[{self.role}] Primary model rate-limited, failing over to {FALLBACK_MODEL_ID}")
                if FALLBACK_MODEL_ID and FALLBACK_MODEL_ID != "none":
                    try:
                        raw = await loop.run_in_executor(None, lambda: _sync_call(FALLBACK_MODEL_ID))
                        logger.info(f"[{self.role}] Groq failover response ({FALLBACK_MODEL_ID}): {len(raw)} chars")
                        return self._parse_json(raw)
                    except Exception as fallback_err:
                        logger.error(f"[{self.role}] Failover model also failed: {fallback_err}")
                        return self.fallback(prompt)
                else:
                    return self.fallback(prompt)
            else:
                raise primary_err

    def _parse_json(self, raw: str) -> dict:
        """Parse JSON from LLM response, handling edge cases."""
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            # Try to extract JSON from markdown code blocks
            if "```json" in raw:
                start = raw.index("```json") + 7
                end = raw.index("```", start)
                return json.loads(raw[start:end].strip())
            elif "```" in raw:
                start = raw.index("```") + 3
                end = raw.index("```", start)
                return json.loads(raw[start:end].strip())
            # Try to find first { ... } block
            start = raw.find("{")
            end = raw.rfind("}") + 1
            if start >= 0 and end > start:
                return json.loads(raw[start:end])
            logger.error(f"[{self.role}] Failed to parse JSON: {raw[:200]}")
            return self.fallback(raw)

    def fallback(self, user_prompt: str) -> dict:
        """Override in subclass for agent-specific fallback."""
        return {}
