import { useState, useEffect, useRef, useMemo } from 'react';

// Simple markdown parser: **bold**, *italic*, \n
function renderMarkdown(text) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-warm">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="italic text-warm/70">{part.slice(1, -1)}</em>;
    }
    return <span key={i}>{part}</span>;
  });
}

// Typing animation for agent messages
function TypeWriter({ text, speed = 20, onComplete }) {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed('');
    indexRef.current = 0;
    const timer = setInterval(() => {
      indexRef.current++;
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) {
        clearInterval(timer);
        onComplete?.();
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return <span>{displayed}<span className="animate-pulse-soft">▍</span></span>;
}

// Agent thinking dots
function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      <div className="w-2 h-2 rounded-full bg-amber/60 animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 rounded-full bg-amber/60 animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 rounded-full bg-amber/60 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

const AGENT_ICONS = {
  system: (
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
  ),
  optimizer: (
    <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
      <span className="text-xs">📊</span>
    </div>
  ),
  advocate: (
    <div className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0">
      <span className="text-xs">🔍</span>
    </div>
  ),
  empathy: (
    <div className="w-7 h-7 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center flex-shrink-0">
      <span className="text-xs">💭</span>
    </div>
  ),
  synthesis: (
    <div className="w-7 h-7 rounded-lg bg-amber/20 border border-amber/30 flex items-center justify-center flex-shrink-0">
      <span className="text-xs">⚡</span>
    </div>
  ),
};

const AGENT_COLORS = {
  system: 'text-warm',
  optimizer: 'text-blue-400',
  advocate: 'text-red-400',
  empathy: 'text-pink-400',
  synthesis: 'text-amber',
};

const AGENT_NAMES = {
  system: 'TripSense',
  optimizer: 'Optimizer',
  advocate: "Devil's Advocate",
  empathy: 'Empathy Agent',
  synthesis: 'Synthesis',
};

export default function AgentChat({ 
  messages, 
  isThinking, 
  onSendMessage, 
  currentAgent,
  sessionDNA 
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isThinking) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-4">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} index={i} onSendMessage={onSendMessage} />
        ))}

        {/* Thinking indicator */}
        {isThinking && (
          <div className="flex items-start gap-3 animate-fade-in">
            {AGENT_ICONS[currentAgent || 'system']}
            <div>
              <p className={`text-[11px] font-semibold uppercase tracking-wider mb-1 ${AGENT_COLORS[currentAgent || 'system']}`}>
                {AGENT_NAMES[currentAgent || 'system']}
              </p>
              <div className="glass-dark rounded-2xl rounded-tl-sm">
                <ThinkingDots />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-white/5 bg-navy-200/50 backdrop-blur-sm px-4 md:px-6 py-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="glass-dark flex items-center px-4 gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isThinking ? 'Agents are debating...' : 'Tell me about your ideal stay...'}
              className="flex-1 bg-transparent text-warm placeholder:text-muted/40 text-sm outline-none py-3.5 caret-amber"
              disabled={isThinking}
              id="agent-chat-input"
            />
            <button
              type="submit"
              disabled={isThinking || !input.trim()}
              className="p-2 rounded-lg bg-amber/80 hover:bg-amber text-navy transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              id="agent-chat-send"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19V5m0 0l-7 7m7-7l7 7" />
              </svg>
            </button>
          </div>
          <p className="text-[10px] text-muted/30 mt-2 text-center">
            TripSense is transparently AI · Three agents debate every recommendation · Anti-recs are mandatory
          </p>
        </form>
      </div>
    </div>
  );
}

