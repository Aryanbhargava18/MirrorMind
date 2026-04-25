const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');

const buildApiUrl = (path) => `${API_BASE_URL}${path}`;

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
};

const requestJson = async (path, options = {}) => {
  const response = await fetch(buildApiUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return response.json();
};

export async function* streamDebate(
  domain,
  message,
  sessionDNA,
  hasResults = false,
  overrides = {},
) {
  const response = await fetch(buildApiUrl(`/api/debate/${domain}`), {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      session_dna: sessionDNA || {},
      has_results: Boolean(hasResults),
      overrides: overrides || {},
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Unable to start debate for domain "${domain}"`);
  }

  if (!response.body) {
    throw new Error('Streaming is not supported in this browser.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const flushEvents = async function* (chunk) {
    const segments = chunk.split('\n\n');
    buffer = segments.pop() || '';

    for (const rawEvent of segments) {
      const lines = rawEvent
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      if (!lines.length) {
        continue;
      }

      let eventName = 'message';
      const dataLines = [];

      for (const line of lines) {
        if (line.startsWith('event:')) {
          eventName = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
          dataLines.push(line.slice(5).trim());
        }
      }

      const payloadText = dataLines.join('\n');
      const payload = safeJsonParse(payloadText) ?? payloadText;

      yield {
        event: eventName,
        data: payload,
      };
    }
  };

  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    for await (const event of flushEvents(buffer)) {
      yield event;
    }
  }

  buffer += decoder.decode();

  if (buffer.trim()) {
    for await (const event of flushEvents(`${buffer}\n\n`)) {
      yield event;
    }
  }
}

export const rerank = async (domain, intent, sessionDNA, overrides = {}) =>
  requestJson(`/api/rerank/${domain}`, {
    method: 'POST',
    body: JSON.stringify({
      intent,
      session_dna: sessionDNA || {},
      overrides: overrides || {},
    }),
  });



export const fetchSession = async (sessionId) =>
  requestJson(`/api/session/${encodeURIComponent(sessionId)}`);

export const exportSessionJson = (sessionId) =>
  buildApiUrl(`/api/export/${encodeURIComponent(sessionId)}.json`);

export const checkHealth = async () => requestJson('/api/health');