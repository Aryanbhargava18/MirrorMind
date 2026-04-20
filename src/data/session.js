// TripSense — Session DNA (persistent user profile + memory)

const STORAGE_KEY = 'tripsense_session_dna';

const DEFAULT_SESSION_DNA = {
  userId: 'user_demo_001',
  userName: '',  // No hardcoded name
  tripType: 'leisure',
  pastSearches: [],
  pastBookings: [],
  avoidedPatterns: [],
  // User preferences learned over time
  preferenceVector: {
    luxury: 0.5,
    budget: 0.5,
    walkable: 0.5,
    quiet: 0.5,
    social: 0.5,
    design: 0.5,
    foodie: 0.5,
    nightlife: 0.5,
    rooftop: 0.5,
    eco: 0.5,
    romantic: 0.5,
    family: 0.5,
    historic: 0.5,
    'unique-rooms': 0.5,
    spa: 0.5,
  },
  sessionEdits: [],
  trustScore: 0.5,
  activeTags: [],
  budgetRange: [8000, 30000],
  destination: 'New York',
};

export function loadSessionDNA() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SESSION_DNA, ...parsed, userName: '' };
    }
  } catch (e) {
    console.warn('Failed to load session DNA:', e);
  }
  return { ...DEFAULT_SESSION_DNA };
}

export function saveSessionDNA(dna) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dna));
  } catch (e) {
    console.warn('Failed to save session DNA:', e);
  }
}

export function resetSessionDNA() {
  localStorage.removeItem(STORAGE_KEY);
  return { ...DEFAULT_SESSION_DNA };
}

export function updateTrustScore(dna, action) {
  const deltas = {
    confirm_suggestion: 0.05,
    reject_suggestion: -0.02,
    edit_profile: 0.03,
    complete_search: 0.02,
    view_reasoning: 0.04,
  };
  const delta = deltas[action] || 0;
  const newScore = Math.max(0, Math.min(1, dna.trustScore + delta));
  return { ...dna, trustScore: newScore };
}

export function recordSessionEdit(dna, editType, detail) {
  const edit = {
    type: editType,
    detail,
    timestamp: new Date().toISOString(),
  };
  return {
    ...dna,
    sessionEdits: [...dna.sessionEdits, edit],
  };
}

export { DEFAULT_SESSION_DNA };
