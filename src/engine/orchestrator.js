// TripSense — Agent Orchestrator (API-connected)
// Connects to Python backend via SSE streaming.
// No greeting needed — intake screen handles that.

import { streamChat, checkHealth } from '../api/client';

/**
 * Run the full agent pipeline via SSE stream.
 * Calls onStep for each debate step (for progressive UI reveal).
 * Returns the final results when complete.
 */
export async function runAgentPipeline(rawInput, sessionDNA, hasResults, onStep) {
  let finalResults = null;
  let currentAgent = 'system';

  try {
    for await (const step of streamChat(rawInput, sessionDNA, hasResults)) {
      if (step.step === 'done') break;

      if (step.step === 'error') {
        console.error('Agent error:', step.content);
        break;
      }

      if (step.step === 'follow_up') {
        return { type: 'follow_up', intent: step.data?.intent };
      }

      if (step.step === 'clarify') {
        return { type: 'clarify' };
      }

      if (step.step === 'results') {
        finalResults = step.data;
        continue;
      }

      // Map agent stage for thinking animation
      const agentMap = {
        'optimizer_start': 'optimizer',
        'optimizer_done': 'optimizer',
        'advocate_start': 'advocate',
        'advocate_done': 'advocate',
        'empathy_start': 'empathy',
        'empathy_done': 'empathy',
        'constitution': 'synthesis',
        'synthesis': 'synthesis',
      };

      const agent = agentMap[step.step] || step.agent || 'system';
      if (agent !== currentAgent) {
        currentAgent = agent;
        onStep?.({ step: step.step, content: step.content }, agent);
      }
    }
  } catch (e) {
    console.error('Agent pipeline error:', e);
    return { type: 'error', error: e.message };
  }

  return { type: 'results', data: finalResults };
}

// Check if backend is available
export async function checkBackend() {
  return checkHealth();
}
