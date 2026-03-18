import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { formatDistanceToNow } from "date-fns";
import { 
  Plus, ArrowRight, Pencil, Sparkles, Trash2, StickyNote, 
  Clock, ChevronDown, ChevronUp 
} from "lucide-react";
import { useState } from "react";
import { cn } from "../../lib/utils";

const TYPE_CONFIG: Record<string, { icon: typeof Plus; color: string; bg: string; label: string }> = {
  created:      { icon: Plus,       color: "text-green-600 dark:text-green-400",  bg: "bg-green-50 dark:bg-green-500/10",  label: "Created" },
  stage_change: { icon: ArrowRight, color: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-50 dark:bg-blue-500/10",    label: "Stage Change" },
  note_updated: { icon: StickyNote, color: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-50 dark:bg-amber-500/10",  label: "Note Updated" },
  ai_analysis:  { icon: Sparkles,   color: "text-purple-600 dark:text-purple-400",bg: "bg-purple-50 dark:bg-purple-500/10",label: "AI Analysis" },
  edited:       { icon: Pencil,     color: "text-primary",                         bg: "bg-primary-muted",                  label: "Edited" },
  deleted:      { icon: Trash2,     color: "text-red-600 dark:text-red-400",      bg: "bg-red-50 dark:bg-red-500/10",      label: "Deleted" },
};

interface Props {
  applicationId: Id<"applications">;
}

export default function ActivityTimeline({ applicationId }: Props) {
  const activities = useQuery(api.activities.listByApplication, { applicationId });
  const [expanded, setExpanded] = useState(false);

  if (!activities || activities.length === 0) {
    return (
      <div className="p-6 bg-surface-muted rounded-2xl border border-dashed border-border-subtle text-center">
        <Clock className="w-5 h-5 text-text-muted mx-auto mb-2" />
        <p className="text-xs text-text-secondary font-medium">No activity recorded yet.</p>
      </div>
    );
  }

  const visibleActivities = expanded ? activities : activities.slice(0, 4);
  const hasMore = activities.length > 4;

  return (
    <div className="space-y-1">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[17px] top-4 bottom-4 w-px bg-border" />

        <div className="space-y-0">
          {visibleActivities.map((activity: any, index: number) => {
            const config = TYPE_CONFIG[activity.type] || TYPE_CONFIG.edited;
            const Icon = config.icon;
            const isFirst = index === 0;

            return (
              <div
                key={activity._id}
                className={cn(
                  "relative flex items-start gap-3 py-3 px-1 rounded-xl transition-all",
                  isFirst && "bg-surface-muted"
                )}
              >
                {/* Icon dot */}
                <div className={cn(
                  "relative z-10 flex-shrink-0 w-[34px] h-[34px] rounded-xl flex items-center justify-center border border-transparent shadow-sm",
                  config.bg,
                  isFirst && "ring-2 ring-primary/20"
                )}>
                  <Icon className={cn("w-3.5 h-3.5", config.color)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-1">
                  <p className={cn(
                    "text-xs leading-snug",
                    isFirst ? "font-bold text-text-primary" : "font-medium text-text-secondary"
                  )}>
                    {activity.description}
                  </p>
                  <p className="text-[10px] text-text-muted mt-0.5 font-medium">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>

                {/* Stage badge for stage changes */}
                {activity.type === "stage_change" && activity.metadata?.toStage && (
                  <span className="flex-shrink-0 px-2 py-0.5 bg-primary-muted text-primary text-[9px] font-bold rounded-full uppercase tracking-wider mt-1">
                    {activity.metadata.toStage}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Show more / less toggle */}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold text-primary hover:text-primary-hover transition-colors uppercase tracking-wider"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3 h-3" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" />
              Show {activities.length - 4} More
            </>
          )}
        </button>
      )}
    </div>
  );
}
