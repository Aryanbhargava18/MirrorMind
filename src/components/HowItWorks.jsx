import { MessageSquare, Search, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Describe your reasoning",
      desc: "Not your decision, your thinking about it.",
      icon: <MessageSquare className="w-5 h-5" />,
      color: "#F0EDE6",
      bg: "rgba(255,255,255,0.1)"
    },
    {
      num: "02",
      title: "Mapper extracts your claims",
      desc: "Every fact, assumption, and value you stated is mapped.",
      icon: <Search className="w-5 h-5" />,
      color: "#3B82F6",
      bg: "rgba(59,130,246,0.15)"
    },
    {
      num: "03",
      title: "Investigator finds your blind spots",
      desc: "We flag biases only with evidence from your own words.",
      icon: <ShieldAlert className="w-5 h-5" />,
      color: "#EF4444",
      bg: "rgba(239,68,68,0.15)"
    },
    {
      num: "04",
      title: "Advocate steelmans your instinct",
      desc: "Defends what's genuinely right in your thinking.",
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: "#C9A227",
      bg: "rgba(201,162,39,0.15)"
    },
    {
      num: "05",
      title: "Synthesizer reads your pattern",
      desc: "What this reveals about how you decide in general.",
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: "#8B5CF6",
      bg: "rgba(139,92,246,0.15)"
    }
  ];

  return (
    <section id="how-it-works" className="py-32 relative overflow-hidden bg-[#06060E]">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div className="mb-16 text-center scroll-reveal">
          <p className="text-[#C9A227] font-sans font-medium mb-4 uppercase tracking-wider text-xs">The Process</p>
          <h2 className="text-4xl md:text-5xl font-display text-[#F0EDE6]">How we decide.</h2>
        </div>

        {/* Vertical Timeline */}
        <div className="relative max-w-3xl mx-auto">
          {/* Connecting line */}
          <div className="absolute left-6 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-px bg-[rgba(255,255,255,0.08)]" />

          <div className="space-y-12 md:space-y-16">
            {steps.map((step, i) => (
              <div 
                key={i} 
                className={`scroll-reveal-stagger relative flex flex-col md:flex-row items-start gap-6 md:gap-12 ${
                  i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {/* Node */}
                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center border-4 border-[#06060E] z-10"
                  style={{ backgroundColor: step.bg }}
                >
                  <span style={{ color: step.color }}>{step.icon}</span>
                </div>

                {/* Content Card */}
                <div className={`ml-16 md:ml-0 md:w-[calc(50%-3rem)] ${i % 2 === 0 ? 'md:pr-4' : 'md:pl-4'}`}>
                  <div className="p-6 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.03)] transition-all duration-300">
                    <span className="text-6xl font-display font-bold text-[rgba(255,255,255,0.03)] absolute -right-2 -top-4 select-none pointer-events-none leading-none">
                      {step.num}
                    </span>
                    <h3 className="text-xl font-display text-[#F0EDE6] mb-3 relative z-10">{step.title}</h3>
                    <p className="font-sans text-sm text-[var(--text-secondary)] leading-relaxed relative z-10">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
