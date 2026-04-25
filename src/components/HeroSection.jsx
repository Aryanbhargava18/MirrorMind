import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import DecisionInput from './DecisionInput';

export default function HeroSection({ onSubmit }) {
  const headlineRef = useRef(null);

  const [subTaglineIndex, setSubTaglineIndex] = useState(0);
  const subTaglines = [
    "Spot your blind spots.",
    "Find what you're not asking.",
    "See the reasoning behind your reasoning."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSubTaglineIndex((prev) => (prev + 1) % subTaglines.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Simple stagger animation on mount (no GSAP dependency for hero)
  useEffect(() => {
    const spans = headlineRef.current?.querySelectorAll('.hero-word');
    if (spans) {
      spans.forEach((span, i) => {
        span.style.transitionDelay = `${i * 60 + 100}ms`;
        requestAnimationFrame(() => span.classList.add('visible'));
      });
    }
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute w-[800px] h-[800px] -top-[200px] left-1/2 -translate-x-1/2 rounded-full opacity-[0.07]"
          style={{
            background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)',
            animation: 'pulse 8s ease-in-out infinite alternate'
          }}
        />
        <div 
          className="absolute w-[600px] h-[600px] -bottom-[100px] -left-[200px] rounded-full opacity-[0.04]"
          style={{
            background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)',
            animation: 'pulse 10s ease-in-out infinite alternate-reverse'
          }}
        />
        <div 
          className="absolute w-[500px] h-[500px] top-[20%] -right-[150px] rounded-full opacity-[0.04]"
          style={{
            background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)',
            animation: 'pulse 12s ease-in-out infinite alternate'
          }}
        />
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="max-w-3xl mx-auto px-6 w-full relative z-10 flex flex-col items-center text-center">
        
        {/* Badge */}
        <div className="rounded-full border border-[rgba(201,162,39,0.25)] bg-[rgba(201,162,39,0.08)] text-[#C9A227] text-xs uppercase tracking-wider px-4 py-1.5 font-sans font-medium mb-8 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          Cognitive Bias Investigator
        </div>
        
        {/* Headline with gradient */}
        <h1 
          ref={headlineRef}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display leading-[1.05] text-[#F0EDE6] mb-6"
        >
          <span className="hero-word inline-block opacity-0 translate-y-6 transition-all duration-700">Every&nbsp;</span>
          <span className="hero-word inline-block opacity-0 translate-y-6 transition-all duration-700">hard&nbsp;</span>
          <span className="hero-word inline-block opacity-0 translate-y-6 transition-all duration-700">decision&nbsp;</span>
          <br />
          <span className="hero-word inline-block opacity-0 translate-y-6 transition-all duration-700">has&nbsp;</span>
          <span className="hero-word inline-block opacity-0 translate-y-6 transition-all duration-700">a&nbsp;</span>
          <span className="hero-word inline-block opacity-0 translate-y-6 transition-all duration-700" style={{
            background: 'linear-gradient(135deg, #EF4444, #F0EDE6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>blind&nbsp;</span>
          <span className="hero-word inline-block opacity-0 translate-y-6 transition-all duration-700" style={{
            background: 'linear-gradient(135deg, #EF4444, #F0EDE6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>spot.</span>
        </h1>

        {/* Subtitle */}
        <p className="font-sans text-base md:text-lg text-[var(--text-secondary)] mb-10 max-w-lg mx-auto leading-relaxed h-[60px] flex items-center justify-center">
          <span className="typewriter-text" key={subTaglineIndex}>
            {subTaglines[subTaglineIndex]}
          </span>
        </p>
        
        {/* Input Form — centered, single focus */}
        <div className="w-full max-w-2xl" id="input">
          <DecisionInput onSubmit={onSubmit} isLoading={false} />
        </div>
      </div>

      {/* Scroll indicator */}
      <a href="#how-it-works" className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-40 hover:opacity-70 transition-opacity hidden md:flex flex-col items-center gap-1">
        <span className="text-xs font-sans text-[var(--text-secondary)] tracking-wider uppercase">Explore</span>
        <ChevronDown className="w-5 h-5 text-[#F0EDE6] animate-bounce" />
      </a>

      <style>{`
        .hero-word.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .typewriter-text {
          animation: fadeSlideUp 0.6s ease-out forwards;
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          from { transform: translate(-50%, 0) scale(1); }
          to { transform: translate(-50%, 0) scale(1.15); }
        }
      `}</style>
    </section>
  );
}
