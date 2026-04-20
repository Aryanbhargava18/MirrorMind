import { useState } from 'react';

export default function ReasoningTrace({ trace, evalResult, onClose }) {
  const [activeTab, setActiveTab] = useState('debate');

  const tabs = [
    { id: 'debate', label: 'Agent Debate' },
    { id: 'eval', label: 'Eval Scores' },
    { id: 'constitution', label: 'Constitution' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-navy-100 rounded-card border border-white/10 overflow-hidden animate-slide-up shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-navy-100 border-b border-white/5 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-warm font-semibold flex items-center gap-2">
              <svg className="w-4 h-4 text-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Reasoning Trace
            </h2>
            <p className="text-muted text-xs mt-0.5">Full transparency into how results were generated · {trace.debateTimeMs}ms</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-warm transition-colors p-1" id="close-trace">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 px-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'text-amber border-amber'
                  : 'text-muted/50 border-transparent hover:text-muted'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 max-h-[60vh]">
          {/* Debate Tab */}
          {activeTab === 'debate' && (
            <div className="space-y-6">
              {/* Agent A */}
              <AgentSection
                name={trace.agentA.name}
                color="text-blue-400"
                icon="📊"
                subtitle={`Evaluated ${trace.agentA.candidates} candidates`}
              >
                <p className="text-muted text-xs mb-3">Top pick: <span className="text-warm">{trace.agentA.topPick}</span></p>
                {trace.agentA.reasoning.map((r, i) => (
                  <div key={i} className="glass-dark p-3 mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-warm text-sm font-medium">{r.hotel}</span>
                      <span className="text-amber text-xs font-mono">{r.score}/100</span>
                    </div>
                    <ul className="space-y-0.5">
                      {r.reasoning.map((line, j) => (
                        <li key={j} className="text-muted/60 text-xs">• {line}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </AgentSection>

              {/* Agent B */}
              <AgentSection
                name={trace.agentB.name}
                color="text-red-400"
                icon="🔍"
                subtitle={`${trace.agentB.totalChallenges} challenges raised · Impact: -${trace.agentB.impactDelta} pts`}
              >
                {trace.agentB.rejections.length > 0 && (
                  <div className="bg-red-500/10 rounded-pill px-3 py-2 mb-3">
                    <p className="text-red-400/80 text-xs">Rejected: {trace.agentB.rejections.join(', ')}</p>
                  </div>
                )}
                {trace.agentB.challenges.map((c, i) => (
                  <div key={i} className="glass-dark p-3 mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-warm text-sm font-medium">{c.hotel}</span>
                      <span className={`text-xs font-medium ${
                        c.verdict === 'approved' ? 'text-emerald-400' :
                        c.verdict === 'rejected' ? 'text-red-400' : 'text-amber-400'
                      }`}>{c.verdict} ({c.scoreImpact})</span>
                    </div>
                    {c.challenges.map((ch, j) => (
                      <p key={j} className="text-muted/60 text-xs mb-1">
                        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                          ch.severity === 'high' ? 'bg-red-400' :
                          ch.severity === 'medium' ? 'bg-amber-400' : 'bg-blue-400'
                        }`} />
                        [{ch.type}] {ch.message}
                      </p>
                    ))}
                  </div>
                ))}
              </AgentSection>

              {/* Agent C */}
              <AgentSection
                name={trace.agentC.name}
                color="text-pink-400"
                icon="💭"
                subtitle={`Soul match: ${trace.agentC.soulMatch} · ${trace.agentC.emotionalOverrides} emotional overrides`}
              >
                {trace.agentC.notes.map((n, i) => (
                  <div key={i} className="glass-dark p-3 mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-warm text-sm font-medium">{n.hotel}</span>
                      <span className="text-pink-400/80 text-xs font-mono">♡ {n.emotionalScore}</span>
                    </div>
                    {n.notes.map((note, j) => (
                      <p key={j} className="text-muted/60 text-xs mb-0.5">• {note}</p>
                    ))}
                  </div>
                ))}
              </AgentSection>

              {/* Synthesis */}
              <div className="glass-dark p-4 border border-amber/20">
                <h4 className="text-amber text-sm font-semibold mb-2">⚡ Synthesis (Karpathy Loop)</h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-warm font-semibold">{trace.synthesis.finalCount}</p>
                    <p className="text-muted/40 text-[10px]">Final Hotels</p>
                  </div>
                  <div>
                    <p className="text-warm font-semibold">{trace.synthesis.reorderFromA ? 'Yes' : 'No'}</p>
                    <p className="text-muted/40 text-[10px]">Reordered from A</p>
                  </div>
                  <div>
                    <p className="text-warm font-semibold">{trace.synthesis.constitutionalPasses}/{trace.synthesis.finalCount}</p>
                    <p className="text-muted/40 text-[10px]">Constitutional Pass</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Eval Tab */}
          {activeTab === 'eval' && evalResult && (
            <div className="space-y-4">
              {/* Overall */}
              <div className="glass-dark p-5 border border-amber/20 text-center mb-6">
                <p className="text-muted text-xs uppercase tracking-wider mb-2">Overall Eval Score</p>
                <p className={`text-4xl font-bold ${
                  evalResult.overallScore >= 0.8 ? 'text-emerald-400' :
                  evalResult.overallScore >= 0.6 ? 'text-amber' : 'text-red-400'
                }`}>{Math.round(evalResult.overallScore * 100)}%</p>
                <p className="text-muted/40 text-xs mt-1">
                  {evalResult.allPassed ? '✓ All checks passed' : '⚠ Some checks flagged'}
                </p>
              </div>

              {/* Individual Evals */}
              {Object.entries(evalResult.evals).map(([key, eval_]) => (
                <div key={key} className="glass-dark p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${eval_.passed ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      <span className="text-warm text-sm font-medium">{eval_.name}</span>
                    </div>
                    <span className={`text-sm font-mono ${
                      eval_.score >= 0.8 ? 'text-emerald-400' :
                      eval_.score >= 0.5 ? 'text-amber' : 'text-red-400'
                    }`}>{Math.round(eval_.score * 100)}%</span>
                  </div>
                  <p className="text-muted/50 text-xs">{eval_.detail}</p>
                </div>
              ))}
            </div>
          )}

          {/* Constitution Tab */}
          {activeTab === 'constitution' && (
            <div className="space-y-4">
              {['C1', 'C2', 'C3', 'C4', 'C5'].map(rule => {
                const rules = {
                  C1: { title: 'No Hallucinated Attributes', desc: 'Never assert an attribute not in the verified data schema.' },
                  C2: { title: 'Confidence Flagging', desc: 'Low-confidence attributes flagged and stripped from user-facing output.' },
                  C3: { title: 'Price Transparency', desc: 'Never imply a price without including all fees.' },
                  C4: { title: 'Anti-Rec Required', desc: 'Every card must include "what you might not love" — mandatory.' },
                  C5: { title: 'AI Transparency', desc: 'Never impersonate a human. Transparently AI at every touchpoint.' },
                };
                return (
                  <div key={rule} className="glass-dark p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-amber text-xs font-mono font-bold">{rule}</span>
                      <span className="text-warm text-sm font-medium">{rules[rule].title}</span>
                    </div>
                    <p className="text-muted/50 text-xs ml-6">{rules[rule].desc}</p>
                    <p className="text-emerald-400/60 text-[10px] ml-6 mt-1">✓ Enforced on all {trace.synthesis.finalCount} cards</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AgentSection({ name, color, icon, subtitle, children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between mb-3 group"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <h3 className={`text-sm font-semibold ${color}`}>{name}</h3>
          <span className="text-muted/30 text-xs">·</span>
          <span className="text-muted/40 text-xs">{subtitle}</span>
        </div>
        <svg className={`w-4 h-4 text-muted/30 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="ml-7">{children}</div>}
    </div>
  );
}
