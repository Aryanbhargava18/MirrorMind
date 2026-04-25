export default function Alternatives({ trace }) {
  const archetypes = trace?.synthesis?.archetypes || [];
  
  if (!archetypes || archetypes.length === 0) return null;

  return (
    <div className="glass-panel p-6 h-full flex flex-col">
      <h3 className="font-display text-xl text-[#F0EDE6] mb-1">Common patterns like yours</h3>
      <p className="font-sans text-sm text-[var(--text-secondary)] mb-6">Other reasoners who fell into similar traps.</p>

      <div className="space-y-4 flex-1">
        {archetypes.map((opt, i) => (
          <div 
            key={i} 
            className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] opacity-70 hover:opacity-100 hover:border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300 cursor-pointer"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-sans font-medium text-base text-[#F0EDE6]">{opt.name}</h4>
            </div>
            <p className="font-sans text-sm text-[var(--text-secondary)] leading-relaxed mb-2">
              {opt.description}
            </p>
            {opt.example && (
              <p className="font-sans text-xs text-[var(--text-secondary)] italic">
                Example: {opt.example}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
