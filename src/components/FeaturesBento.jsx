import { Search, ShieldAlert, Scale, RefreshCw, Eye, ThumbsDown } from 'lucide-react';

export default function FeaturesBento() {
  const features = [
    {
      title: "Evidence-Only Findings",
      description: "We only flag biases we can quote from your own words.",
      icon: <Search className="w-5 h-5 text-[#3B82F6]" />,
      className: "md:col-span-2 md:row-span-2",
      content: (
        <div className="mt-6 flex flex-col gap-3">
          <div className="px-4 py-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-lg font-sans text-sm text-[var(--text-secondary)] italic">
            "I've been building this startup for 2 years, revenue is flat but I feel like we're close"
          </div>
          <div className="px-4 py-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-lg font-sans text-sm text-[var(--text-secondary)] italic">
            "I got two job offers. One pays more but I keep finding reasons to pick the lower one"
          </div>
        </div>
      )
    },
    {
      title: "Adversarial by Design",
      description: "One agent's only job is to find your blind spots.",
      icon: <ShieldAlert className="w-5 h-5 text-[#EF4444]" />,
      className: "md:col-span-1",
    },
    {
      title: "Steelmanned Instincts",
      description: "We defend your gut before we attack it.",
      icon: <Scale className="w-5 h-5 text-[#C9A227]" />,
      className: "md:col-span-1",
    },
    {
      title: "Your Pattern, Not Just This Decision",
      description: "The Synthesizer reveals how you characteristically think.",
      icon: <RefreshCw className="w-5 h-5 text-[#8B5CF6]" />,
      className: "md:col-span-2",
    },
    {
      title: "Absence Detection",
      description: "We find what you're conspicuously not asking.",
      icon: <Eye className="w-5 h-5 text-[#3B82F6]" />,
      className: "md:col-span-1",
    },
    {
      title: "Any Decision Domain",
      description: "Career, relationships, business, money, anything.",
      icon: <ThumbsDown className="w-5 h-5 text-[#EF4444]" />,
      className: "md:col-span-1",
    }
  ];

  return (
    <section id="features" className="py-32 relative overflow-hidden bg-[#06060E]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="mb-16 text-center scroll-reveal">
          <p className="text-[#C9A227] font-sans font-medium mb-4 uppercase tracking-wider text-xs">Features</p>
          <h2 className="text-4xl md:text-5xl font-display text-[#F0EDE6]">Built for truth, not clicks.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:auto-rows-[200px]">
          {features.map((feature, i) => (
            <div 
              key={i} 
              className={`scroll-reveal-stagger p-6 md:p-8 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.035)] group ${feature.className}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div>
                <div className="mb-5 opacity-80 group-hover:opacity-100 transition-opacity">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-display text-[#F0EDE6] mb-2">{feature.title}</h3>
                <p className="font-sans text-sm text-[var(--text-secondary)] leading-relaxed">{feature.description}</p>
                {feature.content && feature.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
