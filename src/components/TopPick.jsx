import { ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { useState } from 'react';

export default function TopPick({ question }) {
  if (!question) return null;

  return (
    <div 
      className="p-8 rounded-xl relative overflow-hidden group border-l-[4px] border-l-[#C9A227] h-full flex flex-col justify-center"
      style={{ backgroundColor: 'rgba(201,162,39,0.06)', borderTop: '1px solid rgba(201,162,39,0.2)', borderRight: '1px solid rgba(201,162,39,0.2)', borderBottom: '1px solid rgba(201,162,39,0.2)' }}
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-[rgba(201,162,39,0.05)] blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
      
      <div className="mb-4 relative z-10">
        <h3 className="font-sans text-xs font-medium uppercase tracking-wider text-[#C9A227]">The Question You're Not Asking</h3>
      </div>
      
      <h2 className="text-2xl md:text-[28px] font-display italic text-[#F0EDE6] leading-relaxed mb-6 relative z-10">
        "{question}"
      </h2>
      
      <p className="font-sans text-sm text-[var(--text-secondary)] relative z-10">
        Answer this honestly before you decide anything.
      </p>
    </div>
  );
}
