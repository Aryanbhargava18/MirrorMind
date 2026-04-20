import { getPointsExpiryDays } from '../data/session';

const TIERS = ['blue', 'silver', 'gold', 'platinum'];

export default function SessionDNAPanel({ isOpen, onClose, sessionDNA, onUpdate }) {
  if (!isOpen) return null;

  const expiryDays = getPointsExpiryDays(sessionDNA);

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-navy-100 border-l border-white/5 z-50 overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-navy-100/95 backdrop-blur-sm border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-warm font-semibold text-lg">Your Travel Profile</h2>
            <p className="text-muted text-xs mt-0.5">Session DNA — you own this data</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-warm transition-colors p-1" id="close-dna-panel">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Identity */}
          <section>
            <label className="text-[10px] text-muted/60 uppercase tracking-wider font-medium">Traveler</label>
            <div className="mt-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber/20 flex items-center justify-center">
                <span className="text-amber font-semibold">{sessionDNA.userName?.charAt(0) || 'A'}</span>
              </div>
              <div>
                <p className="text-warm font-medium text-sm">{sessionDNA.userName || 'Traveler'}</p>
                <p className="text-muted text-xs">Trust Score: {Math.round(sessionDNA.trustScore * 100)}%</p>
              </div>
            </div>

            {/* Trust score bar */}
            <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${sessionDNA.trustScore * 100}%` }}
              />
            </div>
          </section>

          {/* Loyalty */}
          <section>
            <label className="text-[10px] text-muted/60 uppercase tracking-wider font-medium">Loyalty Status</label>
            <div className="mt-2 glass-dark p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-amber text-lg">✦</span>
                  <span className="text-warm font-medium capitalize">{sessionDNA.loyaltyTier} Tier</span>
                </div>
                <span className="text-amber font-semibold">{sessionDNA.pointBalance.toLocaleString()} pts</span>
              </div>

              {/* Tier Progress */}
              <div className="flex items-center gap-1 mb-3">
                {TIERS.map(tier => (
                  <div key={tier} className="flex-1">
                    <div className={`h-1.5 rounded-full ${
                      TIERS.indexOf(tier) <= TIERS.indexOf(sessionDNA.loyaltyTier)
                        ? 'bg-amber'
                        : 'bg-white/10'
                    }`} />
                    <p className={`text-[9px] mt-1 text-center capitalize ${
                      tier === sessionDNA.loyaltyTier ? 'text-amber font-medium' : 'text-muted/30'
                    }`}>{tier}</p>
                  </div>
                ))}
              </div>

              {expiryDays !== null && expiryDays <= 30 && (
                <div className="flex items-center gap-1.5 text-xs text-amber/80 bg-amber/10 rounded-pill px-3 py-1.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Points expire in {expiryDays} day{expiryDays !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </section>

          {/* Trip Type */}
          <section>
            <label className="text-[10px] text-muted/60 uppercase tracking-wider font-medium">Default Trip Type</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {['leisure', 'business', 'romantic', 'solo', 'family'].map(type => (
                <button
                  key={type}
                  onClick={() => onUpdate({ tripType: type })}
                  className={`tag-pill capitalize ${
                    sessionDNA.tripType === type ? 'tag-active' : 'tag-inactive !text-muted/60'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </section>

          {/* Preference Vector (simplified) */}
          <section>
            <label className="text-[10px] text-muted/60 uppercase tracking-wider font-medium">Taste Profile</label>
            <div className="mt-2 space-y-2">
              {Object.entries(sessionDNA.preferenceVector)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 8)
                .map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xs text-muted/60 w-20 truncate capitalize">{key}</span>
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber/40 to-amber rounded-full transition-all"
                        style={{ width: `${value * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted/40 w-8 text-right">{Math.round(value * 100)}%</span>
                  </div>
                ))}
            </div>
          </section>

          {/* Past Bookings */}
          <section>
            <label className="text-[10px] text-muted/60 uppercase tracking-wider font-medium">Past Bookings</label>
            <div className="mt-2 space-y-2">
              {sessionDNA.pastBookings.map((booking, i) => (
                <div key={i} className="glass-dark p-3">
                  <p className="text-warm text-sm font-medium">{booking.hotel}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-amber text-xs">★ {booking.rating_given}</span>
                    <div className="flex gap-1">
                      {booking.tags_applied.map(tag => (
                        <span key={tag} className="text-[10px] text-muted/50 bg-white/5 px-1.5 py-0.5 rounded">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Avoided Patterns */}
          <section>
            <label className="text-[10px] text-muted/60 uppercase tracking-wider font-medium">Learned Patterns</label>
            <div className="mt-2 space-y-1">
              {sessionDNA.avoidedPatterns.map((pattern, i) => (
                <p key={i} className="text-xs text-muted/40 flex items-center gap-1.5">
                  <span className="text-red-400/50">✕</span> {pattern}
                </p>
              ))}
            </div>
          </section>

          {/* Session Edits */}
          {sessionDNA.sessionEdits.length > 0 && (
            <section>
              <label className="text-[10px] text-muted/60 uppercase tracking-wider font-medium">
                This Session ({sessionDNA.sessionEdits.length} edits)
              </label>
              <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                {sessionDNA.sessionEdits.slice(-5).reverse().map((edit, i) => (
                  <p key={i} className="text-xs text-muted/30">
                    {edit.type}: {JSON.stringify(edit.detail)}
                  </p>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
