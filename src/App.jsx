import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { loadSessionDNA, saveSessionDNA, updateTrustScore } from './data/session';
import { runAgentPipeline, checkBackend } from './engine/orchestrator';
import { rerank } from './api/client';
import HotelCard from './components/HotelCard';
import TracePanel from './components/TracePanel';

// ── Thinking stage labels ──
const AGENT_STAGES = [
  { id: 'optimizer', label: 'Optimizer', color: 'border-blue-500 text-blue-400', varColor: 'var(--accent-blue)', bg: 'bg-blue-500/10' },
  { id: 'advocate', label: "Devil's Advocate", color: 'border-red-500 text-red-500', varColor: 'var(--accent-red)', bg: 'bg-red-500/10' },
  { id: 'empathy', label: 'Empathy Agent', color: 'border-emerald-500 text-emerald-500', varColor: 'var(--accent-green)', bg: 'bg-emerald-500/10' },
  { id: 'synthesis', label: 'Synthesis', color: 'border-purple-500 text-purple-500', varColor: 'var(--accent-purple)', bg: 'bg-purple-500/10' },
];

const THINKING_MESSAGES = [
  'Scoring hotels against your preferences...',
  "Devil's Advocate challenging top picks...",
  'Empathy Agent finding your soul match...',
  'Synthesising final shortlist...',
];

const QUICK_CHIPS = [
  'Weekend city break',
  'Beach holiday',
  'Business trip',
  'Family vacation',
];

