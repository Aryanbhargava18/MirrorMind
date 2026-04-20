// TripSense — Intent Parser (Phase 2 — ReAct loop)

const TRIP_TYPE_SIGNALS = {
  romantic: ['romantic', 'anniversary', 'honeymoon', 'couples', 'date', 'intimate', 'getaway', 'valentine'],
  business: ['business', 'conference', 'meeting', 'work', 'corporate', 'client', 'presentation'],
  family: ['family', 'kids', 'children', 'baby', 'stroller', 'accessible', 'connecting rooms'],
  solo: ['solo', 'alone', 'myself', 'backpack', 'independent', 'digital nomad', 'remote work'],
  leisure: ['vacation', 'holiday', 'explore', 'sightseeing', 'relax', 'fun', 'trip', 'travel'],
};

const TAG_SIGNALS = {
  luxury: ['luxury', 'upscale', 'premium', 'fancy', 'high-end', 'five star', '5 star', 'splurge'],
  budget: ['budget', 'cheap', 'affordable', 'value', 'save', 'economical', 'deal'],
  quiet: ['quiet', 'peaceful', 'calm', 'serene', 'tranquil', 'relaxing'],
  social: ['social', 'lively', 'vibrant', 'buzzy', 'party', 'nightlife', 'fun'],
  walkable: ['walkable', 'central', 'downtown', 'walking distance', 'location'],
  'design-hotel': ['design', 'aesthetic', 'beautiful', 'instagram', 'stylish', 'boutique'],
  foodie: ['food', 'restaurant', 'dining', 'culinary', 'eat', 'brunch', 'foodie'],
  rooftop: ['rooftop', 'view', 'skyline', 'panoramic', 'terrace'],
  spa: ['spa', 'wellness', 'massage', 'relaxation', 'pool'],
  eco: ['eco', 'sustainable', 'green', 'organic', 'environment'],
  historic: ['historic', 'classic', 'heritage', 'traditional', 'old-world'],
};

const BUDGET_SIGNALS = [
  { pattern: /under\s*\$?(\d+)/i, type: 'max' },
  { pattern: /below\s*\$?(\d+)/i, type: 'max' },
  { pattern: /around\s*\$?(\d+)/i, type: 'around' },
  { pattern: /about\s*\$?(\d+)/i, type: 'around' },
  { pattern: /\$?(\d+)\s*-\s*\$?(\d+)/i, type: 'range' },
  { pattern: /max(?:imum)?\s*\$?(\d+)/i, type: 'max' },
  { pattern: /budget\s*(?:of|is)?\s*\$?(\d+)/i, type: 'max' },
];

export function parseIntent(rawInput, sessionDNA) {
  const input = rawInput.toLowerCase().trim();
  
  // Detect trip type
  let detectedTripType = null;
  let tripTypeConfidence = 0;
  for (const [type, signals] of Object.entries(TRIP_TYPE_SIGNALS)) {
    const matches = signals.filter(s => input.includes(s)).length;
    if (matches > tripTypeConfidence) {
      tripTypeConfidence = matches;
      detectedTripType = type;
    }
  }

  // Detect tags
  const detectedTags = [];
  for (const [tag, signals] of Object.entries(TAG_SIGNALS)) {
    if (signals.some(s => input.includes(s))) {
      detectedTags.push(tag);
    }
  }

  // Detect budget
  let budgetRange = sessionDNA.budgetRange;
  for (const { pattern, type } of BUDGET_SIGNALS) {
    const match = input.match(pattern);
    if (match) {
      if (type === 'max') {
        budgetRange = [0, parseInt(match[1])];
      } else if (type === 'around') {
        const center = parseInt(match[1]);
        budgetRange = [Math.round(center * 0.7), Math.round(center * 1.3)];
      } else if (type === 'range') {
        budgetRange = [parseInt(match[1]), parseInt(match[2])];
      }
      break;
    }
  }

  // Detect destination (simple — this demo is NYC focused)
  const destination = sessionDNA.destination || 'New York';

  // Build structured intent
  const intent = {
    rawInput,
    destination,
    tripType: detectedTripType || sessionDNA.tripType,
    autoDetectedTripType: detectedTripType, // signal to auto-update session DNA
    budgetRange,
    activeTags: detectedTags.length > 0 ? [...new Set([...sessionDNA.activeTags, ...detectedTags])] : sessionDNA.activeTags,
    softSignals: detectedTags,
    hardFilters: [],
    isAmbiguous: !detectedTripType && detectedTags.length === 0 && budgetRange[0] === sessionDNA.budgetRange[0] && budgetRange[1] === sessionDNA.budgetRange[1],
    clarifyingQuestion: null,
    accessibilityNeeds: [],
  };

  // Cycle 2: Resolve ambiguity
  if (intent.isAmbiguous && input.length < 10) {
    intent.clarifyingQuestion = 'What kind of trip are you planning? (e.g., a romantic weekend, solo adventure, or family vacation)';
  }

  return intent;
}

export function generateReRankExplanation(oldTags, newTags, addedTag, removedTag) {
  if (addedTag) {
    const explanations = {
      quiet: 'Added "quiet" — filtering for peaceful neighborhoods and low-noise hotels.',
      social: 'Added "social" — showing hotels with vibrant lobbies and communal energy.',
      luxury: 'Added "luxury" — prioritizing 5-star experiences and premium amenities.',
      budget: 'Added "budget" — focusing on value picks under your range.',
      walkable: 'Added "walkable" — boosting hotels in the most central, foot-friendly locations.',
      rooftop: 'Added "rooftop" — highlighting hotels with skyline views and outdoor spaces.',
      foodie: 'Added "foodie" — prioritizing hotels with standout restaurants and dining scenes.',
      'design-hotel': 'Added "design" — showing architecturally distinctive and visually stunning stays.',
      spa: 'Added "spa" — boosting hotels with wellness facilities and relaxation focus.',
      eco: 'Added "eco" — prioritizing sustainable, environmentally conscious properties.',
      romantic: 'Added "romantic" — showing intimate, couple-friendly hotels with special ambiance.',
      nightlife: 'Added "nightlife" — boosting hotels near bars, clubs, and evening entertainment.',
    };
    return explanations[addedTag] || `Added "${addedTag}" — re-ranking to match your updated preferences.`;
  }

  if (removedTag) {
    const explanations = {
      quiet: 'Removed "quiet" — showing more social and lively options.',
      social: 'Removed "social" — including quieter, more intimate properties.',
      luxury: 'Removed "luxury" — widening the range to include all price points.',
      budget: 'Removed "budget" — including premium options in results.',
      walkable: 'Removed "walkable" — considering hotels in all neighborhoods.',
      rooftop: 'Removed "rooftop" — no longer prioritizing outdoor/view spaces.',
    };
    return explanations[removedTag] || `Removed "${removedTag}" — expanding results beyond that filter.`;
  }

  return 'Preferences updated — re-ranking your shortlist.';
}
