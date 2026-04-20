// TripSense — API Client
// Connects React frontend to Python backend via SSE streaming

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8001';

/**
 * Stream chat response from the agent backend.
 * Yields debate steps progressively via SSE.
 */
export async function* streamChat(message, sessionDNA, hasResults = false) {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      session_dna: sessionDNA,
      has_results: hasResults,
    }),
  });

  if (!response.ok) {
    throw new Error(`Agent API error: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          yield data;
        } catch (e) {
          console.warn('SSE parse error:', e);
        }
      }
    }
  }
}

/**
 * Live re-rank when user changes tags or trip type.
 */
export async function rerank(intent, sessionDNA, tagChanged, tagAction, tripType) {
  const response = await fetch(`${API_BASE}/api/rerank`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      intent,
      session_dna: sessionDNA,
      tag_changed: tagChanged,
      tag_action: tagAction,
      trip_type: tripType,
    }),
  });

  if (!response.ok) {
    throw new Error(`Rerank API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Check backend health and LLM availability.
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE}/api/health`);
    return response.json();
  } catch (e) {
    return { status: 'offline', llm_available: false, model: 'none', hotels_loaded: 0 };
  }
}
