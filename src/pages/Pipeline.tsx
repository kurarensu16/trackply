import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useRef } from "react";
import { Search } from "lucide-react";
import { cn } from "../lib/utils";
import type { Doc } from "../../convex/_generated/dataModel";
import KanbanColumn from "../components/pipeline/KanbanColumn";
import AppDetail from "../components/applications/AppDetail";

const STAGES: { key: string; label: string }[] = [
  { key: "saved",     label: "Saved" },
  { key: "applied",   label: "Applied" },
  { key: "interview", label: "Interview" },
  { key: "offer",     label: "Offer" },
];

export default function Pipeline() {
  const applications = useQuery(api.applications.listApplications);
  const updateApplication = useMutation(api.applications.updateApplication);

  const [selected, setSelected] = useState<Doc<"applications"> | null>(null);
  const dragging = useRef<Doc<"applications"> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("saved");

  if (applications === undefined) {
    return null;
  }

  const filteredApplications = (applications ?? []).filter((a: Doc<"applications">) =>
    a.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const byStage = (stage: string) => filteredApplications.filter((a: Doc<"applications">) => a.stage === stage);

  const handleDrop = async (stage: string) => {
    if (!dragging.current || dragging.current.stage === stage) return;
    await updateApplication({
      id: dragging.current._id,
      stage: stage as Doc<"applications">["stage"],
    });
    dragging.current = null;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary italic-ish tracking-tight">Pipeline</h1>
          <p className="text-text-secondary text-sm mt-1">Manage your application stages and track your progress.</p>
        </div>
        
        <div className="relative group w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search company or role..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      <div className="flex md:hidden bg-surface p-1.5 rounded-xl mb-2 gap-1 overflow-x-auto custom-scrollbar border border-border sticky top-4 z-10 shadow-sm">
        {STAGES.map(({ key, label }) => {
          const count = byStage(key).length;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex-1 py-2 px-4 text-xs font-bold rounded-lg transition-all whitespace-nowrap flex items-center justify-center gap-2",
                activeTab === key 
                  ? "bg-primary text-white shadow-md" 
                  : "text-text-secondary hover:text-text-primary hover:bg-page-bg"
              )}
            >
              {label}
              <span className={cn(
                "px-1.5 py-0.5 rounded-md text-[10px]",
                activeTab === key ? "bg-white/20 text-white" : "bg-border-subtle text-text-muted"
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex xl:gap-6 gap-4 overflow-x-auto pb-6 -mx-1 px-1 custom-scrollbar snap-x snap-mandatory md:snap-none">
        {STAGES.map(({ key, label }) => (
          <div 
            key={key} 
            className={cn(
              "h-full flex-1 snap-center md:snap-align-none transition-all duration-300",
              activeTab === key ? "block min-w-full md:min-w-0" : "hidden md:block"
            )}
          >
            <KanbanColumn
              stage={key}
              label={label}
              apps={byStage(key)}
              onDrop={handleDrop}
              onCardClick={setSelected}
              onDragStart={(app) => { dragging.current = app; }}
            />
          </div>
        ))}
      </div>

      {selected && (
        <AppDetail
          app={applications.find((a: Doc<"applications">) => a._id === selected._id) || (selected as Doc<"applications">)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}


