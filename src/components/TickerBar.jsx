import { Search, ShieldAlert, Scale, RefreshCw, Zap, Shield } from 'lucide-react';

export default function TickerBar() {
  const items = [
    { icon: <Search className="w-4 h-4" />, text: "Evidence-Only Bias Detection", color: "#3B82F6" },
    { icon: <Zap className="w-4 h-4" />, text: "4 Adversarial Agents", color: "#C9A227" },
    { icon: <ShieldAlert className="w-4 h-4" />, text: "Absence Detection", color: "#EF4444" },
    { icon: <Shield className="w-4 h-4" />, text: "No Generic Outputs", color: "#4CAF82" },
    { icon: <Scale className="w-4 h-4" />, text: "Your Pattern Revealed", color: "#8B5CF6" },
    { icon: <RefreshCw className="w-4 h-4" />, text: "Karpathy Self-Correction", color: "#C9A227" },
    { icon: <Scale className="w-4 h-4" />, text: "Any Decision Domain", color: "#8B5CF6" },
  ];

  return (
    <div className="border-y border-[rgba(255,255,255,0.05)] py-5 bg-[rgba(255,255,255,0.01)]">
      <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2.5 text-sm font-sans font-medium text-[var(--text-secondary)]">
            <span style={{ color: item.color }}>{item.icon}</span>
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
