export default function LoyaltyNudge({ nudge, hotelName }) {
  if (!nudge.show) return null;

  const ctaColors = {
    Redeem: 'bg-navy text-amber hover:bg-navy/90',
    Earn: 'bg-amber/20 text-amber-700 hover:bg-amber/30',
    Upgrade: 'bg-amber/10 text-amber-600 hover:bg-amber/20',
  };

  return (
    <div className="loyalty-ribbon px-6 py-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-navy/80 text-xs font-semibold uppercase tracking-wider">✦ Loyalty</span>
            {nudge.tierMessage && (
              <>
                <span className="text-navy/30">·</span>
                <span className="text-navy/60 text-[11px]">{nudge.tierMessage}</span>
              </>
            )}
          </div>
          <p className="text-navy/90 text-sm font-medium leading-snug">{nudge.message}</p>
          {nudge.expiryWarning && (
            <p className="text-navy/70 text-xs mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {nudge.expiryWarning}
            </p>
          )}
        </div>
        <button 
          className={`px-5 py-2.5 rounded-pill text-sm font-semibold transition-all active:scale-[0.97] shadow-md ${
            ctaColors[nudge.callToAction] || ctaColors.Earn
          }`}
          id={`loyalty-cta-${hotelName.replace(/\s+/g, '-').toLowerCase()}`}
        >
          {nudge.callToAction} {nudge.callToAction === 'Redeem' ? `${nudge.pointsRequired} pts` : '→'}
        </button>
      </div>
    </div>
  );
}
