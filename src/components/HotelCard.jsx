import { useState } from 'react';

// Fallback images
const HOTEL_IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
  'https://images.unsplash.com/photo-1618773928121-c32f48e60ce4?w=800&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
];

const FALLBACK_IMG = HOTEL_IMAGES[0];

function formatINR(amount) {
  if (!amount || isNaN(amount)) return '—';
  return '₹' + Number(amount).toLocaleString('en-IN');
}

export default function HotelCard({ result, index, tripType }) {
  const [expanded, setExpanded] = useState(false);
  const [showPrices, setShowPrices] = useState(false);

  // Normalize data from API
  const item = result?.hotel || result || {};
  const name = item.hotel_name || item.name || 'Hotel';
  const id = item.hotel_id || item.id || `hotel-${index}`;
  const neighborhood = item.neighborhood || '';
  const starRating = item.starRating || 4;
  const pricePerNight = item.pricePerNight || 0;
  const priceDisplay = item.priceDisplay || '';
  const totalPrice = item.totalPrice || '';
  const totalExtracted = item.totalExtracted || 0;
  const beforeTaxes = item.beforeTaxes || '';
  const currency = item.currency || 'INR';
  const tags = item.tags || [];
  const isSoulMatch = item.is_soul_match || false;
  const description = item.description || '';
  const imageUrl = item.image || item.imageUrl || HOTEL_IMAGES[index % HOTEL_IMAGES.length];
  const allImages = item.images && item.images.length > 0 ? item.images : [imageUrl];
  const [imageIndex, setImageIndex] = useState(0);

  const handleNextImage = (e) => {
    e.stopPropagation();
    setImageIndex((prev) => (prev + 1) % allImages.length);
  };
  
  const handlePrevImage = (e) => {
    e.stopPropagation();
    setImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  // Booking sources for price comparison
  const bookingSources = item.bookingSources || item.booking_sources || [];
  const officialLink = item.officialLink || item.official_link || '';

  // Deal badge
  const deal = item.deal || '';
  const dealDescription = item.dealDescription || item.deal_description || '';

  // Eco certification
  const ecoCertified = item.ecoCertified || item.eco_certified || false;

  // Check-in/out times
  const checkInTime = item.checkInTime || item.check_in_time || '';
  const checkOutTime = item.checkOutTime || item.check_out_time || '';

  // Review highlights
  const reviewHighlights = item.reviewHighlights || item.review_highlights || [];

  // Nearby places
  const nearbyPlaces = item.nearbyPlaces || item.nearby_places || [];

  // Scores
  const combinedScore = result.combinedScore || item.final_score || 0;
  const matchScore = item.matchScore || {
    total: combinedScore,
    budgetFit: Math.round((item.optimizer_score || 50) / 10),
    tripTypeMatch: 7,
    reviewSignal: 6,
    agentConsensus: isSoulMatch ? 'A+C' : 'A',
  };

  const whyItFits = result.whyItFits || item.why_it_fits || '';
  const antiRec = item.anti_rec || item.antiRec || '';

  // Reviews
  const reviews = item.reviews || {};
  const avgScore = reviews.avgScore || 0;
  const reviewCount = reviews.count || 0;
  const recentTrend = reviews.recentTrend || 'stable';
  const locationRating = reviews.locationRating || 0;

  // Neighborhood
  const nc = item.neighborhood_context || item.neighborhoodContext || {};
  const walkability = nc.walkability || 0;

  // Fees
  const fees = item.hiddenFees || {};
  const resortFee = fees.resortFee || 0;
  const hasHiddenCosts = resortFee > 0;


  // Deal calculations
  let dealType = null;
  if (deal) {
    const isGreat = deal.toLowerCase().includes('great') || (dealDescription && dealDescription.toLowerCase().includes('great'));
    // Try to extract % from dealDescription
    const pctMatch = dealDescription ? dealDescription.match(/(\d+)%/) : null;
    const pct = pctMatch ? parseInt(pctMatch[1]) : 0;
    
    if (isGreat || pct >= 25) {
      dealType = 'great';
    } else if (pct >= 10 || deal.toLowerCase() === 'deal') {
      dealType = 'good';
    }
  }


  // Sort booking sources by price (cheapest first)
  const sortedSources = [...(bookingSources || [])].sort((a, b) => {
    const priceA = a.rate_extracted || a.rate_per_night?.extracted_lowest || Infinity;
    const priceB = b.rate_extracted || b.rate_per_night?.extracted_lowest || Infinity;
    return priceA - priceB;
  });
  const cheapestSource = sortedSources[0];
  const cheapestPrice = cheapestSource?.rate_extracted || pricePerNight;
  const mostExpensive = sortedSources[sortedSources.length - 1]?.rate_extracted || cheapestPrice;
  const savings = mostExpensive - cheapestPrice;

  const scoreNumber = typeof combinedScore === 'number' ? combinedScore : parseInt(combinedScore) || 0;
  // Green: 80+, Amber: 60-79, Gray: <60
  const scoreClassColor = scoreNumber >= 80 ? 'text-[#10b981] border-[#10b981]/30 bg-[#10b981]/10' : scoreNumber >= 60 ? 'text-[#f59e0b] border-[#f59e0b]/30 bg-[#f59e0b]/10' : 'text-slate-400 border-slate-500/30 bg-slate-500/10';

  // Card wrapper style classes
  const entranceAnim = `animate-[fadeIn_0.3s_ease-out_forwards,slideUp_0.3s_ease-out_forwards] opacity-0`;
  const entranceStyle = { animationDelay: `${index * 80}ms` };

  return (
    <div 
      className={`hotel-card flex flex-col md:flex-row transition-all ${expanded || showPrices ? 'md:h-auto' : 'md:h-[330px]'} ${entranceAnim}`}
      style={entranceStyle}
      id={`hotel-card-${id}`}
    >
      {/* Image — LEFT */}
      <div className="md:w-[320px] md:min-w-[320px] h-52 md:h-auto self-stretch relative overflow-hidden flex-shrink-0 group flex flex-col min-h-[220px]">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-0 w-full h-full group/carousel">
          <img
            src={allImages[imageIndex]}
            alt={name}
            className="w-full h-full object-cover transition-opacity duration-300"
            loading="lazy"
            onError={(e) => { e.target.src = FALLBACK_IMG; }}
          />
          {allImages.length > 1 && (
            <>
              <button 
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-black/70 backdrop-blur-sm z-30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button 
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-black/70 backdrop-blur-sm z-30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}
        </div>
        
        {/* Top Badges Area */}
        <div className="absolute top-3 inset-x-3 flex justify-between items-start z-20">
          {/* Soul match badge */}
          {isSoulMatch ? (
            <div className="bg-gradient-to-br from-[#f59e0b] to-[#ef4444] rounded-lg px-2 py-1 flex items-center gap-1 shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              <span className="text-[#3b1509] text-[11px] font-bold">✦ Soul Match</span>
            </div>
          ) : <div />}
          
          {/* Deal badge */}
          {dealType === 'great' && (
            <div className="bg-[#10b981] rounded-lg px-2 py-1 flex items-center gap-1">
              <span className="text-white text-[11px] font-bold">🏷 {dealDescription || "Great Deal"}</span>
            </div>
          )}
          {dealType === 'good' && (
            <div className="bg-[#f59e0b] rounded-lg px-2 py-1 flex items-center gap-1">
              <span className="text-navy font-bold text-[11px]">🏷 {dealDescription || "Deal"}</span>
            </div>
          )}
        </div>

        {/* Bottom Badges Area */}
        <div className="absolute bottom-3 inset-x-3 flex justify-between items-end z-20">
          {/* Star rating (BOTTOM LEFT) */}
          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded px-2 py-1">
            <span className="text-amber text-[10px]">{'★'.repeat(typeof starRating === 'number' ? starRating : 4)}</span>
          </div>
          
          {/* Multiple photos counter (BOTTOM RIGHT) */}
          {allImages.length > 1 && (
            <div className="bg-black/50 backdrop-blur-sm rounded px-1.5 py-0.5 text-[10px] font-semibold text-white/80 transition-all">
              {imageIndex + 1}/{allImages.length}
            </div>
          )}
        </div>
      </div>

      {/* Content — RIGHT */}
      <div className="flex-1 p-[24px] min-w-0 flex flex-col justify-between h-full relative">
        {/* Match score */}
        <div className={`match-score-circle ${combinedScore >= 80 ? 'match-high' : combinedScore >= 60 ? 'match-mid' : 'match-low'}`}>
          {combinedScore}
          <div className="score-tooltip">
            <h4 className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-2.5 font-bold border-b border-[var(--bg-border)] pb-2 flex items-center gap-1">
              <svg className="w-3 h-3 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Match breakdown
            </h4>
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between items-center bg-[var(--bg-border)] rounded px-2 py-1">
                <span className="text-[var(--text-secondary)]">Budget fit</span>
                <span className="text-[var(--text-primary)] font-medium">{matchScore.budgetFit}/10</span>
              </div>
              <div className="flex justify-between items-center bg-[var(--bg-border)] rounded px-2 py-1">
                <span className="text-[var(--text-secondary)]">Trip type</span>
                <span className="text-[var(--text-primary)] font-medium">{matchScore.tripTypeMatch}/10</span>
              </div>
              <div className="flex justify-between items-center bg-[var(--bg-border)] rounded px-2 py-1">
                <span className="text-[var(--text-secondary)]">Review signal</span>
                <span className="text-[var(--text-primary)] font-medium">{matchScore.reviewSignal}/10</span>
              </div>
              <div className="flex justify-between items-center px-1 pt-1 mt-1 border-t border-[var(--bg-border)]">
                <span className="text-[var(--text-muted)]">Consensus</span>
                <span className="text-[var(--accent-primary)] font-bold">{matchScore.agentConsensus}</span>
              </div>
            </div>
            <div className="absolute -top-1.5 right-5 w-3 h-3 bg-[var(--bg-elevated)] border-t border-l border-[var(--bg-border-hover)] rotate-45" />
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-start pr-[52px]">
          {/* Top row: Name + Walkability */}
          <div className="mb-3">
            <h3 className="font-medium text-[20px] text-[var(--text-primary)] leading-tight mb-1" style={{ fontFamily: '"DM Serif Display", serif' }}>
              {name}
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-[var(--text-secondary)] text-[12px] font-normal truncate max-w-[200px]">
                {neighborhood}
              </p>
              {walkability > 0 && (
                <div className="flex items-center gap-1.5 ml-1 pl-2 border-l border-[var(--bg-border)]">
                  <div className="w-16 h-1.5 bg-[var(--bg-border)] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${walkability * 10}%` }} />
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider">{walkability}/10 Walk</span>
                </div>
              )}
            </div>
          </div>

          {/* Why it fits */}
          <p className="text-[var(--text-secondary)] text-[13px] leading-[1.6] mb-4">
            {whyItFits}
          </p>

          {/* Anti-rec block */}
          {antiRec && (
            <div className="anti-rec-block mb-3">
              <span className="text-[var(--accent-primary)] text-[10px] uppercase tracking-[0.05em] font-bold flex items-center gap-1.5 mb-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                ⚠ MIGHT NOT LOVE
              </span>
              <p className="text-[var(--text-secondary)] text-[12px] pl-[18px]">{antiRec}</p>
            </div>
          )}

          {/* Loyalty Line (if points logic added) */}
          {item.loyalty_math && (
            <div className="flex items-start gap-2 bg-[rgba(245,158,11,0.05)] rounded-md py-1.5 px-3 mb-2">
              <span className="text-[var(--accent-primary)] mt-0.5"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></span>
              <p className="text-[var(--accent-primary)] text-[11px] font-medium leading-snug">{item.loyalty_math}</p>
            </div>
          )}


          {/* Price line */}
          <div className="mt-auto pt-4 border-t border-[var(--bg-border)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-primary)] font-semibold text-[22px] tracking-tight">
                  {priceDisplay || formatINR(pricePerNight)}
                </span>
                <span className="text-[var(--text-muted)] text-[13px] uppercase tracking-wider font-medium">/night</span>
              </div>
              {/* Compare toggle button */}
              {sortedSources.length > 0 ? (
                <button
                  onClick={() => setShowPrices(!showPrices)}
                  className="bg-[var(--bg-surface)] hover:bg-[var(--bg-border-hover)] border border-[var(--bg-border)] text-[var(--text-primary)] text-[12px] font-medium px-4 py-2 rounded-lg transition-all flex items-center gap-1.5"
                >
                  <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${showPrices ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Compare {sortedSources.length} sites
                  {savings > 0 && <span className="text-[var(--score-high)] ml-0.5 opacity-90">(-{formatINR(savings)})</span>}
                </button>
              ) : (
                <a 
                  href={bookingSources?.[0]?.link || officialLink || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-[var(--accent-primary)] hover:bg-[#F59E0B] text-[#fff] text-[13px] font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 shadow-[0_4px_12px_rgba(245,158,11,0.2)] hover:shadow-[0_4px_20px_rgba(245,158,11,0.4)] transform hover:-translate-y-[1px]"
                >
                  View Best Prices
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              )}
            </div>
            
            {/* Expanded price comparison panel */}
            {showPrices && sortedSources.length > 0 && (
              <div className="mt-3 space-y-1.5 animate-[fadeIn_0.2s_ease] border-t border-[var(--bg-border)] pt-3">
                {sortedSources.map((src, i) => {
                  const isCheapest = i === 0 && sortedSources.length > 1;
                  const srcPrice = src.rate_extracted || src.rate_per_night?.extracted_lowest || 0;
                  const srcDisplay = src.rate_per_night || '';
                  const srcLink = src.link || '';
                  const srcName = src.source || 'Book';

                  return (
                    <a
                      key={`${srcName}-${i}`}
                      href={srcLink || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border transition-all duration-200 cursor-pointer group hover:bg-[var(--bg-border)] bg-[var(--bg-elevated)] ${isCheapest ? 'border-[var(--score-high)] border-opacity-30' : 'border-transparent'}`}
                    >
                      <div className="flex items-center gap-2">
                        {src.logo ? (
                           <img src={src.logo} alt={srcName} className="w-4 h-4 rounded object-contain mix-blend-screen opacity-90" onError={(e) => e.target.style.display='none'} />
                        ) : <div className="w-4 h-4" />}
                        <span className="text-[var(--text-secondary)] text-[13px] group-hover:text-[var(--text-primary)] transition-colors">{srcName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isCheapest && <span className="text-[9px] bg-[rgba(16,185,129,0.1)] text-[var(--score-high)] border border-[var(--score-high)] border-opacity-20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Best value</span>}
                        <span className={`font-medium text-[13px] ${isCheapest ? 'text-[var(--score-high)]' : 'text-[var(--text-primary)]'}`}>{typeof srcDisplay === 'string' ? srcDisplay : formatINR(srcPrice)}</span>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Details Expansion Toggle */}
        <div className="mt-3 pt-3 border-t border-white/5">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[12px] text-muted/50 hover:text-white transition-colors flex items-center gap-1 w-full justify-center group"
          >
            {expanded ? 'Hide details' : 'More details'}
            <svg className={`w-3.5 h-3.5 transition-transform duration-200 group-hover:text-amber ${expanded ? 'rotate-180 text-amber' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expanded && (
            <div className="mt-4 pb-2 space-y-4 animate-[fadeIn_0.2s_ease-out]">
              {/* Tags/Amenities */}
              {tags.length > 0 && (
                <div>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map(tag => (
                      <span key={tag} className="text-[11px] px-2 py-0.5 rounded border border-white/10 text-white/60 bg-white/5">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Reviews */}
              {reviewHighlights.length > 0 && (
                <div>
                  <span className="text-[#94a3b8] text-[10px] uppercase tracking-wider font-semibold block mb-1.5">Review Highlights</span>
                  <div className="flex flex-wrap gap-1.5">
                    {reviewHighlights.slice(0, 3).map((rh, i) => (
                      <span key={i} className={`text-[11px] px-2 py-0.5 rounded border ${rh.sentiment === 'positive' ? 'border-[#10b981]/20 text-[#10b981] bg-[#10b981]/10' : 'border-[#f59e0b]/20 text-[#f59e0b] bg-[#f59e0b]/10'}`}>
                        {rh.sentiment === 'positive' ? '👍' : '➖'} {rh.aspect} ({rh.mentions})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Context */}
              <div className="text-[12px] text-[#94a3b8] leading-relaxed">
                {nc.walkability > 0 && <span>Walkability {nc.walkability}/10. </span>}
                {description}
                {checkInTime && <span className="block mt-1">Check-in: {checkInTime} · Check-out: {checkOutTime}</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
