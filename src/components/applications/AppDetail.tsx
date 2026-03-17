import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { X, Pencil, Trash2, ExternalLink, Calendar, Sparkles, Clock, CalendarCheck, Target, Maximize2, Minimize2 } from "lucide-react";
import type { Doc } from "../../../convex/_generated/dataModel";
import AppForm from "./AppForm";
import JDSummarizer from "../ai/JDSummarizer";
import SkillGapPanel from "../ai/SkillGapPanel";
import ActivityTimeline from "./ActivityTimeline";
import InterviewSection from "../interviews/InterviewSection";
import InterviewPrep from "../ai/InterviewPrep";
import { cn, formatCurrency } from "../../lib/utils";

const STAGE_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  saved:     { label: "Saved",     color: "bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400", dot: "bg-slate-400" },
  applied:   { label: "Applied",   color: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",      dot: "bg-blue-500" },
  interview: { label: "Interview", color: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",  dot: "bg-amber-500" },
  offer:     { label: "Offer",     color: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",   dot: "bg-green-500" },
  rejected:  { label: "Rejected",  color: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",       dot: "bg-red-500" },
};

interface Props {
  app: Doc<"applications">;
  onClose: () => void;
}

export default function AppDetail({ app, onClose }: Props) {
  const deleteApplication = useMutation(api.applications.deleteApplication);
  const settings = useQuery(api.settings.get);
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleDelete = async () => {
    await deleteApplication({ id: app._id });
    onClose();
  };

  if (editing) {
    return <AppForm existing={app} onClose={() => setEditing(false)} />;
  }

  const stage = STAGE_CONFIG[app.stage] || STAGE_CONFIG.saved;

  return (
    <div className="fixed inset-0 z-[101] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className={cn(
        "relative bg-surface h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden transition-all",
        isFullScreen ? "w-full max-w-full" : "w-full max-w-md"
      )}>
        {/* Header */}
        <div className="px-8 py-8 border-b border-border bg-white dark:bg-sidebar/30">
          <div className={cn("flex flex-col gap-4", isFullScreen && "max-w-5xl mx-auto w-full")}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shadow-sm">
                  {app.company.charAt(0)}
                </div>
                <div>
                  <h2 className={cn("font-bold text-text-primary leading-tight font-geist tracking-tight", isFullScreen ? "text-2xl" : "text-lg")}>{app.role}</h2>
                  <p className={cn("text-text-secondary font-medium", isFullScreen ? "text-base" : "text-sm")}>{app.company}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsFullScreen(!isFullScreen)} 
                  className="p-2 text-text-muted hover:text-primary hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all"
                  title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                >
                  {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button 
                  onClick={() => setEditing(true)} 
                  className="p-2 text-text-muted hover:text-primary hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all"
                  title="Edit Application"
                >
                  <Pencil size={18} />
                </button>
                <button 
                  onClick={onClose} 
                  className="p-2 text-text-muted hover:text-text-primary hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm border border-transparent transition-all", stage.color)}>
                <span className={cn("w-1.5 h-1.5 rounded-full ring-2 ring-white/20", stage.dot)} />
                {stage.label}
              </span>
              <span className="bg-surface/50 dark:bg-slate-800/40 border border-border text-text-secondary px-3 py-1 rounded-full text-[10px] font-bold shadow-sm font-geist">
                {app.source}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-8 py-6 overflow-y-auto custom-scrollbar">
          <div className={cn("space-y-8", isFullScreen && "max-w-5xl mx-auto w-full py-8")}>
            {/* Quick Info Grid */}
            <div className={cn("grid gap-4", isFullScreen ? "grid-cols-4" : "grid-cols-2")}>
              <div className="p-5 bg-surface-muted rounded-2xl border border-border-subtle shadow-sm transition-all hover:shadow-md">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" /> Date Applied
                </p>
                <p className="text-sm font-bold text-text-primary">
                  {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "Not applied yet"}
                </p>
              </div>
              <div className="p-5 bg-surface-muted rounded-2xl border border-border-subtle shadow-sm transition-all hover:shadow-md">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" /> Salary Range
                </p>
                <p className="text-sm font-bold text-text-primary">
                  {app.salaryMin || app.salaryMax
                    ? `${formatCurrency(app.salaryMin ?? 0, settings?.defaults?.currency)} - ${formatCurrency(app.salaryMax ?? 0, settings?.defaults?.currency)}`
                    : "—"}
                </p>
              </div>
              {isFullScreen && (
                <>
                  <div className="p-5 bg-surface-muted rounded-2xl border border-border-subtle shadow-sm transition-all hover:shadow-md">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5 text-primary" /> Platform
                    </p>
                    <p className="text-sm font-bold text-text-primary capitalize">{app.source}</p>
                  </div>
                  <div className="p-5 bg-surface-muted rounded-2xl border border-border-subtle shadow-sm transition-all hover:shadow-md">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-primary" /> Stage
                    </p>
                    <p className="text-sm font-bold text-text-primary capitalize">{app.stage}</p>
                  </div>
                </>
              )}
            </div>

            {/* AI Analysis Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                < Sparkles className="w-3.5 h-3.5 text-primary" /> AI Insights
              </h3>
              
              <SkillGapPanel skillGaps={app.skillGaps} />

              {app.aiSummary ? (
                <div className="space-y-6 bg-surface-muted rounded-2xl p-6 border border-border-subtle shadow-sm">
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Job Overview</h4>
                    <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">{app.aiSummary.overview}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {app.aiSummary.requiredSkills.map((s) => (
                        <span key={s} className="px-2.5 py-1 bg-primary-muted text-primary text-[10px] font-bold rounded-lg border border-primary/10 shadow-sm transition-transform hover:scale-105">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <JDSummarizer applicationId={app._id} rawJD={app.rawJD} />
              )}
            </div>

            <div className="h-[1px] bg-border-subtle" />

            {/* AI Interview Prep */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-primary" /> Interview Prep
              </h3>
              <InterviewPrep 
                applicationId={app._id} 
                interviewPrep={(app as any).interviewPrep} 
                hasJD={!!app.rawJD} 
              />
            </div>

            <div className="h-[1px] bg-border-subtle" />

            {/* Content Split for Full Screen */}
            <div className={cn("grid gap-8", isFullScreen ? "grid-cols-2" : "grid-cols-1")}>
              {/* Left Column in split */}
              <div className="space-y-8">
                {/* Interviews */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                    <CalendarCheck className="w-3.5 h-3.5 text-primary" /> Interviews
                  </h3>
                  <InterviewSection applicationId={app._id} />
                </div>

                {/* Personnal Notes */}
                {app.notes && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-[0.2em]">Personal Notes</h3>
                    <div className="p-5 bg-surface-muted rounded-2xl border border-border-subtle shadow-sm italic">
                      <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">"{app.notes}"</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column in split */}
              <div className="space-y-8">
                {/* Activity History */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-primary" /> Activity History
                  </h3>
                  <ActivityTimeline applicationId={app._id} />
                </div>

                {/* Links */}
                {app.jobUrl && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-[0.2em]">External Link</h3>
                    <a
                      href={app.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 w-fit px-4 py-2 bg-surface border border-border text-primary text-xs font-bold rounded-xl hover:bg-page-bg transition-all"
                    >
                      <ExternalLink size={14} /> View Job Posting
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-8 border-t border-border bg-surface dark:bg-sidebar/30">
          <div className={cn(isFullScreen && "max-w-5xl mx-auto w-full")}>
            {confirming ? (
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-100 dark:border-red-500/20 animate-in fade-in zoom-in-95 duration-200">
                <p className="text-xs font-bold text-red-600 dark:text-red-400">Delete application?</p>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setConfirming(false)} 
                    className="px-3 py-1.5 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDelete} 
                    className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirming(true)}
                className="flex items-center gap-2 text-xs font-bold text-text-muted hover:text-red-500 transition-all group"
              >
                <div className="p-1.5 rounded-lg group-hover:bg-red-50 dark:group-hover:bg-red-500/10 transition-colors">
                  <Trash2 size={14} />
                </div>
                Delete Application Record
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

