import { ArrowRight, Sparkles } from 'lucide-react';

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

export default function Footer() {
  return (
    <>
      {/* Pre-footer CTA */}
      <section id="about" className="py-24 bg-[#06060E] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            background: 'radial-gradient(circle at center, #C9A227 0%, transparent 50%)'
          }}
        />
        <div className="max-w-2xl mx-auto px-6 text-center relative z-10 scroll-reveal">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-[rgba(201,162,39,0.2)] bg-[rgba(201,162,39,0.06)] text-[#C9A227] text-xs font-sans font-medium uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Ready?
          </div>
          <h2 className="text-3xl md:text-5xl font-display text-[#F0EDE6] mb-4">
            See what you're not seeing.
          </h2>
          <p className="font-sans text-base text-[var(--text-secondary)] mb-8 max-w-md mx-auto leading-relaxed">
            Paste your reasoning. Four adversarial agents will find the blind spots you can't.
          </p>
          <button 
            onClick={() => document.getElementById('input')?.scrollIntoView({ behavior: 'smooth' }) || window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 bg-[#C9A227] text-[#06060E] font-sans text-base font-medium rounded-lg px-8 py-4 transition-all duration-200 hover:brightness-110 active:scale-95 hover:shadow-[0_4px_24px_rgba(201,162,39,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            Analyze My Thinking
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.05)] bg-[#06060E] py-10">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
            <BrandMark />
            <span className="font-display font-medium text-lg text-[#F0EDE6]">MirrorMind</span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] text-center md:text-left">
            Your reasoning, adversarially examined.
          </p>
          <div className="flex items-center gap-6 text-sm text-[var(--text-secondary)]">
          </div>
        </div>
      </footer>
    </>
  );
}
