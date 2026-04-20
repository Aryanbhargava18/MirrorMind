import { useState, useRef, useEffect } from 'react';

export default function Hero({ onSearch, sessionDNA }) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const suggestions = [
    'A quiet romantic weekend in Manhattan',
    'Solo adventure, walkable, under $300',
    'Design hotel with a rooftop bar',
    'Family-friendly with a pool in Brooklyn',
    'Luxury splurge for our anniversary',
  ];

  const [currentSuggestion, setCurrentSuggestion] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSuggestion(prev => (prev + 1) % suggestions.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    onSearch(suggestion);
  };

  return (
    <div className="min-h-[92vh] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-amber/3 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-amber/[0.02] to-transparent rounded-full" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <span className="text-warm font-semibold text-lg tracking-tight">TripSense</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-warm leading-[1.1] mb-6 animate-slide-up text-balance">
          Where should you{' '}
          <span className="text-gradient italic">actually</span>{' '}
          stay?
        </h1>

        <p className="text-muted text-lg md:text-xl mb-10 max-w-lg mx-auto animate-slide-up delay-100 opacity-0 text-balance">
          An AI that debates itself, checks its own blind spots, and tells you what you might{' '}
          <em className="text-warm/70 not-italic">not</em> love — so you can trust what it recommends.
        </p>

        {/* Search Input */}
        <form onSubmit={handleSubmit} className="animate-slide-up delay-200 opacity-0">
          <div className={`relative glass-dark transition-all duration-300 ${
            isFocused ? 'ring-1 ring-amber/30 shadow-lg shadow-amber/5' : ''
          }`}>
            <div className="flex items-center px-5">
              <svg className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${
                isFocused ? 'text-amber' : 'text-muted/50'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={suggestions[currentSuggestion]}
                className="input-search pl-4"
                id="hero-search-input"
                autoComplete="off"
              />
              {query && (
                <button
                  type="submit"
                  className="btn-primary whitespace-nowrap ml-2 text-sm"
                  id="hero-search-button"
                >
                  Find Hotels
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Suggestion Pills */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 animate-slide-up delay-300 opacity-0">
          <span className="text-muted/40 text-xs mr-1">Try:</span>
          {suggestions.slice(0, 3).map((suggestion, i) => (
            <button
              key={i}
              onClick={() => handleSuggestionClick(suggestion)}
              className="tag-pill tag-inactive text-[11px] hover:border-amber/20 transition-all"
              id={`suggestion-${i}`}
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-12 flex items-center justify-center gap-8 text-xs text-muted/40 animate-fade-in delay-500 opacity-0">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Constitutional AI
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            3-Agent Debate
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Honest Anti-Recs
          </div>
        </div>

        {/* Loyalty preview */}
        {sessionDNA.pointBalance > 0 && (
          <div className="mt-8 animate-fade-in delay-500 opacity-0">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber/10 border border-amber/20">
              <span className="text-amber text-xs font-medium">
                ✦ {sessionDNA.pointBalance.toLocaleString()} points available
              </span>
              <span className="text-muted/50 text-xs">·</span>
              <span className="text-warm/50 text-xs">
                {sessionDNA.loyaltyTier} tier
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
