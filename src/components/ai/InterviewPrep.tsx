import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { 
  Sparkles, 
  Loader2, 
  HelpCircle, 
  MessageSquare, 
  Target, 
  ChevronRight,
  CheckCircle2
} from "lucide-react";


interface Props {
  applicationId: string;
  interviewPrep?: {
    questions: {
      question: string;
      rationale: string;
      suggestedPoint: string;
    }[];
    smartQuestions: string[];
    strategy: string;
  };
  hasJD: boolean;
}

export default function InterviewPrep({ applicationId, interviewPrep, hasJD }: Props) {
  const generatePrep = useAction(api.ai.generateInterviewPrep);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      await generatePrep({ applicationId: applicationId as any });
    } catch (err: any) {
      setError(err.message || "Failed to generate prep kit");
    } finally {
      setLoading(false);
    }
  };

  if (!hasJD) {
    return (
      <div className="bg-surface-muted rounded-2xl p-6 border border-border-subtle text-center">
        <HelpCircle className="w-8 h-8 text-text-muted mx-auto mb-3 opacity-50" />
        <p className="text-xs text-text-secondary font-medium">
          Paste the Job Description in the Details tab to enable AI Interview Prep.
        </p>
      </div>
    );
  }

  if (!interviewPrep) {
    return (
      <div className="bg-surface-muted rounded-2xl p-8 border border-border-subtle text-center">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-6 h-6 text-primary" />
        </div>
        <h4 className="text-sm font-bold text-text-primary mb-2">Ready for your interview?</h4>
        <p className="text-[11px] text-text-secondary mb-6 max-w-[240px] mx-auto leading-relaxed">
          Generate a tailored prep kit with likely questions and a custom strategy based on your profile.
        </p>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="btn-primary w-full py-3 text-[11px] font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {loading ? "Analyzing Context..." : "Generate Prep Kit"}
        </button>
        {error && <p className="text-[10px] text-red-500 mt-3 font-medium">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Strategy Card */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Target className="w-16 h-16 text-primary" />
        </div>
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-primary" />
          <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest">Winning Strategy</h4>
        </div>
        <p className="text-xs text-text-primary font-medium leading-relaxed relative z-10">
          {interviewPrep.strategy}
        </p>
      </div>

      {/* Likely Questions */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
          <HelpCircle className="w-3.5 h-3.5" /> Likely Interview Questions
        </h4>
        <div className="space-y-3">
          {interviewPrep.questions.map((q, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-all group">
              <div className="flex gap-3">
                <span className="text-[10px] font-black text-primary/40 mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                <div className="space-y-3">
                  <p className="text-xs font-bold text-text-primary leading-snug group-hover:text-primary transition-colors">{q.question}</p>
                  
                  <div className="space-y-2.5 pt-2 border-t border-border-subtle">
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-tight mb-0.5">Rationale</p>
                        <p className="text-[10px] text-text-muted leading-relaxed">{q.rationale}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-tight mb-0.5">Your Response Angle</p>
                        <p className="text-[10px] text-text-primary font-medium leading-relaxed italic">"{q.suggestedPoint}"</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Questions for the Interviewer */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5" /> Questions to Ask Them
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {interviewPrep.smartQuestions.map((q, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-surface-muted border border-border-subtle rounded-xl group transition-all hover:bg-surface">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <p className="text-[11px] text-text-primary font-medium flex-1">{q}</p>
              <ChevronRight className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>

      {/* Polish/Disclaimer */}
      <div className="pt-6 flex items-center justify-center gap-2 text-[9px] text-text-muted font-bold uppercase tracking-widest opacity-40">
        <Sparkles className="w-3 h-3" /> AI-Generated Interview Protocol
      </div>
    </div>
  );
}
