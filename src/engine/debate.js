// TripSense — Three-Agent Debate Engine (Phase 3)
// Simulated multi-agent debate with deterministic logic and full reasoning traces.

import { applyConstitution } from './constitution';
import { calculateLoyaltyNudge } from './loyalty';

// ─────────────────────────────────────────────
// AGENT A — THE OPTIMIZER
// Maximizes relevance against preference vector
// ─────────────────────────────────────────────
function agentA_optimize(hotels, sessionDNA, intent) {
  const scored = hotels.map(hotel => {
    let score = 0;
    let reasoning = [];

    // Trip type alignment
    const tripScore = hotel.tripTypeScores[intent.tripType || sessionDNA.tripType] || 50;
    score += tripScore * 0.35;
    reasoning.push(`Trip type (${intent.tripType || sessionDNA.tripType}) score: ${tripScore}/100`);

    // Preference vector match
    const prefVector = sessionDNA.preferenceVector;
    let prefMatch = 0;
    let matchedTags = [];
    hotel.tags.forEach(tag => {
      const normalized = tag.toLowerCase().replace(/[^a-z-]/g, '');
      if (prefVector[normalized] !== undefined) {
        prefMatch += prefVector[normalized];
        matchedTags.push({ tag, weight: prefVector[normalized] });
      }
    });
    const avgPrefMatch = hotel.tags.length > 0 ? (prefMatch / hotel.tags.length) * 100 : 50;
    score += avgPrefMatch * 0.25;
    reasoning.push(`Preference alignment: ${avgPrefMatch.toFixed(0)}% (matched: ${matchedTags.map(t => t.tag).join(', ')})`);

    // Budget fit
    const [minBudget, maxBudget] = intent.budgetRange || sessionDNA.budgetRange;
    const totalNightly = hotel.pricePerNight + (hotel.totalCostExtras.resortFee || 0);
    let budgetScore;
    if (totalNightly >= minBudget && totalNightly <= maxBudget) {
      budgetScore = 90;
    } else if (totalNightly < minBudget) {
      budgetScore = 70;
    } else {
      const overshoot = ((totalNightly - maxBudget) / maxBudget) * 100;
      budgetScore = Math.max(10, 70 - overshoot);
    }
    score += budgetScore * 0.15;
    reasoning.push(`Budget fit: ${budgetScore.toFixed(0)}/100 ($${totalNightly}/night total vs $${minBudget}-$${maxBudget} range)`);

    // Review quality
    const reviewScore = (hotel.reviews.sentimentScore * 70) + (hotel.reviews.recencyWeight * 30);
    score += reviewScore * 0.15;
    reasoning.push(`Review signal: sentiment ${(hotel.reviews.sentimentScore * 100).toFixed(0)}%, recency weight ${(hotel.reviews.recencyWeight * 100).toFixed(0)}%`);

    // Active tag filter boost
    if (intent.activeTags && intent.activeTags.length > 0) {
      const tagOverlap = intent.activeTags.filter(t => hotel.tags.includes(t)).length;
      const tagBoost = (tagOverlap / intent.activeTags.length) * 15;
      score += tagBoost;
      reasoning.push(`Active tag match: ${tagOverlap}/${intent.activeTags.length} tags (+${tagBoost.toFixed(1)} boost)`);
    }

    // Past booking pattern
    const pastTags = sessionDNA.pastBookings.flatMap(b => b.tags_applied);
    const pastOverlap = hotel.tags.filter(t => pastTags.includes(t)).length;
    if (pastOverlap > 0) {
      score += pastOverlap * 2;
      reasoning.push(`Past booking alignment: ${pastOverlap} matching tags from history`);
    }

    return {
      hotel,
      optimizerScore: Math.min(100, Math.round(score)),
      optimizerReasoning: reasoning,
      matchedPreferences: matchedTags,
    };
  });

  return scored
    .sort((a, b) => b.optimizerScore - a.optimizerScore)
    .slice(0, 7);
}

