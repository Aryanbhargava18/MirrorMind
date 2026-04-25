import TopPick from './TopPick';
import TradeOffs from './TradeOffs';
import Alternatives from './Alternatives';
import ReasoningTrace from './ReasoningTrace';
import { Copy, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import { useToast } from './Toast';

export default function ResultsSection({ results, trace, sessionId }) {
  const showToast = useToast();
  if (!trace) return null;

  const omissions = trace?.advocate?.biases?.map(b => b.absent_question) || [];
  const merits = trace?.personalizer?.defense || [];
  const question = trace?.synthesis?.question;
  
  const patternName = trace?.synthesis?.pattern_name || "Detected Pattern";
  const explanation = trace?.synthesis?.explanation || "Analyzing your reasoning pattern...";
  const depthScore = trace?.synthesis?.confidence || 85;

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const finalOffset = circumference - (depthScore / 100) * circumference;

  const handleCopy = () => {
    const text = `Pattern: ${patternName}\nDepth: ${depthScore}%\nThe Question I'm Not Asking: ${question}`;
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard!");
  };

  const handleExport = () => {
    const pdf = new jsPDF();
    pdf.setFontSize(20);
    pdf.text("MirrorMind Analysis", 20, 20);
    pdf.setFontSize(12);
    pdf.text(`Pattern: ${patternName}`, 20, 40);
    pdf.text(`The Question: ${question}`, 20, 50, { maxWidth: 170 });
    pdf.save("mirrormind-analysis.pdf");
  };

  return (
    <section className="min-h-screen py-32 relative bg-[#06060E]">
      <div className="max-w-[1200px] mx-auto px-6">
        
        <div className="mb-16 text-center scroll-hide scroll-show">
          <p className="text-[#C9A227] font-sans font-medium mb-4 uppercase tracking-wider text-xs">Analysis Complete</p>
          <h2 className="text-4xl md:text-5xl font-display font-light text-[#F0EDE6]">Here is your honest mirror.</h2>
        </div>

        {/* Bento Grid Layout - 12 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 auto-rows-max">
          
          {/* Left Column */}
          <div className="md:col-span-8 flex flex-col gap-5">
            {/* Your Thinking Pattern Card */}
            <div className="glass-panel p-8 pt-10 rounded-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#8B5CF6]"></div>
              
              <div className="flex-1 relative z-10">
                <h3 className="text-[var(--text-secondary)] text-xs font-medium uppercase tracking-wider mb-3">Your Thinking Pattern</h3>
                <h2 className="text-4xl font-display text-[#F0EDE6] mb-4">{patternName}</h2>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-lg mb-6">{explanation}</p>
                <button onClick={handleExport} className="cta-gold text-sm px-6 py-2.5 rounded-lg">Save Analysis</button>
              </div>
              <div className="relative w-[120px] h-[120px] shrink-0 flex items-center justify-center flex-col md:ml-4">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle cx="60" cy="60" r="42" stroke="rgba(139,92,246,0.15)" strokeWidth="4" fill="transparent" />
                  <circle 
                    cx="60" 
                    cy="60" 
                    r="42" 
                    stroke="#8B5CF6" 
                    strokeWidth="4" 
                    fill="transparent" 
                    strokeDasharray={circumference}
                    strokeDashoffset={finalOffset}
                    className="transition-all duration-[1500ms] ease-out" 
                  />
                </svg>
                <span className="text-2xl font-display font-medium text-[#8B5CF6]">{depthScore}</span>
                <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] mt-1">Depth</span>
              </div>
            </div>

            <TradeOffs merits={merits} omissions={omissions} />
          </div>

          {/* Right Column */}
          <div className="md:col-span-4 flex flex-col gap-5">
            <TopPick question={question} />
            <Alternatives trace={trace} />
          </div>

          {/* Reasoning Trace (Full width) */}
          <div className="md:col-span-12 mt-2">
            <ReasoningTrace trace={trace} />
          </div>

          {/* Save/Share Card */}
          <div className="md:col-span-12 glass-panel p-6 flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
            <div>
              <p className="text-[#F0EDE6] font-sans font-medium text-sm">Session ID</p>
              <p className="text-[var(--text-secondary)] text-xs font-mono">{sessionId || 'session_xyz'}</p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <button onClick={handleCopy} className="flex-1 md:flex-none cta-ghost text-sm">
                <Copy className="w-4 h-4" /> Copy Summary
              </button>
              <button onClick={handleExport} className="flex-1 md:flex-none cta-ghost text-sm">
                <Download className="w-4 h-4" /> Export PDF
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