function MessageBubble({ message, index, onSendMessage }) {
  const { role, agent, content, type, data } = message;

  // User message
  if (role === 'user') {
    return (
      <div className="flex justify-end animate-slide-up" style={{ animationDelay: `${index * 30}ms` }}>
        <div className="max-w-md bg-amber/15 border border-amber/20 rounded-2xl rounded-tr-sm px-4 py-3">
          <p className="text-warm text-sm">{content}</p>
        </div>
      </div>
    );
  }

  // Agent debate step
  if (type === 'debate-step') {
    return (
      <div className="flex items-start gap-3 animate-slide-up" style={{ animationDelay: `${index * 30}ms` }}>
        {AGENT_ICONS[agent] || AGENT_ICONS.system}
        <div className="flex-1 max-w-2xl">
          <p className={`text-[11px] font-semibold uppercase tracking-wider mb-1 ${AGENT_COLORS[agent] || AGENT_COLORS.system}`}>
            {AGENT_NAMES[agent] || 'System'}
          </p>
          <div className="glass-dark rounded-2xl rounded-tl-sm px-4 py-3">
            <p className="text-warm/80 text-sm leading-relaxed">{renderMarkdown(content)}</p>
            {data?.scores && (
              <div className="mt-3 space-y-1.5">
                {data.scores.map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-muted/60">{s.hotel}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{ width: `${s.score}%` }} />
                      </div>
                      <span className="text-blue-400 font-mono w-8 text-right">{s.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {data?.challenges && (
              <div className="mt-3 space-y-2">
                {data.challenges.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                      c.severity === 'high' ? 'bg-red-400' : c.severity === 'medium' ? 'bg-amber-400' : 'bg-blue-400'
                    }`} />
                    <span className="text-muted/60">{c.message}</span>
                  </div>
                ))}
              </div>
            )}
            {data?.emotionalNotes && (
              <div className="mt-3 space-y-1">
                {data.emotionalNotes.map((note, i) => (
                  <p key={i} className="text-xs text-pink-300/60 italic">"{note}"</p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Constitution check
  if (type === 'constitution') {
    return (
      <div className="flex items-start gap-3 animate-slide-up" style={{ animationDelay: `${index * 30}ms` }}>
        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
          <span className="text-xs">🛡️</span>
        </div>
        <div className="flex-1 max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1 text-emerald-400">Constitutional Check</p>
          <div className="glass-dark rounded-2xl rounded-tl-sm px-4 py-3">
            <div className="grid grid-cols-5 gap-2">
              {['C1', 'C2', 'C3', 'C4', 'C5'].map(rule => (
                <div key={rule} className="text-center">
                  <div className="w-8 h-8 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-1">
                    <span className="text-emerald-400 text-[10px] font-bold">✓</span>
                  </div>
                  <span className="text-[9px] text-muted/40">{rule}</span>
                </div>
              ))}
            </div>
            <p className="text-emerald-400/60 text-xs mt-2 text-center">{content}</p>
          </div>
        </div>
      </div>
    );
  }

  // Clarifying question
  if (type === 'clarifying') {
    return (
      <div className="flex items-start gap-3 animate-slide-up" style={{ animationDelay: `${index * 30}ms` }}>
        {AGENT_ICONS.system}
        <div className="flex-1 max-w-2xl">
          <p className={`text-[11px] font-semibold uppercase tracking-wider mb-1 ${AGENT_COLORS.system}`}>TripSense</p>
          <div className="glass-dark rounded-2xl rounded-tl-sm px-4 py-3 border border-amber/20">
            <p className="text-warm/80 text-sm leading-relaxed">{renderMarkdown(content)}</p>
            {data?.options && (
              <div className="mt-3 flex flex-wrap gap-2">
                {data.options.map((opt, i) => (
                  <button key={i} onClick={() => onSendMessage?.(opt)} className="tag-pill tag-inactive text-xs hover:bg-amber/20 hover:text-amber transition-all cursor-pointer">
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // System/agent message (default)
  return (
    <div className="flex items-start gap-3 animate-slide-up" style={{ animationDelay: `${index * 30}ms` }}>
      {AGENT_ICONS[agent || 'system']}
      <div className="flex-1 max-w-2xl">
        <p className={`text-[11px] font-semibold uppercase tracking-wider mb-1 ${AGENT_COLORS[agent || 'system']}`}>
          {AGENT_NAMES[agent || 'system']}
        </p>
        <div className="glass-dark rounded-2xl rounded-tl-sm px-4 py-3">
          <p className="text-warm/80 text-sm leading-relaxed whitespace-pre-line">{renderMarkdown(content)}</p>
        </div>
      </div>
    </div>
  );
}

export { ThinkingDots, TypeWriter };
