import { useState } from 'react';
import { Search, ShieldAlert, Scale, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export default function ReasoningTrace({ trace }) {
  const [expanded, setExpanded] = useState(false);

  const steps = [
    {
      id: 'optimizer',
      name: 'Mapper',
      icon: Search,
      color: '#3B82F6',
      bg: 'rgba(59,130,246,0.15)',
      data: trace?.optimizer
    },
    {
      id: 'advocate',
      name: 'Investigator',
      icon: ShieldAlert,
      color: '#EF4444',
      bg: 'rgba(239,68,68,0.15)',
      data: trace?.advocate
    },
    {
      id: 'personalizer',
      name: 'Advocate',
      icon: Scale,
      color: '#C9A227',
      bg: 'rgba(201,162,39,0.15)',
      data: trace?.personalizer
    },
    {
      id: 'synthesis',
      name: 'Synthesizer',
      icon: CheckCircle2,
      color: '#8B5CF6',
      bg: 'rgba(139,92,246,0.15)',
      data: trace?.synthesis
    }
  ];

  return (
    <div className="glass-panel p-6">
      <button 
        className="w-full flex justify-between items-center cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-lg text-left"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <div>
          <h3 className="font-display text-xl text-[#F0EDE6] mb-1">Full Agent Reasoning</h3>
          <p className="font-sans text-sm text-[var(--text-secondary)]">Full transparency. See exactly how we decided.</p>
        </div>
        <div className="p-2 rounded-full bg-[rgba(255,255,255,0.05)] group-hover:bg-[rgba(255,255,255,0.1)] transition-colors">
          {expanded ? <ChevronUp className="w-5 h-5 text-[#C9A227]" /> : <ChevronDown className="w-5 h-5 text-[#C9A227]" />}
        </div>
      </button>

      {/* Expanded Timeline */}
      <div className={`grid-accordion ${expanded ? 'expanded' : ''}`}>
        <div className="grid-accordion-content relative">
          <div className="mt-8 relative">
          {/* Vertical connecting line */}
          <div className="absolute left-6 top-6 bottom-6 w-[1px] bg-[rgba(255,255,255,0.08)]" />

          <div className="space-y-8 relative z-10">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex gap-6">
                  {/* Icon Node */}
                  <div 
                    className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center border-[4px] border-[#06060E]"
                    style={{ backgroundColor: step.bg }}
                  >
                    <Icon className="w-5 h-5" style={{ color: step.color }} />
                  </div>
                  
                  {/* Content */}
                  <div className="pt-2 flex-1 pb-2">
                    <h4 className="font-sans font-medium text-base text-[#F0EDE6] mb-2">{step.name} Agent</h4>
                    <div className="font-sans text-sm leading-relaxed text-[var(--text-secondary)] bg-[rgba(255,255,255,0.02)] p-4 rounded-xl border border-[rgba(255,255,255,0.05)]">
                      {step.data ? (
                        typeof step.data === 'string' ? (
                          <p>{step.data}</p>
                        ) : (
                          <pre className="font-sans text-xs whitespace-pre-wrap">
                            {JSON.stringify(step.data, null, 2).replace(/[{}[\]"]/g, '').trim()}
                          </pre>
                        )
                      ) : (
                        <span className="italic opacity-50">Data not captured for this step.</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
