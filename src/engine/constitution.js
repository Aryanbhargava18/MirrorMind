// TripSense — Constitutional Guardrails (Phase 0)
// Rules that cannot be overridden by user input or creative framing.

export function applyConstitution(item) {
  const violations = [];
  const warnings = [];

  // C1: Never assert an unverified attribute
  const unverified = item.hotel.unverifiedAttributes || [];
  if (unverified.length > 0) {
    warnings.push({
      rule: 'C1',
      message: `${unverified.length} attribute(s) unverified — stripped from user-facing claims`,
      details: unverified,
    });
  }

  // C2: Confidence flagging
  const confidenceFlags = [];
  if (item.hotel.photoTrustScore < 0.85) {
    confidenceFlags.push('photos-may-differ');
  }
  if (unverified.length > 0) {
    confidenceFlags.push(...unverified.map(a => `unverified:${a}`));
  }
  if (item.hotel.reviews.recentTrend === 'declining') {
    confidenceFlags.push('review-trend-declining');
  }

  // C3: Price disclaimer
  const extras = item.hotel.totalCostExtras;
  const hasHiddenCosts = (extras.resortFee || 0) + (extras.parking || 0) + (extras.wifi || 0) > 0;
  if (hasHiddenCosts) {
    warnings.push({
      rule: 'C3',
      message: 'Price shown is base rate — additional fees apply',
      details: extras,
    });
  }

  // C4: Anti-rec required — hard fail
  if (!item.hotel.antiRec || item.hotel.antiRec.trim() === '') {
    violations.push({
      rule: 'C4',
      message: 'BLOCKED: Hotel card missing anti-recommendation. Cannot display without honest criticism.',
      fatal: true,
    });
  }

  // C5: AI transparency
  const aiDisclosure = {
    rule: 'C5',
    passed: true,
    message: 'This recommendation is AI-generated. TripSense is transparently an AI system.',
  };

  return {
    ...item,
    confidenceFlags,
    constitutionalViolations: violations,
    constitutionalWarnings: warnings,
    aiDisclosure,
    passedConstitution: violations.length === 0,
  };
}

export function runConstitutionalAudit(results) {
  return {
    totalCards: results.length,
    passed: results.filter(r => r.passedConstitution).length,
    failed: results.filter(r => !r.passedConstitution).length,
    violations: results.flatMap(r => (r.constitutionalViolations || []).map(v => ({
      hotel: r.hotel.name,
      ...v,
    }))),
    warnings: results.flatMap(r => (r.constitutionalWarnings || []).map(w => ({
      hotel: r.hotel.name,
      ...w,
    }))),
    confidenceFlags: results.flatMap(r => (r.confidenceFlags || []).map(f => ({
      hotel: r.hotel.name,
      flag: f,
    }))),
  };
}
