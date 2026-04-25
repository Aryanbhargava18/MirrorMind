import { useEffect, useState } from 'react';
import AgentCard from './AgentCard';
import { Loader2 } from 'lucide-react';

export default function AgentDebate({ query, trace, activeStage }) {
  const [confidence, setConfidence] = useState(0);

  // Derive which agents are complete based on trace data
  const isComplete = (stage) => !!trace?.[stage];
  
  // Progress calculation via pure CSS transition mapped to stage
  useEffect(() => {
    if (activeStage === 'optimizer') setConfidence(25);
    else if (activeStage === 'advocate') setConfidence(50);
    else if (activeStage === 'personalizer') setConfidence(75);
    else if (activeStage === 'synthesis') setConfidence(95);
    if (isComplete('synthesis')) setConfidence(100);
  }, [activeStage, trace]);

  // Handle data extraction for cards
  const extractData = (stage) => {
    if (!trace?.[stage]) return null;
    const t = trace[stage];
    
    switch(stage) {
      case 'optimizer': return t.claims || t.values || t;
      case 'advocate': return t.biases || t.findings || t;
      case 'personalizer': return t.defense || t.merits || t;
      case 'synthesis': return t.pattern_name || t.explanation || t;
      default: return t;
    }
  };

  return (
    <section className="min-h-screen py-32 relative flex flex-col bg-[#06060E]">
      <div className="max-w-[1200px] mx-auto px-6 w-full flex-1 flex flex-col">
        
        {/* Header */}
        <div className="mb-12 text-center scroll-hide scroll-show">
          <p className="text-[#C9A227] font-sans font-medium mb-4 uppercase tracking-wider text-xs">Active Decision Trace</p>
          <h2 className="text-4xl md:text-5xl font-display text-[#F0EDE6] font-light">
            "{query}"
          </h2>
        </div>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 mb-10">
          <AgentCard 
            role="optimizer" 
            isActive={activeStage === 'optimizer'} 
            isComplete={isComplete('optimizer')} 
            data={extractData('optimizer')} 
          />
          <AgentCard 
            role="advocate" 
            isActive={activeStage === 'advocate'} 
            isComplete={isComplete('advocate')} 
            data={extractData('advocate')} 
          />
          <AgentCard 
            role="personalizer" 
            isActive={activeStage === 'personalizer'} 
            isComplete={isComplete('personalizer')} 
            data={extractData('personalizer')} 
          />
          <AgentCard 
            role="synthesis" 
            isActive={activeStage === 'synthesis'} 
            isComplete={isComplete('synthesis')} 
            data={extractData('synthesis')} 
          />
        </div>

        {/* Confidence Progress Bar */}
        <div className="w-full mb-6">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-sans text-[var(--text-secondary)]">Agent confidence</span>
            <span className="font-display text-xl text-[#C9A227]">{confidence}%</span>
          </div>
          <div className="h-1 w-full bg-[rgba(255,255,255,0.08)] overflow-hidden rounded-full">
            <div 
              className="h-full transition-all duration-[2000ms] ease-[cubic-bezier(0.23,1,0.32,1)]"
              style={{ 
                width: `${confidence}%`, 
                background: 'linear-gradient(90deg, #3B82F6, #C9A227)'
              }}
            />
          </div>
        </div>

        {/* Karpathy Loop Indicator */}
        <div className={`flex justify-center transition-opacity duration-500 ${isComplete('synthesis') ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)] text-xs text-[#8B5CF6] font-sans">
            <span className="inline-block animate-[spin_1.5s_linear_infinite]">↺</span>
            <span>Iteration 2 — refining</span>
          </div>
        </div>

      </div>
    </section>
  );
}