// ─────────────────────────────────────────────
// AGENT B — THE DEVIL'S ADVOCATE
// Finds flaws, challenges each recommendation
// ─────────────────────────────────────────────
function agentB_challenge(optimizedList, sessionDNA, intent) {
  return optimizedList.map(item => {
    const { hotel } = item;
    const challenges = [];
    let downgradeScore = 0;

    // Challenge 1: Review trend
    if (hotel.reviews.recentTrend === 'declining') {
      challenges.push({
        type: 'review-decline',
        severity: 'high',
        message: `Recent reviews show a declining trend — quality may have dropped since the ${hotel.reviews.avgScore} average was established.`,
      });
      downgradeScore += 8;
    }

    // Challenge 2: Trip type mismatch in reviews
    const tripType = intent.tripType || sessionDNA.tripType;
    const tripReviews = hotel.reviews.byTripType[tripType];
    if (tripReviews && tripReviews.avg < hotel.reviews.avgScore - 0.3) {
      challenges.push({
        type: 'trip-type-mismatch',
        severity: 'medium',
        message: `Travelers on ${tripType} trips rate this ${tripReviews.avg.toFixed(1)}/5, below the ${hotel.reviews.avgScore}/5 overall. The overall score may be misleading for YOUR trip.`,
      });
      downgradeScore += 5;
    }

    // Challenge 3: Hidden costs
    const extras = hotel.totalCostExtras;
    const hiddenTotal = (extras.resortFee || 0) + (extras.parking || 0) + (extras.wifi || 0);
    if (hiddenTotal > 30) {
      challenges.push({
        type: 'hidden-costs',
        severity: 'medium',
        message: `The listed $${hotel.pricePerNight}/night doesn't include ${[
          extras.resortFee ? `$${extras.resortFee} resort fee` : null,
          extras.parking ? `$${extras.parking} parking` : null,
          extras.wifi ? `$${extras.wifi} wifi` : null,
        ].filter(Boolean).join(', ')}. Real nightly cost could be $${hotel.pricePerNight + hiddenTotal}.`,
      });
      downgradeScore += 3;
    }

    // Challenge 4: Neighborhood mismatch
    if (hotel.neighborhood_context.noiseLevel.includes('loud') && 
        (sessionDNA.preferenceVector.quiet > 0.6 || intent.activeTags?.includes('quiet'))) {
      challenges.push({
        type: 'noise-mismatch',
        severity: 'high',
        message: `You prefer quiet environments but this hotel/neighborhood is rated "${hotel.neighborhood_context.noiseLevel}". Expect noise issues.`,
      });
      downgradeScore += 7;
    }

    // Challenge 5: Seasonal issues
    const month = new Date().getMonth();
    const season = month >= 5 && month <= 8 ? 'summer' : 'winter';
    const seasonNote = hotel.seasonalNotes[season];
    if (seasonNote && (seasonNote.toLowerCase().includes('closed') || seasonNote.toLowerCase().includes('surcharge'))) {
      challenges.push({
        type: 'seasonal-issue',
        severity: 'medium',
        message: `Seasonal alert: ${seasonNote}`,
      });
      downgradeScore += 4;
    }

    // Challenge 6: Photo trust
    if (hotel.photoTrustScore < 0.85) {
      challenges.push({
        type: 'photo-trust',
        severity: 'low',
        message: `Photo trust score is ${(hotel.photoTrustScore * 100).toFixed(0)}% — some guests report photos may not perfectly match current reality.`,
      });
      downgradeScore += 2;
    }

    // Challenge 7: Accessibility gaps
    if (intent.accessibilityNeeds && intent.accessibilityNeeds.length > 0) {
      const missing = intent.accessibilityNeeds.filter(need => !hotel.accessibility.includes(need));
      if (missing.length > 0) {
        challenges.push({
          type: 'accessibility-gap',
          severity: 'high',
          message: `Missing accessibility features: ${missing.join(', ')}`,
        });
        downgradeScore += 10;
      }
    }

    // Challenge 8: Unverified attributes
    if (hotel.unverifiedAttributes.length > 0) {
      challenges.push({
        type: 'unverified-claims',
        severity: 'low',
        message: `Some attributes are unverified: ${hotel.unverifiedAttributes.join(', ')}`,
      });
      downgradeScore += 1;
    }

    return {
      ...item,
      challenges,
      downgradeScore,
      adjustedScore: Math.max(0, item.optimizerScore - downgradeScore),
      advocateVerdict: challenges.length === 0 ? 'approved' : 
                       downgradeScore > 15 ? 'rejected' : 'flagged',
    };
  });
}

