# AgriMind - Agentic Farm Advisory System (Pushed to GitHub)

AgriMind is an AI-powered farm advisory product with React/Vite frontend proxying to hosted FastAPI backend with ChromaDB RAG, LangGraph agent, yield prediction.

**Live frontend:** Deploy via Vercel: vercel.com → Import `Agrim-2007/GENAI-capstone`  
**Hosted backend:** https://genai-capstone-1.onrender.com/predict  
**GitHub:** https://github.com/Agrim-2007/GENAI-capstone  

## Quick Start

**Frontend:**
```bash
npm install
npm run dev  # localhost:5173, proxies /api to backend
npm run build  # dist/ for deployment
```

**Reference Agent (local):**
```bash
pip install -r requirements-agent.txt
GROQ_API_KEY=... python src/reference_agent/graph.py
```

## Deployment (Frontend)

Vercel auto-config via `vercel.json` (rewrites `/api/*` → backend).

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind, GSAP/Framer, Three.js Globe, Recharts
- **Backend:** FastAPI, LangGraph, Groq Llama, ChromaDB RAG, scikit-learn yield model
- **Proxy:** Vite dev + vercel.json prod (CORS bypass)

**ChromaDB:** Backend has production instance. Local `src/reference_agent/` for dev/reference.

## API

`POST /api/predict` → backend JSON:
- `crop_summary`, `yield_risk_level`, `recommended_actions`
- `agronomic_references` (RAG evidence)

Test:
```bash
curl -X POST localhost:5173/api/predict -H "Content-Type: application/json" -d @examples/sample_payload.json
```

Project complete and pushed to GitHub main branch.
>>>>>>> 1a3626f (WebApp of working model)

=======
# Intelligent Crop Yield Prediction & Agentic Farm Advisory 🌾🤖
Python | FastAPI | React/Vite | Render | Vercel

An AI-driven agricultural analytics system that predicts crop yield using classical ML and provides autonomous farming advice via Agentic AI + Premium React frontend.

## 📖 Project Overview
Backend: Milestone 1 (Scikit-Learn yield prediction) + Milestone 2 (LangGraph RAG agent).
Frontend: React/Vite app proxies to hosted backend, visualizes RAG evidence & advisory reports.

## 🛠️ Technology Stack
**Backend:** Scikit-Learn, LangGraph, Groq Llama, ChromaDB RAG, FastAPI/Render
**Frontend:** React 19, Vite, Tailwind, GSAP, Three.js Globe, Recharts/Vercel
**Proxy:** vercel.json rewrites `/api/*` to backend (CORS-free)

[Keep original sections: Structure, Contributions, Setup...]

## 🚀 Premium Frontend

**Live:** vercel.com → Import repo → auto-deploy
**Local:**
```bash
npm install
npm run dev  # localhost:5173 proxies to backend
npm run build  # dist/ for Vercel
```

**API Contract:** `POST /api/predict` → backend JSON (crop_summary, recommended_actions, agronomic_references)

**ChromaDB:** Backend production instance. `src/reference_agent/` for local dev/reference.

## Repository Structure (Updated)
```
├── main.py (backend)
├── web/ (React app)
├── src/reference_agent/ (RAG reference)
├── vercel.json (frontend proxy)
├── requirements.txt (backend)
├── requirements-agent.txt (reference)
├── crop_yield.csv
└── examples/ (API payloads)
```

## 🤖 Full Workflow
Frontend → `/api/predict` → Backend (Yield ML → ChromaDB RAG → LangGraph → Groq → JSON)

**Test:**
```bash
npm run dev
curl localhost:5173/api/predict -X POST -H "Content-Type: application/json" -d @examples/sample_payload.json
```

[Keep original Evaluation, License]

**Deployment Ready** - Backend Render-hosted, Frontend Vercel-deployable.

=======
# AgriMind - Agentic Farm Advisory System

AgriMind is an AI-powered farm advisory product that combines a premium
React/Vite interface with a hosted Agentic AI backend. The demo predicts crop
yield, retrieves agronomy evidence through RAG, uses LangGraph-style agent
orchestration, and returns a structured advisory report for farmers.

**Live frontend:** [Update with Vercel/Netlify URL after deployment]  
**Hosted backend:** https://genai-capstone-1.onrender.com  
**GitHub:** https://github.com/Agrim-2007/GENAI-capstone  
**API contract verified:** April 19, 2026

