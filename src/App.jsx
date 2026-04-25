import { useState, useRef, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection';
import TickerBar from './components/TickerBar';
import HowItWorks from './components/HowItWorks';
import FeaturesBento from './components/FeaturesBento';
import DecisionInput from './components/DecisionInput';
import AgentDebate from './components/AgentDebate';
import ResultsSection from './components/ResultsSection';
import { ToastProvider } from './components/Toast';
import { runAgentPipeline, checkBackend } from './engine/orchestrator';
import useScrollReveal from './hooks/useScrollReveal';

export default function App() {
  const [phase, setPhase] = useState('idle'); // 'idle' | 'analyzing' | 'results'
  const [query, setQuery] = useState('');
  
  // Debate State
  const [trace, setTrace] = useState({});
  const [activeStage, setActiveStage] = useState(null);
  
  // Results State
  const [results, setResults] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);

  // Auto-scroll anchor
  const debateRef = useRef(null);
  const resultsRef = useRef(null);

  // Activate scroll reveal animations whenever phase changes
  useScrollReveal(phase);

  useEffect(() => {
    // Check backend health silently on load
    checkBackend().catch(err => console.warn("Backend not ready:", err));
  }, []);

  const handleNewDecision = () => {
    setPhase('idle');
    setQuery('');
    setTrace({});
    setActiveStage(null);
    setResults(null);
    setError(null);
    // Clear any hash from the URL so it feels like a fresh page
    window.history.pushState("", document.title, window.location.pathname + window.location.search);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDecisionSubmit = async (userQuery, selectedDomain, sliders) => {
    setPhase('analyzing');
    setQuery(userQuery);
    setTrace({});
    setActiveStage('optimizer');
    setResults(null);
    setError(null);
    setSessionId(crypto.randomUUID());

    // Scroll to debate area
    setTimeout(() => {
      debateRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    try {
      const domain = selectedDomain || 'general';

      const sessionDNA = {
        id: crypto.randomUUID(),
        weights: sliders,
        history: []
      };

      const result = await runAgentPipeline(
        domain,
        userQuery,
        sessionDNA,
        false,
        {},
        (step) => {
          if (step.kind === 'stage') {
            setActiveStage(step.stage);
            setTrace(step.trace);
          } else if (step.kind === 'error') {
            setError(step.error);
            setPhase('idle');
          }
        }
      );

      setResults(result.results);
      setTrace(result.trace);
      setPhase('results');
      
      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 500);

    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred during analysis.");
      setPhase('idle');
    }
  };

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar phase={phase} onNewDecision={handleNewDecision} />

        <main className="flex-1">
          {/* Landing Page Flow */}
          {phase === 'idle' && (
            <div className="page-enter">
              <HeroSection onSubmit={handleDecisionSubmit} />
              <TickerBar />
              <HowItWorks />
              <FeaturesBento />
            </div>
          )}

          {/* Analyzing / Debate Flow */}
          {phase === 'analyzing' && (
            <div ref={debateRef} className="page-enter">
              <AgentDebate 
                query={query} 
                trace={trace} 
                activeStage={activeStage} 
              />
            </div>
          )}

          {/* Results Flow */}
          {phase === 'results' && (
            <div ref={resultsRef} className="page-enter">
              {/* Re-query bar */}
              <div className="bg-[rgba(255,255,255,0.02)] border-b border-[rgba(255,255,255,0.05)] pt-24 pb-5">
                <div className="max-w-3xl mx-auto px-6">
                  <DecisionInput onSubmit={handleDecisionSubmit} isLoading={false} compact={true} />
                </div>
              </div>
              <ResultsSection 
                results={results} 
                trace={trace} 
                sessionId={sessionId} 
              />
            </div>
          )}
        </main>

        <Footer />

        {/* Error Toast */}
        {error && (
          <div className="toast toast-error">
            <div className="flex items-center gap-3">
              <span>Analysis failed: {error}</span>
              <button 
                onClick={() => setError(null)}
                className="ml-2 opacity-70 hover:opacity-100 text-xs uppercase tracking-wider font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    </ToastProvider>
  );
}