function App() {
  const [sessionDNA, setSessionDNA] = useState(loadSessionDNA);
  const [appState, setAppState] = useState('intake'); // intake | thinking | results
  const [results, setResults] = useState([]);
  const [trace, setTrace] = useState(null);
  const [evalResult, setEvalResult] = useState(null);
  const [intent, setIntent] = useState(null);
  const [showTrace, setShowTrace] = useState(false);
  const [thinkingStage, setThinkingStage] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [refineValue, setRefineValue] = useState('');
  const [rerankBanner, setRerankBanner] = useState(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const inputRef = useRef(null);
  const refineRef = useRef(null);
  const [findingText, setFindingText] = useState('');
  const [constitutionAlert, setConstitutionAlert] = useState(null);
  const [editingDest, setEditingDest] = useState(false);
  const [tempDest, setTempDest] = useState('');
  const [editingBudget, setEditingBudget] = useState(false);
  const [tempBudgetMax, setTempBudgetMax] = useState(30000);
  const [thinkingMsg, setThinkingMsg] = useState(THINKING_MESSAGES[0]);
  const thinkingTimer = useRef(null);
  
  // Sort & Filter state
  const [sortOption, setSortOption] = useState('match');
  const [filters, setFilters] = useState({
    fiveStar: false,
    eco: false,
    noHiddenFees: false,
    soulMatch: false,
  });
  const [searchError, setSearchError] = useState(null);

  // Persist DNA
  useEffect(() => { saveSessionDNA(sessionDNA); }, [sessionDNA]);

  // Check backend on mount
  useEffect(() => {
    checkBackend().then(s => console.log('[TripSense] Backend:', s));
  }, []);

  // ── FILTERING & SORTING ──
  const filteredAndSortedResults = useMemo(() => {
    if (!results || !results.length) return [];
    let final = [...results];
    
    // Filters
    if (filters.fiveStar) {
      final = final.filter(r => {
        const item = r.hotel || r;
        return (item.starRating || item.star_rating || 0) >= 5;
      });
    }
    if (filters.eco) {
      final = final.filter(r => {
        const item = r.hotel || r;
        return item.ecoCertified || item.eco_certified;
      });
    }
    if (filters.noHiddenFees) {
      final = final.filter(r => {
        const item = r.hotel || r;
        const fees = item.hiddenFees || item.hidden_fees || {};
        return !(fees.resortFee > 0);
      });
    }
    if (filters.soulMatch) {
      final = final.filter(r => {
        const item = r.hotel || r;
        return item.is_soul_match || item.isSoulMatch;
      });
    }
    
    // Sort
    if (sortOption === 'price_asc' || sortOption === 'price_desc') {
      final.sort((a, b) => {
        const itemA = a.hotel || a;
        const itemB = b.hotel || b;
        const pA = itemA.pricePerNight || itemA.price_per_night || Infinity;
        const pB = itemB.pricePerNight || itemB.price_per_night || Infinity;
        return sortOption === 'price_asc' ? pA - pB : pB - pA;
      });
    } else if (sortOption === 'stars') {
      final.sort((a, b) => {
        const itemA = a.hotel || a;
        const itemB = b.hotel || b;
        const sA = itemA.starRating || itemA.star_rating || 0;
        const sB = itemB.starRating || itemB.star_rating || 0;
        return sB - sA;
      });
    }
    // 'match' leaves it default (respects combined score / rerank base)
    return final;
  }, [results, filters, sortOption]);

  // ── THINKING ANIMATION ──
  useEffect(() => {
    if (appState !== 'thinking') return;
    setThinkingStage(0);
    setThinkingMsg(THINKING_MESSAGES[0]);

    let stage = 0;
    thinkingTimer.current = setInterval(() => {
      stage++;
      if (stage < 4 && !constitutionAlert) {
        setThinkingStage(stage);
        setThinkingMsg(THINKING_MESSAGES[stage]);
      }
    }, 800);

    return () => clearInterval(thinkingTimer.current);
  }, [appState, constitutionAlert]);

  // ── SUBMIT SEARCH ──
  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) return;
    setAppState('thinking');
    setThinkingStage(0);
    setConstitutionAlert(null);

    try {
      const result = await runAgentPipeline(
        query, sessionDNA, false,
        (msg, agent) => {
          if (msg.step === 'constitutional_alert') {
            setConstitutionAlert(msg.content);
          }
          // Clear alert and update thinking stage based on agent
          if (agent === 'optimizer') {
            setConstitutionAlert(null);
            setThinkingStage(0);
          } else if (agent === 'advocate') setThinkingStage(1);
          else if (agent === 'empathy') setThinkingStage(2);
          else if (agent === 'synthesis') setThinkingStage(3);
        }
      );

      if (result.type === 'results' && result.data) {
        const { shortlist, intent: parsedIntent, eval: evalData, eval_passes, trace: traceData, elapsed_ms } = result.data;
        const mapped = (shortlist || []).map(item => ({
          hotel: { id: item.hotel_id, name: item.hotel_name, ...item },
          combinedScore: item.final_score,
          whyItFits: item.why_it_fits,
        }));

        if (mapped.length === 0) {
          setSearchError('The agents couldn\'t find any hotels matching your criteria. Try a different destination or broader budget.');
          setAppState('intake');
          return;
        }

        setSearchError(null);
        setResults(mapped);
        setTrace(traceData);
        setEvalResult({ ...evalData, eval_passes });
        setIntent(parsedIntent);
        setElapsedMs(elapsed_ms || 0);
        setSessionDNA(prev => updateTrustScore(prev, 'complete_search'));
        setAppState('results');
      } else if (result.type === 'clarify') {
        // Go back to intake for clarification
        setAppState('intake');
      } else if (result.type === 'error') {
        setSearchError(result.error || 'Something went wrong with the AI agents. Please try again.');
        setAppState('intake');
      } else {
        setSearchError('Unexpected response from agents. Please retry.');
        setAppState('intake');
      }
    } catch (e) {
      console.error('Agent error:', e);
      setSearchError(`Connection error: ${e.message}. Make sure the backend is running on port 8001.`);
      setAppState('intake');
    }
  }, [sessionDNA]);

  // ── REFINE / RE-RANK ──
  const handleRefine = useCallback(async (query) => {
    if (!query.trim()) return;
    setRerankBanner({ status: 'loading', message: 'Re-ranking · updating based on your refinement...' });

    try {
      const result = await runAgentPipeline(
        query, sessionDNA, true,
        () => {}
      );

      if (result.type === 'results' && result.data) {
        const { shortlist, intent: parsedIntent, eval: evalData, eval_passes, trace: traceData, elapsed_ms } = result.data;
        const mapped = (shortlist || []).map(item => ({
          hotel: { id: item.hotel_id, name: item.hotel_name, ...item },
          combinedScore: item.final_score,
          whyItFits: item.why_it_fits,
        }));

        setResults(mapped);
        setTrace(traceData);
        setEvalResult({ ...evalData, eval_passes });
        setIntent(parsedIntent);
        setElapsedMs(elapsed_ms || 0);

        setRerankBanner({
          status: 'done',
          message: `Re-ranked · Updated shortlist based on "${query.slice(0, 40)}"`,
        });

        setTimeout(() => setRerankBanner(null), 4000);
      } else if (result.type === 'error') {
        setRerankBanner({
          status: 'error',
          message: `Re-ranking failed: ${result.error || 'Rate limit exceeded'}`,
        });
        setTimeout(() => setRerankBanner(null), 6000);
      } else {
        setRerankBanner(null);
      }
    } catch (e) {
      console.error('Refine error:', e);
      setRerankBanner({
        status: 'error',
        message: `Network error: failed to update.`,
      });
      setTimeout(() => setRerankBanner(null), 4000);
    }
    setRefineValue('');
  }, [sessionDNA]);

  // ── EXPLICIT RERANK FOR HEADER API ──
  const handleExplicitRerank = useCallback(async (newIntentFields, bannerMessage) => {
    setRerankBanner({ status: 'loading', message: bannerMessage });
    try {
      const updatedIntent = { ...intent, ...newIntentFields };
      // hit direct rerank API
      const resultObj = await rerank(updatedIntent, sessionDNA, false, null, updatedIntent.trip_type);

      if (resultObj) {
        const { shortlist, intent: parsedIntent, eval: evalData, eval_passes, trace: traceData, elapsed_ms } = resultObj;
        const mapped = (shortlist || []).map(item => ({
          hotel: { id: item.hotel_id, name: item.hotel_name, ...item },
          combinedScore: item.final_score,
          whyItFits: item.why_it_fits,
        }));
        
        if (mapped.length > 0) {
          setResults(mapped);
          setTrace(traceData);
          setEvalResult({ ...evalData, eval_passes });
          setIntent(parsedIntent);
          setElapsedMs(elapsed_ms || 0);
          setRerankBanner({ status: 'done', message: `Filtered by ${bannerMessage}` });
          setTimeout(() => setRerankBanner(null), 4000);
          return;
        }
      }
      setRerankBanner({ status: 'error', message: 'Failed to find hotels matching criteria.'});
      setTimeout(() => setRerankBanner(null), 4000);
    } catch(e) {
      console.error(e);
      setRerankBanner({ status: 'error', message: `Re-ranking failed: API Rate limit exceeded. Try again.`});
      setTimeout(() => setRerankBanner(null), 6000);
    }
  }, [intent, sessionDNA]);

  // ── Trip type dropdown ──
  const [showTripDropdown, setShowTripDropdown] = useState(false);
  const tripTypes = ['leisure', 'business', 'romantic', 'solo', 'family'];

  const handleTripTypeChange = (type) => {
    setShowTripDropdown(false);
    setSessionDNA(prev => ({ ...prev, tripType: type }));
    // Trigger re-rank
    handleExplicitRerank({ trip_type: type }, `${type} trip match`);
  };

  const safeEval = (score) => {
    if (score === null || score === undefined || isNaN(score) || !isFinite(score)) return null;
    return Math.round(score * 100);
  };
  const evalValue = safeEval(evalResult?.overallScore || evalResult?.overall);
  const evalText = evalValue !== null ? `${evalValue}%` : null;

  // ════════════════════════════════════════════
  // STATE A — INTAKE SCREEN
  // ════════════════════════════════════════════
  if (appState === 'intake') {
    return (
      <div className="intake-screen">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <span className="text-white text-[28px] tracking-[-0.02em] font-light" style={{ textShadow: '0 0 40px rgba(245,158,11,0.3)' }}>
            Trip<span className="font-semibold">Sense</span>
          </span>
        </div>

        {/* Tagline */}
        <p className="text-muted text-[15px] tracking-[0.01em] font-normal mb-8">
          Discover your perfect hotel — honestly.
        </p>

        {/* Error Banner */}
        {searchError && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 max-w-md animate-[fadeIn_0.3s_ease]">
            <div className="flex items-start gap-2">
              <span className="text-red-400 text-sm mt-0.5">⚠</span>
              <div>
                <p className="text-red-300 text-sm font-medium mb-1">Something went wrong</p>
                <p className="text-red-300/70 text-[12px] leading-relaxed">{searchError}</p>
              </div>
              <button onClick={() => setSearchError(null)} className="text-red-400/50 hover:text-red-300 ml-auto text-sm transition-colors">✕</button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="intake-input-wrap">
          <form onSubmit={(e) => { e.preventDefault(); handleSearch(inputValue); }}>
            <input
              ref={inputRef}
              className="intake-input"
              placeholder="Tell me about your ideal stay..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoFocus
            />
            <button type="submit" className="intake-submit" disabled={!inputValue.trim()}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>
        </div>

        {/* Quick chips */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {QUICK_CHIPS.map(chip => (
            <button
              key={chip}
              className="chip"
              onClick={() => { setInputValue(chip); handleSearch(chip); }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Footer */}
        <p className="fixed bottom-6 w-full text-center text-muted text-[12px]">
          Three agents debate every recommendation <span className="mx-1 opacity-50">·</span> Anti-recs are mandatory <span className="mx-1 opacity-50">·</span> AI transparent
        </p>
      </div>
    );
  }

  // ════════════════════════════════════════════
  // STATE B — THINKING SCREEN
  // ════════════════════════════════════════════
  if (appState === 'thinking') {
    return (
      <div className="thinking-screen">
        <p className="text-muted text-[11px] uppercase tracking-[0.1em] font-medium mb-12">
          Analysing your search
        </p>

        {/* Agent pipeline viz */}
        <div className="flex items-center gap-0 mb-16">
          {AGENT_STAGES.map((stage, i) => {
            const isActive = thinkingStage === i;
            const isDone = thinkingStage > i;
            const isPending = thinkingStage < i;

            // Compute dynamic styles
            // The hex colors don't support opacity easily without parsing, so we use the CSS var for color,
            // but for border/background opacity tricks, tailwind classes or specific hex manipulation is hard.
            // Wait, we can use color-mix if we rely on native CSS, or since the spec gives `--accent-blue`, 
            // we'll just apply standard classes and inline styles with exact hexes mapped manually, 
            // but the CSS already defines solid colors. Let's build a style object:
            let nodeStyle = {};
            if (isActive) {
              nodeStyle = {
                borderColor: stage.varColor,
                backgroundColor: `color-mix(in srgb, ${stage.varColor} 8%, transparent)`,
                boxShadow: `0 0 0 1px color-mix(in srgb, ${stage.varColor} 20%, transparent), 0 0 20px color-mix(in srgb, ${stage.varColor} 25%, transparent), 0 0 40px color-mix(in srgb, ${stage.varColor} 10%, transparent)`,
                animation: 'pulseNode 1.5s ease-in-out infinite'
              };
            } else if (isDone) {
              nodeStyle = {
                borderColor: `color-mix(in srgb, ${stage.varColor} 40%, transparent)`,
                backgroundColor: `color-mix(in srgb, ${stage.varColor} 12%, transparent)`,
                boxShadow: `0 0 15px color-mix(in srgb, ${stage.varColor} 15%, transparent)`
              };
            } else {
              nodeStyle = {
                borderColor: 'rgba(255,255,255,0.06)',
                backgroundColor: 'transparent'
              };
            }

            return (
              <div key={stage.id} className="flex items-center">
                {i > 0 && (
                  <div className={`connector-line-wrap ${isDone || isActive ? 'active' : ''}`}>
                    <div 
                      className="connector-line-fill" 
                      style={{ background: `linear-gradient(90deg, ${AGENT_STAGES[i-1].varColor} 0%, ${stage.varColor} 100%)` }}
                    />
                  </div>
                )}
                <div className="agent-node">
                  <div 
                    className={`node-circle border`} 
                    style={nodeStyle}
                  >
                    {isDone ? (
                      <svg className="w-6 h-6" style={{ color: stage.varColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <span style={{ color: isActive ? stage.varColor : 'var(--text-muted)' }}>{i + 1}</span>
                    )}
                  </div>
                  <span 
                    className="absolute top-[84px] text-[12px] font-medium whitespace-nowrap"
                    style={{ color: isActive ? stage.varColor : 'var(--text-muted)', opacity: isPending ? 0.4 : 1 }}
                  >
                    {stage.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Status text or Constitutional Alert */}
        {constitutionAlert ? (
          <div className="mt-8 bg-red-500/10 border border-red-500/30 p-4 rounded-xl animate-fade-in text-left max-w-sm mx-auto">
            <span className="text-red-400 font-semibold mb-1 block text-sm">⚠ Constitutional check</span>
            <p className="text-red-300/80 text-sm whitespace-pre-wrap">{constitutionAlert.replace('⚠ Constitutional check\n', '').replace(/^"|"$/g, '')}</p>
          </div>
        ) : (
          <p className="text-secondary text-[14px] animate-[fadeIn_0.3s_ease] transition-all" key={thinkingMsg}>
            {thinkingMsg}
          </p>
        )}

        {/* Subtle dots animation */}
        <div className="flex gap-1.5 mt-5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-[5px] h-[5px] rounded-full"
              style={{
                backgroundColor: AGENT_STAGES[Math.min(thinkingStage, AGENT_STAGES.length - 1)].varColor,
                animation: 'bounceDot 1.2s ease-in-out infinite',
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
        <style>{`
          @keyframes bounceDot {
            0%, 100% { transform: translateY(0); opacity: 0.4; }
            50% { transform: translateY(-4px); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // ════════════════════════════════════════════
  // STATE C — RESULTS SCREEN
  // ════════════════════════════════════════════
  const displayTripType = intent?.trip_type || sessionDNA.tripType || 'leisure';
  const displayBudget = `₹${(intent?.budget_min || 8000).toLocaleString('en-IN')}–₹${(intent?.budget_max || 30000).toLocaleString('en-IN')}`;
  const displayDest = intent?.destination || sessionDNA.destination || 'New York';

  return (
    <div className="results-screen">
      {/* Top bar */}
      <div className="results-topbar">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2 mr-4">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <svg className="w-3 h-3 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <span className="text-warm font-semibold text-sm">TripSense</span>
          </div>

          {/* Interactive Pills */}
          <div className="flex items-center gap-2 ml-4">
            {/* Trip Type */}
            <div className="relative group">
              <button
                className="flex items-center gap-2 px-3 py-1 bg-[length:200%] text-[12px] text-secondary border border-[var(--bg-border)] bg-[var(--bg-surface)] hover:border-[var(--bg-border-hover)] rounded-full cursor-pointer transition-all capitalize"
                onClick={() => setShowTripDropdown(!showTripDropdown)}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--score-mid)]" />
                {displayTripType}
              </button>
              {showTripDropdown && (
                <div className="absolute top-full left-0 mt-2 w-36 bg-[var(--bg-elevated)] border border-[var(--bg-border)] rounded-xl shadow-2xl z-50 overflow-hidden">
                  {tripTypes.map(t => (
                    <button
                      key={t}
                      className="w-full text-left px-4 py-2.5 text-[12px] text-muted-light hover:text-white hover:bg-[var(--bg-border)] capitalize flex items-center gap-2"
                      onClick={() => {
                        handleTripTypeChange(t);
                        setShowTripDropdown(false);
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Destination */}
            <div className="relative group">
              {editingDest ? (
                <div className="flex items-center bg-[var(--bg-surface)] border border-[var(--accent-blue)] rounded-full pl-3 pr-1 h-[26px] overflow-hidden transition-all shadow-[0_0_10px_rgba(59,130,246,0.15)]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)] mr-1.5" />
                  <input
                    type="text"
                    autoFocus
                    className="bg-transparent text-[12px] text-white outline-none w-28 placeholder:text-muted/30 font-medium"
                    value={tempDest || ''}
                    onChange={e => setTempDest(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        setEditingDest(false);
                        if (tempDest !== displayDest) handleExplicitRerank({ destination: tempDest }, 'destination match');
                      } else if (e.key === 'Escape') setEditingDest(false);
                    }}
                    onBlur={() => { setEditingDest(false); if (tempDest !== displayDest && tempDest.trim() !== '') handleExplicitRerank({ destination: tempDest }, 'destination match'); }}
                  />
                </div>
              ) : (
                <button
                  className="flex items-center gap-2 px-3 py-1 text-[12px] text-secondary border border-[var(--bg-border)] bg-[var(--bg-surface)] hover:border-[var(--bg-border-hover)] rounded-full cursor-pointer transition-all"
                  onClick={() => { setTempDest(displayDest); setEditingDest(true); }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)]" />
                  {displayDest}
                </button>
              )}
            </div>

            {/* Budget */}
            <div className="relative group">
              {editingBudget ? (
                <div className="flex items-center gap-2 bg-[var(--bg-surface)] border border-[var(--accent-green)] rounded-full pl-3 pr-1 h-[26px] transition-all shadow-[0_0_10px_rgba(16,185,129,0.15)] flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)]" />
                  <input
                    type="range"
                    min="5000" max="100000" step="1000"
                    className="w-24 accent-[var(--accent-green)] outline-none"
                    value={tempBudgetMax || 30000}
                    onChange={e => setTempBudgetMax(e.target.value)}
                    onMouseUp={() => {
                        setEditingBudget(false);
                        if (tempBudgetMax != intent?.budget_max) handleExplicitRerank({ budget_max: parseInt(tempBudgetMax) }, `budget up to ₹${tempBudgetMax}`);
                    }}
                    onTouchEnd={() => {
                        setEditingBudget(false);
                        if (tempBudgetMax != intent?.budget_max) handleExplicitRerank({ budget_max: parseInt(tempBudgetMax) }, `budget up to ₹${tempBudgetMax}`);
                    }}
                  />
                  <span className="text-[11px] text-[var(--text-secondary)] font-medium w-12 text-right">₹{Number(tempBudgetMax || 30000).toLocaleString('en-IN')}</span>
                  <button 
                    onClick={() => {
                      setEditingBudget(false);
                      if (tempBudgetMax != intent?.budget_max) handleExplicitRerank({ budget_max: parseInt(tempBudgetMax) }, `budget up to ₹${tempBudgetMax}`);
                    }}
                    className="ml-1 w-5 h-5 rounded-full bg-[var(--accent-green)] text-navy flex items-center justify-center hover:bg-[#34d399] transition-colors"
                  >
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                  </button>
                </div>
              ) : (
                 <button
                  className="flex items-center gap-2 px-3 py-1 text-[12px] text-secondary border border-[var(--bg-border)] bg-[var(--bg-surface)] hover:border-[var(--bg-border-hover)] rounded-full cursor-pointer transition-all"
                  onClick={() => { setTempBudgetMax(intent?.budget_max || 30000); setEditingBudget(true); }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)]" />
                  {displayBudget}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Eval badge */}
          {evalResult && evalValue !== null && evalValue > 0 && !isNaN(evalValue) && (
            <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[rgba(16,185,129,0.1)] border border-[var(--score-high)] border-opacity-20">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--score-high)]" />
              <span className="text-[10px] text-[var(--score-high)] font-medium">Eval {evalText}</span>
            </div>
          )}

          {/* Trace button */}
          {trace && (
            <button
              onClick={() => setShowTrace(true)}
              className="btn-ghost flex items-center gap-1.5 group overflow-hidden"
              style={{ paddingLeft: '8px', paddingRight: '8px' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="inline-block transition-all duration-300">
                <span className="group-hover:hidden">Trace</span>
                <span className="hidden group-hover:inline group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">Open Trace</span>
              </span>
            </button>
          )}

          {/* Edit (back to intake) */}
          <button
            onClick={() => { setAppState('intake'); setInputValue(''); }}
            className="btn-ghost flex items-center gap-1"
          >
            New search
          </button>
        </div>
      </div>

      {/* Results content */}
      <div className="results-content">
        {/* Header */}
        <div className="flex items-baseline justify-between mb-5 mt-2">
          <h2 className="text-warm text-lg font-semibold" style={{ fontFamily: '"DM Serif Display", serif' }}>
            Your Shortlist
          </h2>
          <p className="text-muted/30 text-xs">
            {filteredAndSortedResults.length} from {results.length} hotels · {(elapsedMs / 1000).toFixed(1)}s
          </p>
        </div>

        {/* Sort & Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <div className="flex items-center bg-navy-200/50 border border-white/5 rounded-lg p-1">
            {[['match', 'Best Match'], ['price_asc', 'Lowest Price'], ['stars', 'Highest Rated']].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setSortOption(val)}
                className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${sortOption === val ? 'bg-amber/10 text-amber' : 'text-muted hover:text-white hover:bg-white/5'}`}
              >
                {label}
              </button>
            ))}
          </div>
          
          <div className="w-px h-5 bg-white/10 mx-1 hidden sm:block"></div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'fiveStar', label: '5-Star Only', icon: '★' },
              { id: 'eco', label: 'Eco-Certified', icon: '🌿' },
              { id: 'noHiddenFees', label: 'No Resort Fees', icon: '💰' },
              { id: 'soulMatch', label: 'Soul Matches', icon: '✨' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilters(prev => ({ ...prev, [f.id]: !prev[f.id] }))}
                className={`px-2.5 py-1.5 text-[11px] border rounded-lg transition-all flex items-center gap-1.5 ${filters[f.id] ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-transparent border-white/5 text-muted hover:border-white/20 hover:text-white'}`}
              >
                <span>{f.icon}</span>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Re-rank banner */}
        {rerankBanner && (
          <div className={`rerank-banner mb-4 ${rerankBanner.status}`}>
            {rerankBanner.message}
          </div>
        )}

        {/* Hotel cards */}
        <div className="space-y-4 stagger-children">
          {filteredAndSortedResults.map((result, index) => (
            <HotelCard
              key={result.hotel?.hotel_id || result.hotel?.id || index}
              result={result}
              index={index}
              tripType={displayTripType}
            />
          ))}
        </div>

        {/* Bottom trust */}
        <div className="text-center pt-8 pb-4">
          <p className="text-muted/20 text-[10px]">
            Every card debated by 3 agents · Anti-rec mandatory · AI transparent ·{' '}
            <button onClick={() => setShowTrace(true)} className="text-amber/30 hover:text-amber/50 underline underline-offset-2 transition-colors">
              See full reasoning
            </button>
          </p>
        </div>
      </div>

      {/* Refine bar — fixed bottom */}
      <div className="refine-bar-wrapper">
        <div className="w-full max-w-[600px] relative mt-auto">
          <div className="flex justify-center gap-2 mb-3">
            {['More budget options', 'Quieter neighborhoods', 'Higher rated only'].map((chip, i) => (
              <button 
                key={chip}
                onClick={() => {
                  setRefineValue(chip);
                  handleRefine(chip);
                }}
                className="text-[12px] bg-[var(--bg-elevated)] hover:bg-[var(--bg-border-hover)] border border-[var(--bg-border)] hover:border-[rgba(245,158,11,0.3)] text-muted hover:text-white px-3 py-1.5 rounded-[12px] transition-all whitespace-nowrap animate-[fadeIn_0.5s_ease] backdrop-blur-md"
                style={{ animationDelay: `${i * 0.1}s`, animationFillMode: 'both' }}
              >
                {chip}
              </button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); handleRefine(refineValue); }} className="relative">
            <input
              ref={refineRef}
              className="refine-input"
              placeholder="Refine your search..."
              value={refineValue}
              onChange={(e) => setRefineValue(e.target.value)}
            />
            <button
              type="submit"
              disabled={!refineValue.trim()}
              className="absolute right-[18px] top-1/2 -translate-y-1/2 text-muted hover:text-amber transition-colors disabled:opacity-30"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* Trace side panel */}
      <TracePanel
        isOpen={showTrace}
        onClose={() => setShowTrace(false)}
        trace={trace}
        evalResult={evalResult}
      />
    </div>
  );
}

export default App;
