# MirrorMind — Cognitive Bias Investigator

> Paste your reasoning. Four adversarial AI agents find the blind spots you can't.

MirrorMind is a multi-agent cognitive bias detector. Users describe their reasoning about any decision in plain language, and four specialized LLM agents analyze the *thinking process* — not the decision itself. The output is a mirror showing the user their own blind spots, not a recommendation.

## Architecture

```
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
│  ┌──────────┐  ┌──────────────┐  ┌────────────┐     │
│  │  Mapper   │→│ Investigator │→│  Advocate   │     │
│  │ (Agent 1) │  │  (Agent 2)   │  │ (Agent 3)  │     │
│  │           │  │  Adversarial │  │ Steelman   │     │
│  └──────────┘  └──────────────┘  └────────────┘     │
│        │              │                │              │
│        └──────────────┴────────────────┘              │
│                       ▼                               │
│              ┌──────────────┐                        │
│              │ Synthesizer  │                        │
│              │  (Agent 4)   │                        │
│              │ Meta-pattern │                        │
│              └──────────────┘                        │
└─────────────────────────────────────────────────────┘
```

## The Four Agents

| Agent | Role | Key Constraint |
|-------|------|----------------|
| **Mapper** | Extracts claims, values, and assumptions | No judgment — extraction only |
| **Investigator** | Flags cognitive biases adversarially | Must quote user's exact words as evidence |
| **Advocate** | Steelmans the user's instinct | Defends gut feeling before it's critiqued |
| **Synthesizer** | Identifies the meta-pattern of reasoning | Produces "The Question You're Not Asking" |

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** FastAPI + Python 3.11+
- **LLM:** Google Gemini (via `google-generativeai`)
- **Streaming:** Server-Sent Events (SSE)
- **Styling:** Custom design system (Fraunces + DM Sans typography, glassmorphism, micro-animations)

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- A Google Gemini API key

### Setup

```bash
# Clone
git clone https://github.com/your-username/mirrormind.git
cd mirrormind

# Frontend
npm install

# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Environment
cp .env.example .env
# Add your GEMINI_API_KEY to .env
```

### Run

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

```
├── src/
│   ├── api/client.js           # SSE streaming client
│   ├── engine/orchestrator.js  # Frontend agent pipeline orchestrator
│   ├── hooks/useScrollReveal.js
│   ├── components/
│   │   ├── HeroSection.jsx     # Landing page hero
│   │   ├── DecisionInput.jsx   # User reasoning input
│   │   ├── AgentDebate.jsx     # Real-time agent analysis view
│   │   ├── AgentCard.jsx       # Individual agent output card
│   │   ├── ResultsSection.jsx  # Bento grid analysis results
│   │   ├── TopPick.jsx         # "The Question You're Not Asking"
│   │   ├── TradeOffs.jsx       # Evidence vs Instinct view
│   │   ├── ReasoningTrace.jsx  # Full agent reasoning trace
│   │   └── ...
│   └── App.jsx                 # State machine (idle → analyzing → results)
│
├── backend/
│   ├── main.py                 # FastAPI server + SSE endpoints
│   ├── engine/
│   │   └── react_loop.py       # Multi-agent orchestration loop
│   ├── agents/
│   │   ├── base.py             # BaseAgent abstraction (LLM interface)
│   │   ├── mapper.py           # Agent 1: Claim extraction
│   │   ├── investigator.py     # Agent 2: Bias detection
│   │   ├── advocate.py         # Agent 3: Steelmanning
│   │   └── synthesizer.py      # Agent 4: Meta-pattern synthesis
│   └── config.py               # Environment + API key management
```

## Key Design Decisions

1. **Adversarial by design** — The Investigator agent can only flag a bias if it quotes the user's exact words. This prevents generic AI advice.
2. **Streaming SSE** — Each agent's output streams to the UI in real-time as it completes, giving immediate feedback instead of a loading spinner.
3. **Structured JSON schemas** — Every agent is constrained to a specific JSON output format, preventing hallucination and enabling reliable UI rendering.
4. **Phase-based state machine** — The frontend uses a clean `idle → analyzing → results` state machine instead of complex routing.

