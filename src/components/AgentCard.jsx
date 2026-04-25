import { Search, ShieldAlert, Scale, CheckCircle2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

const AGENT_CONFIG = {
  optimizer: {
    name: 'The Mapper',
    title: 'Mapping your reasoning',
    icon: Search,
    colorHex: '#3B82F6', // Blue
    states: ['Reading...', 'Extracting claims...', 'Structure mapped']
  },
  advocate: {
    name: 'The Investigator',
    title: 'Finding your blind spots',
    icon: ShieldAlert,
    colorHex: '#EF4444', // Red
    states: ['Investigating...', 'Flagging gaps...', '3 patterns found']
  },
  personalizer: {
    name: 'The Advocate',
    title: 'Steelmanning your instinct',
    icon: Scale,
    colorHex: '#C9A227', // Gold
    states: ['Evaluating...', 'Building case...', 'Instinct defended']
  },
  synthesis: {
    name: 'The Synthesizer',
    title: 'Reading your pattern',
    icon: CheckCircle2,
    colorHex: '#8B5CF6', // Purple
    states: ['Synthesizing...', 'Pattern identified...', 'Mirror ready']
  }
};

// Helper for hex to rgba
const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function AgentCard({ role, isActive, isComplete, data }) {
  const config = AGENT_CONFIG[role];
  const Icon = config.icon;
  const scrollRef = useRef(null);
  const [statusIdx, setStatusIdx] = useState(0);

  useEffect(() => {
    if (isActive && !isComplete) {
      const interval = setInterval(() => {
        setStatusIdx(prev => (prev + 1) % (config.states.length - 1));
      }, 2000);
      return () => clearInterval(interval);
    } else if (isComplete) {
      setStatusIdx(config.states.length - 1);
    }
  }, [isActive, isComplete, config.states.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [data]);

  return (
    <div 
      className={`relative overflow-hidden flex flex-col p-6 rounded-xl min-h-[300px] transition-all duration-300`}
      style={{
        backgroundColor: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        ...(isActive ? {
          animation: 'pulseBorder 3s ease-in-out infinite alternate',
          '--pulse-color': hexToRgba(config.colorHex, 0.25)
        } : {}),
        opacity: (!isActive && !isComplete) ? 0.4 : 1
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[rgba(255,255,255,0.05)]">
        <div className="flex items-center gap-3">
          <div 
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: hexToRgba(config.colorHex, 0.15) }}
          >
            <Icon className="w-4 h-4" style={{ color: config.colorHex }} />
          </div>
          <div>
            <h3 className="font-sans font-medium text-sm text-[#F0EDE6]">
              {config.name}
            </h3>
          </div>
        </div>
        
        {/* Status Pill */}
        <div 
          className="px-3 py-1 rounded-full font-sans text-xs font-medium"
          style={{ 
            backgroundColor: hexToRgba(config.colorHex, 0.15),
            color: config.colorHex
          }}
        >
          {isComplete ? "Complete" : !isActive && !isComplete ? "Waiting" : config.states[statusIdx]}
        </div>
      </div>

      {/* Content Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar relative z-10 space-y-3 font-sans text-sm leading-relaxed text-[var(--text-secondary)]">
        {data && (
          <div className="space-y-3">
            {role === 'advocate' && Array.isArray(data) && data[0]?.bias ? (
              <div className="space-y-4">
                {data.map((item, i) => (
                  <div 
                    key={i} 
                    className="flex flex-col gap-1 animate-fade-in bg-[rgba(239,68,68,0.05)] p-3 rounded-lg border border-[rgba(239,68,68,0.1)]"
                    style={{ animationDelay: `${i * 300}ms`, animationFillMode: 'both' }}
                  >
                    <span className="text-[#F0EDE6] font-medium flex items-center gap-2">
                      <span className="text-[#EF4444]">⚠</span> {item.bias}
                    </span>
                    <span className="text-[var(--text-secondary)] italic">
                      "{item.evidence}"
                    </span>
                    <div className="mt-2 text-xs text-[var(--text-secondary)]">
                      <span className="opacity-60">Confidence:</span> <span className="text-[#EF4444]">{item.confidence}</span>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      <span className="opacity-60">What you're not asking:</span> <span className="text-[#F0EDE6]">{item.absent_question}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : Array.isArray(data) ? (
              <ul className="space-y-3">
                {data.map((item, i) => (
                  <li 
                    key={i} 
                    className="flex items-start gap-3 animate-fade-in"
                    style={{ animationDelay: `${i * 300}ms`, animationFillMode: 'both' }}
                  >
                    <span 
                      className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" 
                      style={{ backgroundColor: config.colorHex }} 
                    />
                    <span className="text-[var(--text-secondary)]">{typeof item === 'object' ? item.name || item.title || JSON.stringify(item) : item}</span>
                  </li>
                ))}
              </ul>
            ) : typeof data === 'object' ? (
              <div className="space-y-3">
                {Object.entries(data).slice(0, 5).map(([k, v], i) => (
                  <div 
                    key={i} 
                    className="flex flex-col animate-fade-in"
                    style={{ animationDelay: `${i * 300}ms`, animationFillMode: 'both' }}
                  >
                    <span className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)] opacity-70 mb-0.5">{k}</span>
                    <span className="text-[#F0EDE6]">{typeof v === 'object' ? JSON.stringify(v) : v}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="animate-fade-in">{data}</p>
            )}
            
            {isActive && (
              <span 
                className="inline-block w-2 h-4 ml-1 animate-pulse" 
                style={{ backgroundColor: config.colorHex }}
              />
            )}
          </div>
        )}
      </div>

      {/* Investigator subtitle if applicable */}
      {role === 'advocate' && (
        <p className="mt-6 text-xs italic text-[var(--text-secondary)] border-t border-[rgba(255,255,255,0.05)] pt-4">
          "I only flag what I can prove from your own words."
        </p>
      )}
    </div>
  );
}