## Architecture
```mermaid
flowchart LR
    A["React + Vite UI"] --> B["/api proxy"]
    B --> C["FastAPI /predict on Render"]
    C --> D["Farm input validation"]
    D --> E["Yield prediction model"]
    E --> F["ChromaDB RAG retriever"]
    F --> G["LangGraph agent workflow"]
    G --> H["Groq Llama advisor"]
    H --> I["Structured advisory JSON"]
    I --> A
```

The browser app calls `/api/predict`. Locally, Vite proxies that route to the
Render backend. On Vercel, `vercel.json` rewrites the same path to the backend.
This avoids browser CORS issues because the current backend does not expose an
`OPTIONS /predict` CORS preflight response.

## Product Highlights

- Dark-mode first glassmorphism interface with grain texture, custom cursor,
  GSAP page reveal, ScrollTrigger section animation, and magnetic buttons.
- Lazy-loaded Three.js rotating farm globe with particle field overlay.
- Multi-step farm advisory wizard using React Hook Form and Zod validation.
- Sample presets, localStorage persistence, loading states, toast errors, and
  mobile-responsive cards.
- Bento results dashboard with animated yield counter, Recharts gauge/donut
  visuals, recommended-action accordions, RAG evidence, agent trace, and safety
  note.
- `src/reference_agent/` keeps cleaned Agent/RAG proof code visible for grading.

## Repository Structure

```text
.
|-- index.html
|-- package.json
|-- vite.config.js
|-- vercel.json
|-- web/
|   |-- App.jsx
|   |-- main.jsx
|   |-- styles.css
|   |-- components/
|   |-- hooks/
|   `-- lib/
|-- src/reference_agent/
|   |-- graph.py
|   |-- knowledge_base.py
|   |-- prompts.py
|   `-- schemas.py
|-- examples/
|   |-- sample_payload.json
|   `-- sample_response.json
|-- requirements-agent.txt
`-- requirements.txt
```

## Run The Frontend Locally

```bash
npm install
npm run dev
```

Open: http://localhost:5173

Build check: `npm run build`

Optional environment values:
```
VITE_BACKEND_URL=https://genai-capstone-1.onrender.com
VITE_API_BASE_URL=/api
```

## Backend Contract

**Proxy:** `POST /api/predict`  
**Direct:** `POST https://genai-capstone-1.onrender.com/predict`

Request:
```json
{
  "Region": "North",
  "Soil_Type": "Sandy",
  "Crop": "Wheat",
  "Rainfall_mm": 450,
  "Temperature_Celsius": 27,
  "Fertilizer_Used": true,
  "Irrigation_Used": true,
  "Weather_Condition": "Sunny",
  "Days_to_Harvest": 100
}
```

Response sections:
- `crop_summary`, `field_status`, `yield_risk_level`
- `recommended_actions`, `agronomic_references`
- `safety_disclaimer`

## Optional Reference Agent Setup

React frontend doesn't need `GROQ_API_KEY`. For local `src/reference_agent/`:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements-agent.txt
export GROQ_API_KEY="your-groq-key"
```

Needs `crop_yield.csv`.

## Deployment (Frontend Only)

**Vercel (Recommended):**
1. Push to GitHub.
2. vercel.com → Import repo.
3. Build: `npm run build`, Output: `dist`.
4. `/api` proxies automatically.

**Alternatives:** Netlify, GitHub Pages, Render Static.

## Verification

```bash
npm run build
curl -i http://localhost:5173/api/
curl -i -X POST http://localhost:5173/api/predict -H "Content-Type: application/json" -d @examples/sample_payload.json
```

<<<<<<< HEAD
Visual smoke checks were captured with Playwright for desktop and mobile, and
the Three.js globe region was pixel-checked to confirm nonblank rendering.
>>>>>>> 1a3626f (WebApp of working model)
=======
## Rubric Mapping

| Component | Implementation |
|-----------|---------------|
| Technical | Yield model, ChromaDB RAG, LangGraph, Groq LLM, JSON report. |
| Code Quality | UI components, API proxy, schemas, reference Agent code. |
| Live Demo | Vercel frontend proxies hosted backend, responsive polished UI. |
>>>>>>> 47f7704 (Complete AgriMind project: React frontend with Vite/Tailwind, reference agent code, deployment config for Vercel proxy to hosted backend. Updated README with live demo instructions, ChromaDB reference clarified.)

