import { useState } from "react";
import type { Doc } from "../../../convex/_generated/dataModel";
import AppCard from "./AppCard";
import { cn } from "../../lib/utils";

const STAGE_STYLES: Record<string, { dot: string }> = {
  saved:      { dot: "bg-slate-500" }, // Mid-tone for visibility on both
  applied:    { dot: "bg-primary" },
  interview:  { dot: "bg-primary" }, 
  offer:      { dot: "bg-green-500" },
  rejected:   { dot: "bg-red-500" },
};

interface Props {
  stage: string;
  label: string;
  apps: Doc<"applications">[];
  onDrop: (stage: string) => void;
  onCardClick: (app: Doc<"applications">) => void;
  onDragStart: (app: Doc<"applications">) => void;
}

export default function KanbanColumn({ stage, label, apps, onDrop, onCardClick, onDragStart }: Props) {
  const [isDragOver, setIsDragOver] = useState(false);
  const style = STAGE_STYLES[stage] || STAGE_STYLES.saved;

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={() => { setIsDragOver(false); onDrop(stage); }}
      className={cn(
        "flex flex-col gap-4 min-w-[280px] flex-1 transition-opacity",
        isDragOver && "opacity-80"
      )}
    >
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={cn("w-1.5 h-1.5 rounded-full", style.dot)} />
          <span className="text-xs font-bold text-text-primary uppercase tracking-wider">{label}</span>
          <span className="text-[10px] font-bold text-text-muted bg-border-subtle px-1.5 py-0.5 rounded-full">{apps.length}</span>
        </div>
      </div>

      <div className={cn(
        "flex flex-col gap-3 p-1.5 min-h-[500px] rounded-2xl transition-all relative",
        isDragOver ? "bg-primary-muted/50 border-2 border-dashed border-primary" : "border-2 border-transparent"
      )}>
        {apps.length === 0 && !isDragOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4 text-center pb-24">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-border flex items-center justify-center mb-3">
              <span className={cn("w-2 h-2 rounded-full", style.dot)} />
            </div>
            <p className="text-xs font-medium text-text-muted">No applications</p>
            <p className="text-[10px] text-text-muted/70 mt-1 max-w-[160px]">Drag applications here to update their status</p>
          </div>
        )}

        {isDragOver && apps.length === 0 && (
          <div className="absolute inset-x-0 top-6 flex items-center justify-center pointer-events-none">
            <p className="text-xs font-bold text-primary bg-surface shadow-sm border border-primary/20 px-3 py-1.5 rounded-lg z-10 transition-transform animate-in fade-in zoom-in duration-200">
              Drop here
            </p>
          </div>
        )}

        {apps.map((app) => (
          <AppCard
            key={app._id}
            app={app}
            onClick={() => onCardClick(app)}
            onDragStart={() => onDragStart(app)}
          />
        ))}
      </div>
    </div>
  );
}


