# MirrorMind — Enterprise AI Cognitive Bias Investigator

> Paste your reasoning. Four adversarial AI agents find the blind spots you can't.

MirrorMind is a full-stack, production-hardened multi-agent reasoning platform. Users describe their reasoning about any decision in plain language, and four specialized LLM agents analyze the *thinking process* — not the decision itself. 

Unlike standard "GPT wrappers," MirrorMind utilizes a specialized adversarial pipeline, a real-time SSE streaming backend, and an autonomous "Karpathy" self-correction loop to guarantee high-quality, hallucination-free analysis.

## Core Features & Engineering Impact

- **Adversarial Multi-Agent Pipeline:** Replaces unreliable zero-shot prompting with 4 isolated agents (Mapper, Investigator, Advocate, Synthesizer). The Investigator is strictly constrained to *only* flag biases using exact quotes from the user's input.
- **Karpathy Self-Correction Loop:** An autonomous `evaluator` scores the agent trace across 5 weighted dimensions (completeness, evidence-binding, defense quality, coherence). If the score falls below a confidence threshold, the pipeline automatically re-runs.
- **Two-Layer Guardrails:** A `ConstitutionChecker` validates input safety (blocking prompt injections, gibberish, and harmful content) and verifies output completeness before streaming to the client.
- **Sub-Second TTFT via SSE:** The FastAPI backend streams agent states and JSON traces via Server-Sent Events (SSE) to prevent client-side timeouts during complex, long-running LLM workloads.
- **Observability:** A built-in `/api/metrics` endpoint aggregates per-agent latency, eval scores, fallback rates, and guardrail block rates in real-time.

## Architecture

```text
┌─────────────────────────────────────────────────────┐
│                   React Frontend                     │
│  DecisionInput → AgentDebate → ResultsSection        │
│         (SSE stream ← real-time agent output)        │
└────────────────────┬────────────────────────────────┘
                     │ POST /api/debate/{domain}
                     ▼
┌─────────────────────────────────────────────────────┐
│               FastAPI Backend (SSE)                  │
│                                                      │
│  [Input Guardrail] → Constitution Checker            │
│          │                                           │
│  ┌──────────┐  ┌──────────────┐  ┌────────────┐     │
│  │  Mapper   │→│ Investigator │→│  Advocate   │     │
│  │ (Agent 1) │  │  (Agent 2)   │  │ (Agent 3)  │     │
│  └──────────┘  └──────────────┘  └────────────┘     │
│        │              │                │             │
│        └──────────────┴────────────────┘             │
│                       ▼                              │
│              ┌──────────────┐                       │
│              │ Synthesizer  │                       │
│              │  (Agent 4)   │                       │
│              └──────────────┘                       │
│                       ▼                              │
│  [Karpathy Eval] → Score > 0.65? (If NO → Retry)     │
│                       ▼                              │
│  [Output Guard] → Validate Completeness              │
└─────────────────────────────────────────────────────┘
```

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, GSAP
- **Backend:** FastAPI, Python 3.11+, Uvicorn/Gunicorn
- **LLM Routing:** Multi-provider support (Groq Llama-3, OpenAI GPT-4o, Gemini 2.0 Flash) with automatic rate-limit failover
- **Streaming:** Server-Sent Events (SSE)

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- A Groq API key (or OpenAI/Gemini)

### Setup

```bash
# Clone
git clone https://github.com/Aryanbhargava18/MirrorMind.git
cd MirrorMind

# Frontend
npm install

# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Environment
cp .env.example .env
# Add your GROQ_API_KEY to .env
```

### Run Locally

```bash
# Terminal 1 — Backend
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Project Structure

```text
├── src/
│   ├── api/client.js           # SSE streaming client
│   ├── engine/orchestrator.js  # Frontend agent pipeline state machine
│   ├── components/             # React UI components (Glassmorphism, animations)
│   └── App.jsx                 
│
├── backend/
│   ├── main.py                 # FastAPI server + SSE endpoints + /api/metrics
│   ├── engine/
│   │   ├── react_loop.py       # Multi-agent orchestration loop
│   │   ├── evaluator.py        # Karpathy self-correction loop
│   │   ├── guardrails.py       # Input/Output Constitution checker
│   │   └── metrics.py          # Per-request and aggregate latency/eval tracking
│   ├── agents/
│   │   ├── base.py             # LLM provider routing & auto-failover
│   │   ├── mapper.py           # Agent 1: Claim extraction
│   │   ├── investigator.py     # Agent 2: Evidence-bound Bias detection
│   │   ├── advocate.py         # Agent 3: Steelmanning
│   │   └── synthesizer.py      # Agent 4: Meta-pattern synthesis
│   └── config.py               # Environment configuration
```
