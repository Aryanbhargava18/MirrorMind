import { Check, AlertTriangle } from 'lucide-react';

export default function TradeOffs({ merits, omissions }) {
  const safeMerits = Array.isArray(merits) ? merits : [];
  const safeOmissions = Array.isArray(omissions) ? omissions : [];

  return (
    <div className="glass-panel p-6 h-full flex flex-col group hover:bg-[rgba(255,255,255,0.04)] transition-colors duration-300">
      <div className="mb-6">
        <h3 className="font-sans text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1">Evidence vs Instinct</h3>
        <p className="font-sans text-sm italic text-[var(--text-secondary)]">Both of these are true at the same time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        {/* Pros */}
        <div className="flex flex-col">
          <h4 className="text-sm font-sans font-medium text-[#F0EDE6] mb-4">Where your reasoning holds</h4>
          <ul className="space-y-3 flex-1">
            {safeMerits.map((merit, i) => (
              <li key={i} className="flex items-start gap-3 text-sm font-sans text-[var(--text-secondary)] leading-relaxed">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-[#C9A227]" />
                <span>{merit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cons */}
        <div className="flex flex-col mt-6 md:mt-0">
          <h4 className="text-sm font-sans font-medium text-[#F0EDE6] mb-4">What you're avoiding</h4>
          <ul className="space-y-3 flex-1">
            {safeOmissions.map((omission, i) => (
              <li key={i} className="flex items-start gap-3 text-sm font-sans text-[var(--text-secondary)] leading-relaxed">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-[#EF4444]" />
                <span>{omission}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
