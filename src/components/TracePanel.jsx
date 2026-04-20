/**
 * TracePanel — Right-side drawer showing full agent debate log.
 * Opens with 250ms slide animation. Shows: Optimizer → Advocate → Empathy → Synthesis.
 */

export default function TracePanel({ isOpen, onClose, trace, evalResult }) {
  if (!trace) return null;

  const { optimizer, advocate, empathy, synthesis } = trace;

  const safeScore = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '—';
    return `${Math.round(val * 100)}%`;
  };

  const sections = [
    {
      title: 'Optimizer',
      varColor: 'var(--accent-blue)',
      content: optimizer?.reasoning || 'Scored hotels against your preference vector.',
      data: optimizer?.candidates?.slice(0, 4).map(c =>
        `${c.hotel_name}: ${c.score}/100`
      ),
    },
    {
      title: "Devil's Advocate",
      varColor: 'var(--accent-red)',
      content: advocate?.reasoning || 'Challenged the top picks.',
      data: advocate?.challenges?.slice(0, 3).map(c =>
        `${c.hotel_name}: ${c.challenges?.length || 0} issues, impact ${c.score_impact}`
      ),
    },
    {
      title: 'Empathy Agent',
      varColor: 'var(--accent-green)',
      content: empathy?.reasoning || 'Scanned for emotional resonance.',
      data: empathy?.soul_match ? [`Soul match: ${empathy.soul_match.hotel_name}`] : [],
    },
    {
      title: 'Synthesis',
      varColor: 'var(--accent-purple)',
      content: synthesis?.reasoning || 'Merged agent outputs.',
      data: [
        synthesis?.did_advocate_change_ranking ? 'Advocate changed the ranking' : 'Rankings held',
        synthesis?.did_empathy_override ? 'Empathy override applied' : null,
        `${synthesis?.shortlist?.length || 0} hotels in final shortlist`,
      ].filter(Boolean),
    },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="trace-overlay" onClick={onClose} />
      )}

      {/* Panel */}
      <div className={`trace-panel ${isOpen ? 'open' : 'closed'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--bg-border)]">
          <div>
            <h2 className="text-[var(--text-primary)] font-semibold text-base">Agent Reasoning Trace</h2>
            <p className="text-[var(--text-secondary)] opacity-70 text-xs mt-1">Full debate log for this shortlist</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[var(--bg-border)] hover:bg-[var(--bg-border-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]
                       flex items-center justify-center transition-all text-lg"
          >
            ×
          </button>
        </div>

        {/* Eval Score / Karpathy Loop */}
        {evalResult && (
          <div className="px-6 py-4 bg-[var(--bg-elevated)] bg-opacity-30 border-b border-[var(--bg-border)]">
            {evalResult.eval_passes && evalResult.eval_passes.length > 1 ? (
              <div className="space-y-3">
                {evalResult.eval_passes.map((p, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-semibold ${p.passed ? 'text-[var(--score-high)]' : 'text-[var(--score-mid)]'}`}>
                        Pass {p.pass} → Eval score: {safeScore(p.score)} {p.passed ? '✓' : ''}
                      </span>
                    </div>
                    {!p.passed && (
                      <div className="pl-2 border-l border-[var(--bg-border)] text-[var(--text-muted)]">
                        <p>Reason: {p.critique}</p>
                        <p className="text-[var(--score-mid)] opacity-80 mt-1">↻ Retry triggered...</p>
                      </div>
                    )}
                    {p.passed && (
                      <p className="pl-2 border-l border-[var(--bg-border)] text-[var(--score-high)] opacity-60">Shortlist accepted.</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 text-xs">
                <span className="text-[var(--score-high)] font-medium">
                  Eval: {safeScore(evalResult.overall || evalResult.overallScore)}
                </span>
                {evalResult.scores && Object.entries(evalResult.scores).map(([key, val]) => (
                  <span key={key} className="text-[var(--text-muted)]">
                    {key}: {safeScore(val)}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sections */}
        <div className="pb-8 mt-4">
          {sections.map((section, i) => (
            <div key={i} className="trace-section border-l-2 ml-6" style={{ borderColor: section.varColor }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: section.varColor }} />
                <h3 className="text-[var(--text-primary)] text-sm font-medium" style={{ color: section.varColor }}>{section.title}</h3>
              </div>
              <p className="text-[var(--text-secondary)] text-[13px] leading-relaxed mb-2 pl-4">
                {section.content}
              </p>
              {section.data && section.data.length > 0 && (
                <div className="pl-4 space-y-1">
                  {section.data.map((item, j) => (
                    <p key={j} className="text-[var(--text-muted)] text-[12px]">• {item}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
