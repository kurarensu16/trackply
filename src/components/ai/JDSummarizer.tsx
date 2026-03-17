import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

import type { Id } from "../../../convex/_generated/dataModel";

interface Props {
  applicationId: Id<"applications">;
  rawJD?: string;
  onCompleted?: () => void;
}

export default function JDSummarizer({ applicationId, rawJD, onCompleted }: Props) {
  const summarize = useAction(api.ai.summarizeJD);
  const detectGaps = useAction(api.ai.detectSkillGaps);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    overview: string;
    responsibilities: string[];
    requiredSkills: string[];
  } | null>(null);

  const handleAnalyze = async () => {
    if (!rawJD) return;
    setLoading(true);
    setError(null);
    try {
      const summary = await summarize({ applicationId, rawJD });
      setResult(summary);
      
      // Auto-detect skill gaps after summarization
      await detectGaps({ applicationId });
      
      if (onCompleted) onCompleted();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!rawJD) {
    return (
      <div className="p-8 bg-surface-muted rounded-2xl border border-dashed border-border-subtle text-center space-y-3">
        <p className="text-sm text-text-secondary leading-relaxed tracking-tight">Paste a job description in the form to enable AI analysis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!result && !loading && (
        <button
          onClick={handleAnalyze}
          className="w-full py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          Analyze with Groq AI
        </button>
      )}

      {loading && (
        <div className="p-12 bg-surface border border-border rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <div>
            <p className="text-sm font-bold text-text-primary">Groq is analyzing...</p>
            <p className="text-xs text-text-secondary mt-1">Extracting key insights and matching your skills.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-6 bg-surface-muted border border-border-subtle rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-2 duration-500 shadow-sm">
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Analysis Complete</span>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Overview</h4>
            <p className="text-sm text-text-primary leading-relaxed">{result.overview}</p>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Key Responsibilities</h4>
            <ul className="space-y-3">
              {result.responsibilities.map((r, i) => (
                <li key={i} className="flex gap-3 text-sm text-text-primary leading-snug">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/30 mt-1.5 flex-shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Required Skills</h4>
            <div className="flex flex-wrap gap-2">
              {result.requiredSkills.map((s) => (
                <span 
                  key={s} 
                  className="px-2.5 py-1 bg-primary-muted text-primary text-[10px] font-bold rounded-lg border border-primary/10 transition-transform hover:scale-105 shadow-sm"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
