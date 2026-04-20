// TripSense — Eval Framework (Phase 7)
// Silent self-evaluation on every output.

export function evaluate(results, trace, intent) {
  const evals = {};

  // E1: Relevance — does the shortlist match the intent?
  const tripType = intent.tripType || 'leisure';
  const avgTripScore = results.reduce((acc, r) => {
    return acc + (r.hotel.tripTypeScores[tripType] || 50);
  }, 0) / results.length;
  evals.E1_relevance = {
    name: 'Relevance',
    score: Math.round(avgTripScore) / 100,
    detail: `Average trip-type alignment: ${Math.round(avgTripScore)}% for ${tripType} travelers`,
    passed: avgTripScore > 60,
  };

  // E2: Honesty — every card has a non-trivial anti-rec
  const antiRecPresent = results.every(r => r.hotel.antiRec && r.hotel.antiRec.length > 20);
  evals.E2_honesty = {
    name: 'Honesty',
    score: antiRecPresent ? 1 : 0,
    detail: antiRecPresent 
      ? 'All cards have substantive anti-recommendations' 
      : `${results.filter(r => !r.hotel.antiRec || r.hotel.antiRec.length <= 20).length} cards missing anti-rec`,
    passed: antiRecPresent,
  };

  // E3: Constitutional compliance
  const violations = results.filter(r => r.constitutionalViolations?.length > 0);
  evals.E3_constitution = {
    name: 'Constitutional Compliance',
    score: violations.length === 0 ? 1 : 1 - (violations.length / results.length),
    detail: violations.length === 0 
      ? 'All cards passed constitutional review' 
      : `${violations.length} card(s) had violations`,
    passed: violations.length === 0,
  };

  // E4: Debate utilization — did Agent B actually change the list?
  const agentBImpact = trace.agentB.impactDelta;
  const listReordered = trace.synthesis.reorderFromA;
  evals.E4_debate = {
    name: 'Debate Utilization',
    score: listReordered ? 1 : (agentBImpact > 5 ? 0.7 : 0.3),
    detail: listReordered 
      ? `Agent B reordered the final list (total impact: -${agentBImpact} points across candidates)` 
      : `Agent B raised ${trace.agentB.totalChallenges} challenges but final order unchanged`,
    passed: agentBImpact > 0,
  };

  // E5: Loyalty precision — shown only when genuinely valuable
  const loyaltyShown = results.filter(r => r.loyaltyNudge?.show);
  const loyaltyRelevant = loyaltyShown.filter(r => 
    r.loyaltyNudge.callToAction === 'Redeem' || r.loyaltyNudge.expiryWarning
  );
  const loyaltyPrecision = loyaltyShown.length > 0 
    ? loyaltyRelevant.length / loyaltyShown.length 
    : 1;
  evals.E5_loyalty = {
    name: 'Loyalty Precision',
    score: loyaltyPrecision,
    detail: `${loyaltyRelevant.length}/${loyaltyShown.length} loyalty nudges are genuinely actionable`,
    passed: loyaltyPrecision >= 0.5,
  };

  // Overall score
  const overallScore = Object.values(evals).reduce((acc, e) => acc + e.score, 0) / Object.keys(evals).length;

  return {
    evals,
    overallScore: Math.round(overallScore * 100) / 100,
    allPassed: Object.values(evals).every(e => e.passed),
    timestamp: new Date().toISOString(),
  };
}
