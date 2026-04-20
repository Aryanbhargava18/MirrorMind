import { useState, useRef } from 'react';

const ALL_TAGS = [
  'luxury', 'budget', 'quiet', 'social', 'walkable', 'design-hotel',
  'foodie', 'rooftop', 'spa', 'eco', 'romantic', 'nightlife',
  'historic', 'family-friendly', 'solo-friendly', 'unique-rooms',
];

const TRIP_TYPES = [
  { id: 'leisure', label: 'Leisure', icon: '🌴' },
  { id: 'business', label: 'Business', icon: '💼' },
  { id: 'romantic', label: 'Romantic', icon: '💕' },
  { id: 'solo', label: 'Solo', icon: '🎒' },
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧' },
];

export default function SearchBar({ 
  onSearch, sessionDNA, onTagToggle, onTripTypeChange, 
  onBudgetChange, intent, isSearching, compact = false
}) {
  const [showFilters, setShowFilters] = useState(!compact);

  const activeTags = sessionDNA.activeTags || [];
  const budgetRange = sessionDNA.budgetRange || [100, 600];

  if (compact) {
    return (
      <div className="space-y-3">
        {/* Trip Type Row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-muted/40 uppercase tracking-wider font-medium">Trip</span>
          {TRIP_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => onTripTypeChange(type.id)}
              className={`px-2.5 py-1 rounded-pill text-[11px] flex items-center gap-1 transition-all ${
                sessionDNA.tripType === type.id 
                  ? 'bg-warm text-navy font-medium' 
                  : 'text-muted/50 hover:text-warm/70'
              }`}
              id={`trip-type-${type.id}`}
            >
              <span className="text-[10px]">{type.icon}</span>
              <span>{type.label}</span>
            </button>
          ))}
          <div className="ml-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-[10px] text-muted/40 hover:text-muted/60 transition-colors flex items-center gap-1"
            >
              <svg className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Filters {activeTags.length > 0 && `(${activeTags.length})`}
            </button>
          </div>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="space-y-3 animate-slide-up">
            {/* Budget */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-muted/40 uppercase tracking-wider font-medium w-14">Budget</span>
              <span className="text-xs text-warm/50">${budgetRange[0]}</span>
              <input
                type="range"
                min={50} max={500} step={25}
                value={budgetRange[0]}
                onChange={(e) => onBudgetChange([parseInt(e.target.value), budgetRange[1]])}
                className="flex-1 accent-amber h-0.5 bg-white/5 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <input
                type="range"
                min={100} max={1500} step={50}
                value={budgetRange[1]}
                onChange={(e) => onBudgetChange([budgetRange[0], parseInt(e.target.value)])}
                className="flex-1 accent-amber h-0.5 bg-white/5 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <span className="text-xs text-warm/50">${budgetRange[1]}</span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {ALL_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => onTagToggle(tag)}
                  className={`px-2 py-0.5 rounded text-[10px] transition-all ${
                    activeTags.includes(tag) 
                      ? 'bg-warm text-navy font-medium' 
                      : 'bg-white/5 text-muted/40 hover:bg-white/10 hover:text-muted/60'
                  }`}
                  id={`tag-${tag}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full mode (not used in current layout but kept for compatibility)
  return (
    <div className="max-w-card mx-auto space-y-4">
      <div className="flex flex-wrap gap-2">
        {TRIP_TYPES.map(type => (
          <button
            key={type.id}
            onClick={() => onTripTypeChange(type.id)}
            className={`tag-pill flex items-center gap-1.5 ${
              sessionDNA.tripType === type.id ? 'tag-active' : 'tag-inactive'
            }`}
          >
            <span>{type.icon}</span>
            <span>{type.label}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {ALL_TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => onTagToggle(tag)}
            className={`tag-pill transition-all ${
              activeTags.includes(tag) ? 'tag-active' : 'tag-inactive'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