// ─────────────────────────────────────────────
// AGENT C — THE EMPATHY AGENT
// Emotional journey, surprise picks, soul match
// ─────────────────────────────────────────────
function agentC_empathize(challengedList, allHotels, sessionDNA, intent) {
  const tripType = intent.tripType || sessionDNA.tripType;
  
  const withEmpathy = challengedList.map(item => {
    const { hotel } = item;
    let emotionalScore = 0;
    let emotionalNotes = [];

    // Emotional dimension 1: Will the lobby make them smile?
    if (hotel.tags.includes('design-hotel') || hotel.tags.includes('historic') || hotel.tags.includes('architectural')) {
      emotionalScore += 15;
      emotionalNotes.push('The visual impact when you walk in will set the tone for your entire trip.');
    }

    // Emotional dimension 2: Bed quality signal from reviews
    if (hotel.reviews.topPositiveTag.toLowerCase().includes('bed') || 
        hotel.reviews.topPositiveTag.toLowerCase().includes('sleep') ||
        hotel.reviews.topPositiveTag.toLowerCase().includes('comfort')) {
      emotionalScore += 12;
      emotionalNotes.push('Guests consistently praise rest quality — you\'ll wake up ready for day 2.');
    }

    // Emotional dimension 3: Hidden gem warmth
    if (hotel.hiddenGem) {
      emotionalScore += 18;
      emotionalNotes.push('✨ This is a hidden gem — it scores lower on raw data but has an intangible warmth that numbers can\'t capture.');
    }

    // Emotional dimension 4: Neighborhood soul
    if (hotel.neighborhood_context.walkability > 8.5) {
      emotionalScore += 8;
      emotionalNotes.push('Step outside and the city is yours — effortless exploration from the front door.');
    }

    // Emotional dimension 5: Trip-type emotional fit
    const emotionalFit = {
      romantic: ['intimate', 'quiet', 'romantic', 'cozy', 'unique-rooms'],
      solo: ['social', 'creative', 'walkable', 'solo-friendly', 'hipster'],
      family: ['family-friendly', 'spacious', 'eco', 'rooftop-pool'],
      business: ['quiet', 'coworking', 'walkable', 'luxury'],
      leisure: ['rooftop', 'scenic', 'foodie', 'design-hotel', 'trendy'],
    };
    const fitTags = emotionalFit[tripType] || [];
    const emotionalOverlap = fitTags.filter(t => hotel.tags.includes(t)).length;
    emotionalScore += emotionalOverlap * 5;
    if (emotionalOverlap >= 2) {
      emotionalNotes.push(`This hotel emotionally aligns with your ${tripType} energy — ${emotionalOverlap} resonance signals.`);
    }

    return {
      ...item,
      emotionalScore,
      emotionalNotes,
      combinedScore: Math.round((item.adjustedScore * 0.65) + (emotionalScore * 0.35)),
    };
  });

  // Find soul match: hotel from the FULL list that might be a surprise
  const existingIds = new Set(withEmpathy.map(i => i.hotel.id));
  const soulCandidates = allHotels
    .filter(h => !existingIds.has(h.id) && h.hiddenGem)
    .map(hotel => {
      const tripScore = hotel.tripTypeScores[tripType] || 50;
      const walkScore = hotel.neighborhood_context.walkability * 5;
      const soulScore = tripScore * 0.4 + walkScore * 0.3 + (hotel.reviews.sentimentScore * 100) * 0.3;
      return { hotel, soulScore, isSoulMatch: true };
    })
    .sort((a, b) => b.soulScore - a.soulScore);

  let soulMatch = null;
  if (soulCandidates.length > 0) {
    const candidate = soulCandidates[0];
    soulMatch = {
      hotel: candidate.hotel,
      optimizerScore: Math.round(candidate.soulScore),
      optimizerReasoning: ['Surfaced by Empathy Agent as a soul match — may not top the data but resonates emotionally.'],
      matchedPreferences: [],
      challenges: [],
      downgradeScore: 0,
      adjustedScore: Math.round(candidate.soulScore),
      advocateVerdict: 'soul-match',
      emotionalScore: 25,
      emotionalNotes: ['✨ Soul Match — the Empathy Agent believes this hotel will surprise and delight you in ways the data doesn\'t capture.'],
      combinedScore: Math.round(candidate.soulScore * 0.8 + 25 * 0.2),
      isSoulMatch: true,
      agentSignature: 'C-override',
    };
  }

  return { rankedList: withEmpathy, soulMatch };
}

