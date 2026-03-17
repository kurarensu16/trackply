import { AlertTriangle, BookOpen } from "lucide-react";

interface Props {
  skillGaps?: string[];
}

export default function SkillGapPanel({ skillGaps }: Props) {
  if (!skillGaps || skillGaps.length === 0) return null;

  return (
    <div className="p-5 bg-[#FFF7ED] dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-2xl space-y-4">
      <div className="flex items-center gap-2 text-[#C2410C] dark:text-orange-400">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Learning Opportunities</span>
      </div>

      <p className="text-xs text-text-secondary leading-relaxed font-medium">
        This role requires skills that aren't yet in your profile. Mastering these could boost your chances:
      </p>

      <div className="flex flex-wrap gap-2">
        {skillGaps.map((skill) => (
          <span 
            key={skill} 
            className="px-2.5 py-1 bg-white dark:bg-surface-muted text-[#EA580C] dark:text-orange-400 text-[10px] font-bold rounded-lg border border-orange-100 dark:border-orange-500/20 shadow-sm transition-transform hover:scale-105"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="pt-2 flex items-center gap-1.5 text-[10px] text-amber-600/60 dark:text-orange-400/60 font-bold uppercase tracking-widest">
        <BookOpen className="w-3 h-3" />
        Focus Area: {skillGaps[0]}
      </div>
    </div>
  );
}
