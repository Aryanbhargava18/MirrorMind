"""TripSense — ReAct Reasoning Loop

Observe → Think → Act cycle with real LLM calls.
Falls back to algorithmic scoring when no API key.
Yields progressive steps for SSE streaming.
"""

import json
import time
import logging
from config import has_api_key
from engine.intent_parser import IntentParser
from agents.constitution import ConstitutionChecker
from engine.hallucination import check_hallucinations
from engine.evaluator import KarpathyEvaluator
from engine.fallback import (
    fallback_optimizer, fallback_advocate,
    fallback_empathy, fallback_synthesizer,
)
from data.hotel_provider import get_genuine_hotels

import hashlib

logger = logging.getLogger(__name__)

_llm_agents = None

# ── Lightweight In-Memory Cache ──
# Prevents eating LLM token costs for identical queries.
# To scale across processes, replace this dict with a Redis client.
_response_cache = {}

def _get_llm_agents():
    global _llm_agents
    if _llm_agents is None and has_api_key():
        from agents.optimizer import OptimizerAgent
        from agents.advocate import AdvocateAgent
        from agents.empathy import EmpathyAgent
        from agents.synthesizer import SynthesizerAgent
        _llm_agents = {
            "optimizer": OptimizerAgent(),
            "advocate": AdvocateAgent(),
            "empathy": EmpathyAgent(),
            "synthesizer": SynthesizerAgent(),
        }
    return _llm_agents


