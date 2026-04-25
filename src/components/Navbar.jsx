import { useState } from 'react';
import { Menu, X, ArrowLeft } from 'lucide-react';

const BrandMark = () => (
  <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="#C9A227" strokeWidth="1.5">
    <circle cx="10" cy="4" r="2" />
    <circle cx="4" cy="16" r="2" />
    <circle cx="16" cy="16" r="2" />
    <line x1="8.5" y1="6" x2="5.5" y2="14" />
    <line x1="11.5" y1="6" x2="14.5" y2="14" />
    <line x1="6" y1="16" x2="14" y2="16" />
  </svg>
);

export default function Navbar({ phase, onNewDecision }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300 py-4 border-b border-[rgba(255,255,255,0.06)]"
      style={{ backgroundColor: 'rgba(6,6,14,0.8)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
    >
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <button 
          onClick={onNewDecision}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
        >
          <BrandMark />
          <span className="font-display font-medium text-lg tracking-tight text-[#F0EDE6]">
            MirrorMind
          </span>
        </button>

        {/* Desktop Links - always visible */}
        <div className="hidden md:flex items-center gap-8 text-sm font-sans font-medium text-[var(--text-secondary)]">
          <a href="#how-it-works" onClick={(e) => { if (phase !== 'idle') { e.preventDefault(); onNewDecision(); setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }), 100); } }} className="hover:text-[#F0EDE6] transition-colors duration-200">How It Works</a>
          <a href="#features" onClick={(e) => { if (phase !== 'idle') { e.preventDefault(); onNewDecision(); setTimeout(() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }), 100); } }} className="hover:text-[#F0EDE6] transition-colors duration-200">Features</a>
          <a href="#about" onClick={(e) => { if (phase !== 'idle') { e.preventDefault(); onNewDecision(); setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 100); } }} className="hover:text-[#F0EDE6] transition-colors duration-200">About</a>
        </div>

        {/* Desktop CTA - context aware */}
        <div className="hidden md:block">
          {phase === 'idle' ? (
            <button 
              onClick={() => document.getElementById('input')?.scrollIntoView({ behavior: 'smooth' })} 
              className="flex items-center justify-center border border-[rgba(201,162,39,0.5)] bg-transparent text-[#C9A227] font-sans text-sm rounded-lg px-5 py-2.5 transition-all duration-200 hover:bg-[#C9A227] hover:text-[#06060E] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              Analyze My Thinking
            </button>
          ) : (
            <button 
              onClick={onNewDecision}
              className="flex items-center gap-2 border border-[rgba(255,255,255,0.15)] text-[var(--text-secondary)] font-sans text-sm rounded-lg px-5 py-2.5 transition-all duration-200 hover:border-[rgba(255,255,255,0.3)] hover:text-[#F0EDE6] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              <ArrowLeft className="w-4 h-4" />
              New Decision
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-[#F0EDE6] p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#06060E]/95 backdrop-blur-xl border-b border-white/5 p-6 flex flex-col gap-6 shadow-2xl md:hidden">
          {phase === 'idle' ? (
            <>
              <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="text-lg font-medium text-[#F0EDE6]">How It Works</a>
              <a href="#features" onClick={() => setMobileOpen(false)} className="text-lg font-medium text-[#F0EDE6]">Features</a>
              <a href="#about" onClick={() => setMobileOpen(false)} className="text-lg font-medium text-[#F0EDE6]">About</a>
              <button 
                onClick={() => { setMobileOpen(false); document.getElementById('input')?.scrollIntoView({ behavior: 'smooth' }) }} 
                className="cta-gold w-full mt-4"
              >
                Analyze My Thinking
              </button>
            </>
          ) : (
            <button 
              onClick={() => { setMobileOpen(false); onNewDecision(); }}
              className="cta-ghost w-full flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              New Decision
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
