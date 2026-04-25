import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  query: z.string().min(10, "Please provide a bit more detail (at least 10 characters)."),
});

const EXAMPLE_CHIPS = [
  "I've been building this startup for 2 years, revenue is flat but I feel like we're close",
  "I got two job offers. One pays more but I keep finding reasons to pick the lower one",
  "Everyone I've shown my idea to loves it, I think it's ready to launch",
  "I know I should quit but I've already invested so much time"
];

export default function DecisionInput({ onSubmit, isLoading, compact = false }) {
  const [isDeepAnalysis, setIsDeepAnalysis] = useState(false);
  const [selectedChip, setSelectedChip] = useState(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  const handleChipClick = (text) => {
    setValue('query', text, { shouldValidate: true });
    setSelectedChip(text);
  };

  const submitWrapper = (data) => {
    onSubmit(data.query, "general", { deepAnalysis: isDeepAnalysis });
  };

  // Compact mode: slim single-line re-query bar for results page
  if (compact) {
    return (
      <div className="w-full">
        <form onSubmit={handleSubmit(submitWrapper)} className="flex gap-3 items-center w-full">
          <input
            {...register('query')}
            placeholder="Try another decision..."
            className="flex-1 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 text-[#F0EDE6] font-sans text-sm placeholder:text-[var(--text-secondary)] transition-all duration-200 focus-visible:outline-none focus-visible:border-[rgba(201,162,39,0.5)] focus-visible:shadow-[0_0_0_3px_rgba(201,162,39,0.08)]"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading}
            className="shrink-0 font-sans text-sm font-medium bg-[#C9A227] text-[#06060E] px-6 py-3 rounded-lg transition-all duration-200 hover:brightness-110 active:scale-95"
          >
            Re-analyze
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(submitWrapper)} className="flex flex-col gap-0 w-full">
        
        {/* Input Area */}
        <div className="relative group mb-3">
          <textarea
            {...register('query')}
            placeholder="Describe your reasoning about any decision you're facing. Be as specific as possible — the more you write, the sharper the analysis."
            className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl p-5 text-[#F0EDE6] font-sans text-base placeholder:text-[var(--text-secondary)] min-h-[120px] resize-none transition-all duration-200 focus-visible:outline-none focus-visible:border-[rgba(201,162,39,0.5)] focus-visible:shadow-[0_0_0_3px_rgba(201,162,39,0.08)]"
            disabled={isLoading}
            onChange={() => setSelectedChip(null)}
          />
          {errors.query && (
            <p className="absolute -bottom-6 left-2 text-[#EF4444] text-sm font-medium font-sans">
              {errors.query.message}
            </p>
          )}
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-[8px] mb-2">
          {EXAMPLE_CHIPS.map((chip, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleChipClick(chip)}
              disabled={isLoading}
              className={`px-4 py-2 rounded-full bg-[rgba(255,255,255,0.04)] text-sm font-sans transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#06060E] ${
                selectedChip === chip 
                  ? 'border border-[#C9A227] text-[#C9A227]' 
                  : 'border border-[rgba(255,255,255,0.08)] text-[var(--text-secondary)] hover:border-[rgba(255,255,255,0.2)] hover:text-[#F0EDE6]'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Deep Analysis Toggle */}
        <div className="flex justify-end mb-4">
          <label className="flex items-center gap-2 cursor-pointer group">
            <span className="text-sm font-sans text-[var(--text-secondary)] group-hover:text-[#F0EDE6] transition-colors">
              Deep analysis mode
            </span>
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={isDeepAnalysis}
                onChange={(e) => setIsDeepAnalysis(e.target.checked)}
              />
              <div className={`block w-10 h-6 rounded-full transition-colors ${isDeepAnalysis ? 'bg-[#C9A227]' : 'bg-[rgba(255,255,255,0.1)]'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isDeepAnalysis ? 'translate-x-4' : 'translate-x-0'}`}></div>
            </div>
          </label>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className={`w-full font-display text-lg bg-gold text-[#06060E] p-4 rounded-lg transition-all duration-200 hover:brightness-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#06060E] hover:shadow-[0_4px_24px_rgba(201,162,39,0.3)] flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-[#06060E] border-t-transparent rounded-full animate-spin"></span>
              Agents analyzing...
            </>
          ) : (
            "Analyze My Thinking"
          )}
        </button>
      </form>
    </div>
  );
}
