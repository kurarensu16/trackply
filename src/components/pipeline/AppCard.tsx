import type { Doc } from "../../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Sparkles, AlertCircle, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn, formatCurrency } from "../../lib/utils";

interface Props {
  app: Doc<"applications">;
  onClick: () => void;
  onDragStart: () => void;
}

const getCompanyStyles = (name: string) => {
  const colors = [
    "bg-blue-100/50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200/50 dark:border-blue-500/20",
    "bg-indigo-100/50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-500/20",
    "bg-purple-100/50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200/50 dark:border-purple-500/20",
    "bg-pink-100/50 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400 border-pink-200/50 dark:border-pink-500/20",
    "bg-rose-100/50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200/50 dark:border-rose-500/20",
    "bg-orange-100/50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border-orange-200/50 dark:border-orange-500/20",
    "bg-green-100/50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-200/50 dark:border-green-500/20",
    "bg-teal-100/50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400 border-teal-200/50 dark:border-teal-500/20",
  ];
  const charSum = name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const colorIndex = charSum % colors.length;
  
  return {
    initial: name.charAt(0).toUpperCase(),
    colorClass: colors[colorIndex],
  };
};

const STAGE_RING_COLORS: Record<string, string> = {
  saved:      "border-l-slate-400 hover:border-slate-400",
  applied:    "border-l-primary hover:border-primary",
  interview:  "border-l-primary hover:border-primary",
  offer:      "border-l-green-500 hover:border-green-500",
  rejected:   "border-l-red-400 hover:border-red-400",
};

export default function AppCard({ app, onClick, onDragStart }: Props) {
  const settings = useQuery(api.settings.get);
  const hasSkillGaps = app.skillGaps && app.skillGaps.length > 0;
  
  const timeAgo = app._creationTime ? formatDistanceToNow(new Date(app._creationTime), { addSuffix: true }) : "recently";
  
  const companyStyle = getCompanyStyles(app.company);
  const ringColor = STAGE_RING_COLORS[app.stage] || STAGE_RING_COLORS.saved;
  
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className={cn(
        "bg-white dark:bg-surface border border-slate-100 dark:border-border border-l-4 rounded-2xl p-4 cursor-pointer shadow-sm hover:shadow-premium-hover transition-all select-none group",
        ringColor
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl border flex items-center justify-center overflow-hidden font-bold text-lg shadow-sm transition-transform group-hover:scale-105",
            companyStyle.colorClass
          )}>
            {companyStyle.initial}
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-text-primary font-geist leading-tight group-hover:text-primary transition-colors">{app.company}</h4>
            <p className="text-[11px] text-text-secondary font-medium tracking-tight mt-0.5">{app.role}</p>
          </div>
        </div>
        <span className="text-[10px] text-text-muted font-bold whitespace-nowrap">{timeAgo}</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {app.aiSummary && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/5 text-primary text-[10px] font-bold border border-primary/10 shadow-sm">
            <Sparkles className="w-2.5 h-2.5" />
            AI
          </div>
        )}
        {hasSkillGaps && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-200 text-[10px] font-bold border border-amber-100 dark:border-amber-800/50 shadow-sm">
            <AlertCircle className="w-2.5 h-2.5" />
            Skill Gap
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-border-subtle">
        <div className="text-[11px] font-bold text-text-secondary">
          {app.salaryMin || app.salaryMax ? (
            `${formatCurrency(app.salaryMin ?? 0, settings?.defaults?.currency)} - ${formatCurrency(app.salaryMax ?? 0, settings?.defaults?.currency)}`
          ) : (
            "Salary N/A"
          )}
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-surface border border-slate-100 dark:border-border text-text-secondary text-[10px] font-bold shadow-sm">
          <FileText className="w-2.5 h-2.5 text-primary/60" />
          {app.source}
        </div>
      </div>
    </div>
  );
}


