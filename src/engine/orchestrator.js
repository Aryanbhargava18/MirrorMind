import { checkHealth, streamDebate } from '../api/client';

const STAGE_ALIAS_MAP = {
  optimizer: 'optimizer',
  optimise: 'optimizer',
  advocate: 'advocate',
  adversary: 'advocate',
  devil: 'advocate',
  devils_advocate: 'advocate',
  devil_s_advocate: 'advocate',
  "devil's_advocate": 'advocate',
  "devil's advocate": 'advocate',
  personalizer: 'personalizer',
  personalization: 'personalizer',
  synthesizer: 'synthesis',
  synthesis: 'synthesis',
  synth: 'synthesis',
};

const normalizeStage = (value) => {
  if (!value) {
    return null;
  }

  const normalized = String(value)
    .toLowerCase()
    .replace(/[^a-z']/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  return STAGE_ALIAS_MAP[normalized] || null;
};

export const runAgentPipeline = async (
  domain,
  rawInput,
  sessionDNA,
  hasResults,
  overrides,
  onStep,
) => {
  let finalResults = null;
  const trace = {
    optimizer: null,
    advocate: null,
    personalizer: null,
    synthesis: null,
  };

  for await (const event of streamDebate(domain, rawInput, sessionDNA, hasResults, overrides)) {
    const payload = event?.data;
    const payloadType = payload?.type || event?.event;
    const stage =
      normalizeStage(payload?.stage) ||
      normalizeStage(payload?.agent) ||
      normalizeStage(payload?.name) ||
      normalizeStage(payloadType);

    if (stage && payload) {
      trace[stage] = payload?.data ?? payload;
      onStep?.({
        kind: 'stage',
        stage,
        data: payload?.data ?? payload,
        trace: { ...trace },
        rawEvent: event,
      });
      continue;
    }

    if (payloadType === 'results' || event?.event === 'results' || payload?.shortlist) {
      finalResults = payload?.data || payload;
      if (finalResults?.trace) {
        Object.assign(trace, finalResults.trace);
      }
      onStep?.({
        kind: 'results',
        stage: 'synthesis',
        data: finalResults,
        trace: { ...trace },
        rawEvent: event,
      });
      continue;
    }

    if (payloadType === 'error' || event?.event === 'error') {
      const errorMessage =
        payload?.message || payload?.detail || payload?.error || 'The debate engine failed.';
      onStep?.({
        kind: 'error',
        stage: stage || 'system',
        data: payload,
        error: errorMessage,
        trace: { ...trace },
        rawEvent: event,
      });
      throw new Error(errorMessage);
    }

    onStep?.({
      kind: 'system',
      stage: stage || 'system',
      data: payload,
      trace: { ...trace },
      rawEvent: event,
    });
  }

  return {
    results: finalResults,
    trace,
  };
};

export const checkBackend = async () => checkHealth();