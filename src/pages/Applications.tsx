import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { Search, MapPin, Calendar, Filter, MoreVertical, ExternalLink, Globe } from "lucide-react";
import type { Doc } from "../../convex/_generated/dataModel";
import AppDetail from "../components/applications/AppDetail";
import { formatDistanceToNow } from "date-fns";
import { cn, formatCurrency } from "../lib/utils";

const STAGE_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  saved:     { label: "Saved",     color: "bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400", dot: "bg-slate-400" },
  applied:   { label: "Applied",   color: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",      dot: "bg-blue-500" },
  interview: { label: "Interview", color: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",  dot: "bg-amber-500" },
  offer:     { label: "Offer",     color: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",   dot: "bg-green-500" },
  rejected:  { label: "Rejected",  color: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",       dot: "bg-red-500" },
};

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-600",
  "bg-purple-100 text-purple-600",
  "bg-teal-100 text-teal-600",
  "bg-rose-100 text-rose-600",
  "bg-amber-100 text-amber-600",
  "bg-indigo-100 text-indigo-600",
];

export default function Applications() {
  const applications = useQuery(api.applications.listApplications);
  const settings = useQuery(api.settings.get);
  const [selected, setSelected] = useState<Doc<"applications"> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  if (applications === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const filteredApps = applications.filter((app: any) => 
    (app.company || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (app.role || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAvatarColor = (name: string) => {
    const charCodeSum = name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return AVATAR_COLORS[charCodeSum % AVATAR_COLORS.length];
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary italic-ish tracking-tight">Applications</h1>
          <p className="text-text-secondary text-sm mt-1">Detailed list of all your active job opportunities.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group max-w-sm w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Filter by company or role..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <button className="p-2 bg-surface border border-border rounded-xl text-text-secondary hover:text-primary transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {filteredApps.length === 0 ? (
        <div className="card-premium py-24 text-center">
          <div className="w-16 h-16 bg-page-bg rounded-full flex items-center justify-center mx-auto mb-4 text-text-muted">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-text-primary">No applications found</h3>
          <p className="text-text-secondary text-sm mt-1">Try adjusting your search query or add a new job.</p>
        </div>
      ) : (
        <div className="card-premium overflow-hidden border-none shadow-premium transition-all">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-page-bg/50 border-b border-border-subtle text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Opportunity</th>
                  <th className="px-6 py-4 font-bold">Source & Location</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Compensation</th>
                  <th className="px-6 py-4 font-bold">Activity</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle bg-surface">
                {filteredApps.map((app: Doc<"applications">) => {
                  const stage = STAGE_CONFIG[app.stage] || STAGE_CONFIG.saved;
                  return (
                    <tr
                      key={app._id}
                      onClick={() => setSelected(app)}
                      className="group hover:bg-page-bg/30 cursor-pointer transition-all duration-200"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm", getAvatarColor(app.company))}>
                            {app.company.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">{app.role}</span>
                            <span className="text-xs text-text-secondary">{app.company}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-xs text-text-primary font-medium">
                            <Globe className="w-3.5 h-3.5 text-text-muted" />
                            {app.source}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-text-secondary">
                            <MapPin className="w-3 h-3" />
                            Remote / On-site
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all", stage.color)}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", stage.dot)} />
                          {stage.label}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
                          {app.salaryMin || app.salaryMax
                            ? `${formatCurrency(app.salaryMin ?? 0, settings?.defaults?.currency)} - ${formatCurrency(app.salaryMax ?? 0, settings?.defaults?.currency)}`
                            : "—"}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-[10px] text-text-primary font-bold">
                            <Calendar className="w-3.5 h-3.5 text-text-muted" />
                            {app.appliedAt ? formatDistanceToNow(app.appliedAt, { addSuffix: true }) : "Not applied yet"}
                          </div>
                          {app.jobUrl && (
                            <a 
                              href={app.jobUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 text-[10px] text-primary hover:underline font-medium"
                            >
                              <ExternalLink className="w-3 h-3" /> External Link
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="p-2 text-text-muted hover:text-text-primary hover:bg-page-bg rounded-lg transition-all opacity-0 group-hover:opacity-100">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && <AppDetail app={filteredApps.find((a: Doc<"applications">) => a._id === selected._id) || selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