// ─────────────────────────────────────────────
// SYNTHESIS — Karpathy Loop
// ─────────────────────────────────────────────
export function runDebate(hotels, sessionDNA, intent) {
  const startTime = performance.now();

  // Step 1: Agent A generates ranked list
  const optimized = agentA_optimize(hotels, sessionDNA, intent);

  // Step 2: Agent B challenges every pick
  const challenged = agentB_challenge(optimized, sessionDNA, intent);

  // Step 3: Agent C adds emotional intelligence + soul match
  const { rankedList, soulMatch } = agentC_empathize(challenged, hotels, sessionDNA, intent);

  // Step 4: Synthesize — sort by combined score
  let finalList = rankedList
    .sort((a, b) => b.combinedScore - a.combinedScore)
    .slice(0, 4);

  // Assign agent signatures
  finalList = finalList.map(item => {
    const aScore = item.optimizerScore;
    const cScore = item.emotionalScore;
    let agentSignature;
    if (cScore > 15 && item.hotel.hiddenGem) agentSignature = 'C-override';
    else if (cScore > 10) agentSignature = 'A+C';
    else agentSignature = 'A';
    return { ...item, agentSignature };
  });

  // Inject soul match if exists and not already in list
  if (soulMatch && !finalList.find(i => i.hotel.id === soulMatch.hotel.id)) {
    if (finalList.length >= 4) finalList.pop();
    finalList.push(soulMatch);
  }

  // Apply constitutional rules
  finalList = finalList.map(item => applyConstitution(item));

  // Calculate loyalty for each
  finalList = finalList.map(item => ({
    ...item,
    loyaltyNudge: calculateLoyaltyNudge(item.hotel, sessionDNA),
  }));

  // Generate "why it fits" text
  finalList = finalList.map(item => ({
    ...item,
    whyItFits: generateWhyItFits(item, sessionDNA, intent),
  }));

  const debateTime = performance.now() - startTime;

  // Build reasoning trace
  const trace = {
    debateTimeMs: Math.round(debateTime),
    agentA: {
      name: 'The Optimizer',
      candidates: optimized.length,
      topPick: optimized[0]?.hotel.name,
      reasoning: optimized.slice(0, 3).map(i => ({
        hotel: i.hotel.name,
        score: i.optimizerScore,
        reasoning: i.optimizerReasoning,
      })),
    },
    agentB: {
      name: 'The Devil\'s Advocate',
      totalChallenges: challenged.reduce((acc, i) => acc + i.challenges.length, 0),
      rejections: challenged.filter(i => i.advocateVerdict === 'rejected').map(i => i.hotel.name),
      impactDelta: challenged.reduce((acc, i) => acc + i.downgradeScore, 0),
      challenges: challenged.slice(0, 3).map(i => ({
        hotel: i.hotel.name,
        verdict: i.advocateVerdict,
        challenges: i.challenges,
        scoreImpact: `-${i.downgradeScore}`,
      })),
    },
    agentC: {
      name: 'The Empathy Agent',
      soulMatch: soulMatch?.hotel.name || 'none',
      emotionalOverrides: rankedList.filter(i => i.emotionalScore > 15).length,
      notes: rankedList.slice(0, 3).map(i => ({
        hotel: i.hotel.name,
        emotionalScore: i.emotionalScore,
        notes: i.emotionalNotes,
      })),
    },
    synthesis: {
      finalCount: finalList.length,
      reorderFromA: finalList[0]?.hotel.name !== optimized[0]?.hotel.name,
      constitutionalPasses: finalList.filter(i => !i.constitutionalViolations?.length).length,
    },
  };

  return { results: finalList, trace };
}

// ─────────────────────────────────────────────
// WHY IT FITS — personalized two-sentence explanation
// ─────────────────────────────────────────────
function generateWhyItFits(item, sessionDNA, intent) {
  const { hotel, matchedPreferences, emotionalNotes, isSoulMatch } = item;
  const tripType = intent.tripType || sessionDNA.tripType;

  if (isSoulMatch) {
    return `This isn't the obvious pick — it's the one you'll remember. ${emotionalNotes[0] || `The ${hotel.neighborhood} neighborhood and ${hotel.tags[0]} character align with what ${tripType} travelers actually love.`}`;
  }

  const topPrefs = (matchedPreferences || []).slice(0, 2).map(p => p.tag);
  const tripReviews = hotel.reviews.byTripType[tripType];
  const tripRating = tripReviews ? `${tripReviews.avg}/5 from ${tripType} travelers` : '';

  const whyParts = [];
  
  if (topPrefs.length > 0) {
    whyParts.push(`Matches your taste for ${topPrefs.join(' and ')}`);
  }
  
  if (tripRating) {
    whyParts.push(`rated ${tripRating}`);
  }

  if (hotel.neighborhood_context.walkability > 8.5 && sessionDNA.preferenceVector.walkable > 0.7) {
    whyParts.push(`in one of NYC's most walkable neighborhoods`);
  }

  const sentence1 = whyParts.length > 0 
    ? whyParts.slice(0, 2).join(', ') + '.'
    : `Strong ${tripType} fit with ${hotel.reviews.topPositiveTag}.`;

  const sentence2 = emotionalNotes.length > 0
    ? emotionalNotes[0]
    : `${hotel.reviews.count.toLocaleString()} reviews confirm: "${hotel.reviews.topPositiveTag}"`;

  return `${sentence1} ${sentence2}`;
}

export default runDebate;