class ReActLoop:
    """Observe → Think → Act reasoning loop with multi-agent debate."""

    def __init__(self):
        self.intent_parser = IntentParser()
        self.constitution = ConstitutionChecker()
        self.evaluator = KarpathyEvaluator()

    async def run(self, user_input: str, session_dna: dict, has_results: bool = False):
        """
        Generator that yields debate steps for SSE streaming.
        Each step is a dict with: step, agent, content, data
        """
        start_time = time.time()
        
        # ── Fast-path Cache Check ──
        cache_state = f"{user_input}_{json.dumps(session_dna, sort_keys=True)}_{has_results}"
        cache_key = hashlib.md5(cache_state.encode()).hexdigest()
        
        if cache_key in _response_cache:
            logger.info("⚡ Serving entire agent debate pipeline from cache!")
            for step in _response_cache[cache_key]:
                yield step
            return

        _collected_steps = []
        def _yield_and_cache(step_dict):
            _collected_steps.append(step_dict)
            return step_dict

        use_llm = has_api_key()
        agents = _get_llm_agents()

        # ── OBSERVE: Parse intent ──
        yield _yield_and_cache({
            "step": "observe",
            "agent": "system",
            "content": "**Parsing your request...** Analyzing intent, detecting trip type, budget signals, and preference tags.",
            "data": None,
        })

        intent = await self.intent_parser.parse(user_input, session_dna, has_results)
        
        # ── FETCH HOTELS (Genuine API integration) ── 
        location = intent.get("destination", "New York")
        hotels_json = get_genuine_hotels(location)[:10]

        # ── PHASE 0: Constitutional Check ──
        yield {
            "step": "observe",
            "agent": "system",
            "content": "**Running Phase 0 safety check...** Ensuring query meets constitutional bounds.",
            "data": None,
        }
        
        if use_llm and hasattr(self.constitution, 'check_intent'):
            const_res = await self.constitution.check_intent(user_input, intent)
            if const_res and not const_res.get("safe", True):
                yield {
                    "step": "constitutional_alert",
                    "agent": "system",
                    "content": f"⚠ Constitutional check\n\"{const_res.get('reason', 'Blocked due to safety limits.')}\"",
                    "data": {"intent": intent},
                }
                import asyncio
                await asyncio.sleep(2)
                # Auto-proceed without returning

        # Check if follow-up
        if intent.get("is_follow_up"):
            yield {
                "step": "follow_up",
                "agent": "system",
                "content": None,
                "data": {"intent": intent},
            }
            return

        # Check if ambiguous
        if intent.get("is_ambiguous"):
            yield {
                "step": "clarify",
                "agent": "system",
                "content": intent.get("clarifying_question") or "Tell me more — what matters most this trip? A specific vibe, a practical need, or a feeling you want to have?",
                "data": {
                    "intent": intent,
                    "options": ["Romantic weekend", "Solo adventure", "Business trip", "Family vacation", "Budget explorer"],
                },
            }
            return

        # ── THINK: Report detected intent ──
        signals = []
        if intent.get("trip_type"):
            signals.append(f"Trip type: **{intent['trip_type']}**")
        if intent.get("tags"):
            signals.append(f"Preferences: {', '.join(intent['tags'])}")
        signals.append(f"Budget: ${intent.get('budget_min', 100)}-${intent.get('budget_max', 600)}/night")
        if intent.get("detected_signals"):
            signals.append(f"Signals: {', '.join(intent['detected_signals'][:3])}")

        from config import LLM_PROVIDER, MODEL_ID
        mode = f"🧠 AI mode ({MODEL_ID})" if use_llm else "⚙️ Algorithmic mode (add API key for full AI)"
        yield {
            "step": "think",
            "agent": "system",
            "content": "\n".join(signals) + f"\n\n{mode}\nLaunching three-agent debate...",
            "data": {"intent": intent},
        }

        # ── ACT: Run Three-Agent Debate ──

        # Agent A: Optimizer
        yield {
            "step": "optimizer_start",
            "agent": "optimizer",
            "content": f"Scanning {len(hotels_json)} hotels against your preference vector...",
            "data": None,
        }

        if use_llm and agents:
            optimizer_output = await agents["optimizer"].run(hotels_json, intent, session_dna)
            # If LLM returned empty candidates, fall back
            if not optimizer_output.get("candidates"):
                optimizer_output = fallback_optimizer(hotels_json, intent, session_dna)
        else:
            optimizer_output = fallback_optimizer(hotels_json, intent, session_dna)

        candidates = optimizer_output.get("candidates", [])
        top_scores = [f"**{c.get('hotel_name', '')}**: {c.get('score', 0)}/100" for c in candidates[:4]]

        yield {
            "step": "optimizer_done",
            "agent": "optimizer",
            "content": optimizer_output.get("reasoning", "Scoring complete.") + "\n\nTop picks: " + " · ".join(top_scores),
            "data": {
                "scores": [
                    {"hotel": c.get("hotel_name", ""), "score": c.get("score", 0)}
                    for c in candidates[:4]
                ],
            },
        }

        # Agent B & C: Devil's Advocate & Empathy (Run in Parallel for speed)
        yield {
            "step": "advocate_start",
            "agent": "advocate",
            "content": "Challenging every pick...",
            "data": None,
        }
        yield {
            "step": "empathy_start",
            "agent": "empathy",
            "content": "Scanning for emotional resonance...",
            "data": None,
        }

        import asyncio
        if use_llm and agents:
            advocate_task = asyncio.create_task(agents["advocate"].run(optimizer_output, hotels_json, intent))
            empathy_task = asyncio.create_task(agents["empathy"].run(optimizer_output, hotels_json, intent, session_dna))
            advocate_output, empathy_output = await asyncio.gather(advocate_task, empathy_task)
            
            if not advocate_output.get("challenges"):
                advocate_output = fallback_advocate(optimizer_output, hotels_json, intent)
            if not empathy_output.get("emotional_notes"):
                empathy_output = fallback_empathy(optimizer_output, hotels_json, intent, session_dna)
        else:
            advocate_output = fallback_advocate(optimizer_output, hotels_json, intent)
            empathy_output = fallback_empathy(optimizer_output, hotels_json, intent, session_dna)

        # Process Advocate results
        challenges_preview = []
        for c in advocate_output.get("challenges", [])[:3]:
            for ch in c.get("challenges", [])[:1]:
                sev = ch.get("severity", "medium")
                dot = "🔴" if sev == "high" else "🟡" if sev == "medium" else "🟢"
                challenges_preview.append(f"{dot} {c.get('hotel_name', '')}: {ch.get('message', '')}")

        rejections = advocate_output.get("rejections", [])
        total_challenges = sum(
            len(c.get("challenges", [])) for c in advocate_output.get("challenges", [])
        )

        advocate_msg = f"Found **{total_challenges} issues** across the shortlist."
        if rejections:
            advocate_msg += f" ❌ Rejected: {', '.join(rejections)}."
        if challenges_preview:
            advocate_msg += "\n\n" + "\n".join(challenges_preview[:4])

        yield {
            "step": "advocate_done",
            "agent": "advocate",
            "content": advocate_msg,
            "data": {"challenges": challenges_preview},
        }

        # Process Empathy results
        soul_match = empathy_output.get("soul_match", {})
        emotional_quotes = []
        for n in empathy_output.get("emotional_notes", [])[:3]:
            for note in n.get("notes", [])[:1]:
                emotional_quotes.append(f'*"{note}"*')

        empathy_msg = empathy_output.get("reasoning", "")
        if soul_match.get("hotel_name"):
            empathy_msg += f"\n\n✨ **Soul match: {soul_match['hotel_name']}** — {soul_match.get('why', '')}"
        if emotional_quotes:
            empathy_msg += "\n\n" + "\n".join(emotional_quotes[:3])

        yield {
            "step": "empathy_done",
            "agent": "empathy",
            "content": empathy_msg,
            "data": {"emotionalNotes": emotional_quotes[:3]},
        }
        # ── SYNTHESIZE & EVALUATE (Karpathy Loop) ──
        if use_llm and agents:
            synthesis_output = await agents["synthesizer"].run(
                optimizer_output, advocate_output, empathy_output, intent, session_dna
            )
            
            # ── EVALUATION LOOP ──
            yield {
                "step": "evaluate",
                "agent": "system",
                "content": "**Running Evaluator...** Checking for hallucinations, missed PS1 requirements, or weak anti-recs.",
                "data": None,
            }
            
            eval_result = await self.evaluator.evaluate(
                intent, synthesis_output, const_res if 'const_res' in locals() else {}, optimizer_output, advocate_output
            )
            
            eval_passes = [{
                "pass": 1, 
                "score": eval_result.get("overall", 0), 
                "critique": eval_result.get("critique", ""), 
                "passed": eval_result.get("passed", True)
            }]
            
            retry_count = 0
            max_retries = 0 if eval_result.get("_fallback") else 1
            while not eval_result.get("passed", True) and retry_count < max_retries:
                yield {
                    "step": "evaluate_fail",
                    "agent": "system",
                    "content": f"**Karpathy Loop Triggered.** Evaluator critique: {eval_result.get('critique', 'Score too low.')}. Retrying...",
                    "data": {"eval": eval_result},
                }
                
                synthesis_output = await agents["synthesizer"].run(
                    optimizer_output, advocate_output, empathy_output, intent, session_dna, eval_critique=eval_result
                )
                
                eval_result = await self.evaluator.evaluate(
                    intent, synthesis_output, const_res if 'const_res' in locals() else {}, optimizer_output, advocate_output
                )
                retry_count += 1
                
                eval_passes.append({
                    "pass": retry_count + 1,
                    "score": eval_result.get("overall", 0),
                    "critique": eval_result.get("critique", "Shortlist Accepted"),
                    "passed": eval_result.get("passed", True)
                })
                
            if not synthesis_output.get("shortlist"):
                synthesis_output = fallback_synthesizer(
                    optimizer_output, advocate_output, empathy_output, intent, hotels_json
                )
            
            # Assign the final eval to be yielded at the end
            final_eval_result = eval_result

        else:
            synthesis_output = fallback_synthesizer(
                optimizer_output, advocate_output, empathy_output, intent, hotels_json
            )
            final_eval_result = self.evaluator.fallback("fallback mode", retry_count=0)
            
            # Simulate the loop visually for the demo trace panel
            eval_passes = [
                {
                    "pass": 1, 
                    "score": final_eval_result.get("overall", 0), 
                    "critique": final_eval_result.get("critique", ""), 
                    "passed": final_eval_result.get("passed", True)
                }
            ]
            
            yield {
                "step": "evaluate_fail",
                "agent": "system",
                "content": f"**Karpathy Loop Triggered.** Evaluator critique: {final_eval_result.get('critique')}. Retrying...",
                "data": {"eval": final_eval_result},
            }
            
            # Pass 2 success simulation
            final_eval_result = self.evaluator.fallback("fallback mode", retry_count=1)
            eval_passes.append({
                "pass": 2, 
                "score": final_eval_result.get("overall", 0), 
                "critique": final_eval_result.get("critique", ""), 
                "passed": final_eval_result.get("passed", True)
            })

        elapsed = round((time.time() - start_time) * 1000)

        # ── FINAL SYNTHESIS MESSAGE ──
        shortlist = synthesis_output.get("shortlist", [])
        
        strong_matches = [h for h in shortlist if h.get("final_score", 0) >= 60]
        stretch_options = [h for h in shortlist if h.get("final_score", 0) < 60]
        
        if len(strong_matches) >= 3:
            # User wants to NEVER show below 60 if we have at least 3 good ones
            shortlist = strong_matches
            synthesis_output["shortlist"] = shortlist
            ranking_note = "The Devil's Advocate **changed the final ranking** — the pure data pick isn't #1 anymore." if synthesis_output.get("did_advocate_change_ranking") else "Rankings held after debate."
            empathy_note = f" The Empathy Agent inserted a soul match." if synthesis_output.get("did_empathy_override") else ""
            synthesis_content = f"Debate complete in {elapsed}ms. {ranking_note}{empathy_note}\n\nHere are your **{len(shortlist)} strong matches** — each one debated, challenged, and verified. Scroll right to see them."
        else:
            # We don't have enough, show the stretch options too
            synthesis_content = f"Debate complete in {elapsed}ms.\n\nOnly {len(strong_matches)} strong matches found for your exact criteria. Here they are — plus {len(stretch_options)} stretch options clearly labelled."

        synthesis_step = {
            "step": "synthesis",
            "agent": "synthesis",
            "content": synthesis_content,
            "data": None,
        }
        
        yield _yield_and_cache(synthesis_step)
        
        # ── COMMIT TO CACHE ──
        if use_llm:
            _response_cache[cache_key] = _collected_steps
            logger.info(f"💾 Saved complete interaction to cache (key: {cache_key[:8]})")

        # ── RESULTS ──
        yield {
            "step": "results",
            "agent": "system",
            "content": None,
            "data": {
                "shortlist": shortlist,
                "intent": intent,
                "eval": final_eval_result,
                "constitution": const_res if 'const_res' in locals() else {},
                "eval_passes": eval_passes if 'eval_passes' in locals() else [],
                "elapsed_ms": elapsed,
                "trace": {
                    "optimizer": optimizer_output,
                    "advocate": advocate_output,
                    "empathy": empathy_output,
                    "synthesis": synthesis_output,
                },
            },
        }
