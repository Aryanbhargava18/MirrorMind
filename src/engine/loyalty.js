// TripSense — Loyalty Engine (Phase 5)
// Contextual loyalty nudges — shown once, at the right time, inside the discovery card.

import { getPointsExpiryDays } from '../data/session';

export function calculateLoyaltyNudge(hotel, sessionDNA) {
  const { loyaltyTier, pointBalance, pointExpiryDate } = sessionDNA;

  // Only show if silver+ OR points > 500
  const isEligible = ['silver', 'gold', 'platinum'].includes(loyaltyTier) || pointBalance > 500;
  if (!isEligible) {
    return { show: false };
  }

  // Find the best redeemable perk for current points
  const redeemOptions = hotel.loyaltyPerks.pointsRedeemOptions
    .filter(opt => opt.points <= pointBalance)
    .sort((a, b) => b.points - a.points);

  // Find the cheapest earn option to show what's possible
  const earnOptions = hotel.loyaltyPerks.pointsRedeemOptions
    .filter(opt => opt.points > pointBalance)
    .sort((a, b) => a.points - b.points);

  // Tier-specific benefit
  const tierBenefit = hotel.loyaltyPerks.tierBenefits[loyaltyTier];

  // Points expiry
  const expiryDays = getPointsExpiryDays(sessionDNA);
  let expiryWarning = null;
  if (expiryDays !== null && expiryDays <= 30) {
    expiryWarning = `Your ${pointBalance.toLocaleString()} points expire in ${expiryDays} day${expiryDays !== 1 ? 's' : ''}`;
  }

  // Determine primary CTA
  let callToAction, message, pointsRequired;

  if (redeemOptions.length > 0) {
    const bestRedeem = redeemOptions[0];
    callToAction = 'Redeem';
    message = `Use ${bestRedeem.points.toLocaleString()} of your ${pointBalance.toLocaleString()} points for: ${bestRedeem.benefit}`;
    pointsRequired = bestRedeem.points;

    // If points are expiring, adjust message
    if (expiryWarning && expiryDays <= 18) {
      message = `${expiryWarning}. Use ${bestRedeem.points.toLocaleString()} here for: ${bestRedeem.benefit}`;
    }
  } else if (earnOptions.length > 0) {
    const nextEarn = earnOptions[0];
    const pointsNeeded = nextEarn.points - pointBalance;
    callToAction = 'Earn';
    message = `Earn ${hotel.loyaltyPerks.pointsEarnRate}x points per night. You're ${pointsNeeded.toLocaleString()} points from: ${nextEarn.benefit}`;
    pointsRequired = nextEarn.points;
  } else {
    callToAction = 'Upgrade';
    message = tierBenefit ? `As a ${loyaltyTier} member: ${tierBenefit}` : `Earn ${hotel.loyaltyPerks.pointsEarnRate}x points per night at this hotel`;
    pointsRequired = 0;
  }

  // Add tier benefit as secondary info
  const tierMessage = tierBenefit ? `${loyaltyTier.charAt(0).toUpperCase() + loyaltyTier.slice(1)} perk: ${tierBenefit}` : null;

  return {
    show: true,
    message,
    pointsRequired,
    expiryWarning,
    callToAction,
    tierMessage,
    pointBalance,
    earnRate: hotel.loyaltyPerks.pointsEarnRate,
  };
}

export function shouldShowLoyalty(hotel, sessionDNA) {
  const nudge = calculateLoyaltyNudge(hotel, sessionDNA);
  // Only show when genuinely valuable (precision over recall)
  return nudge.show && (nudge.callToAction === 'Redeem' || nudge.expiryWarning);
}
