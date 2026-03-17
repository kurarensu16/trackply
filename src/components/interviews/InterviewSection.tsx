import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { format, formatDistanceToNow, isPast } from "date-fns";
import {
  Plus, Calendar, MapPin, Video, Phone, Users,
  Code, MessageSquare, ChevronDown, ChevronUp,
  Check, X, Trash2, FileText
} from "lucide-react";
import { cn } from "../../lib/utils";

const TYPE_CONFIG: Record<string, { icon: typeof Phone; label: string; color: string; bg: string }> = {
  phone:       { icon: Phone,         label: "Phone Screen",    color: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-50 dark:bg-blue-500/10" },
  video:       { icon: Video,         label: "Video Call",      color: "text-purple-600 dark:text-purple-400",bg: "bg-purple-50 dark:bg-purple-500/10" },
  onsite:      { icon: MapPin,        label: "On-site",         color: "text-green-600 dark:text-green-400",  bg: "bg-green-50 dark:bg-green-500/10" },
  technical:   { icon: Code,          label: "Technical",       color: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-50 dark:bg-amber-500/10" },
  behavioral:  { icon: MessageSquare, label: "Behavioral",      color: "text-pink-600 dark:text-pink-400",    bg: "bg-pink-50 dark:bg-pink-500/10" },
  other:       { icon: Users,         label: "Other",           color: "text-text-secondary",                  bg: "bg-border-subtle" },
};

interface Props {
  applicationId: Id<"applications">;
}

export default function InterviewSection({ applicationId }: Props) {
  const interviews = useQuery(api.interviews.listByApplication, { applicationId });
  const createInterview = useMutation(api.interviews.createInterview);
  const updateInterview = useMutation(api.interviews.updateInterview);
  const deleteInterview = useMutation(api.interviews.deleteInterview);

  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [type, setType] = useState<string>("video");
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("10:00");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [prepNotes, setPrepNotes] = useState("");

  const resetForm = () => {
    setTitle(""); setType("video"); setDateStr(""); setTimeStr("10:00");
    setLocation(""); setNotes(""); setPrepNotes("");
    setShowForm(false);
  };

  const handleCreate = async () => {
    if (!title || !dateStr) return;
    const scheduledAt = new Date(`${dateStr}T${timeStr}`).getTime();
    await createInterview({
      applicationId,
      title,
      type: type as any,
      scheduledAt,
      location: location || undefined,
      notes: notes || undefined,
      prepNotes: prepNotes || undefined,
    });
    resetForm();
  };

  const handleStatusChange = async (id: Id<"interviews">, status: "completed" | "cancelled") => {
    await updateInterview({ id, status });
  };

  return (
    <div className="space-y-4">
      {/* Interview List */}
      {interviews && interviews.length > 0 ? (
        <div className="space-y-3">
          {interviews.map((interview) => {
            const config = TYPE_CONFIG[interview.type] || TYPE_CONFIG.other;
            const Icon = config.icon;
            const isExpanded = expandedId === interview._id;
            const isUpcoming = interview.status === "upcoming";
            const overdue = isUpcoming && isPast(new Date(interview.scheduledAt));

            return (
              <div
                key={interview._id}
                className={cn(
                  "bg-surface-muted rounded-2xl border border-border-subtle shadow-sm overflow-hidden transition-all",
                  overdue && isUpcoming && "border-red-200 dark:border-red-500/30"
                )}
              >
                {/* Header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : interview._id)}
                  className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-page-bg transition-colors"
                >
                  <div className={cn("p-2 rounded-xl flex-shrink-0", config.bg)}>
                    <Icon className={cn("w-3.5 h-3.5", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-text-primary truncate">{interview.title}</p>
                    <p className={cn(
                      "text-[10px] font-medium mt-0.5",
                      overdue && isUpcoming ? "text-red-500" : "text-text-muted"
                    )}>
                      {format(new Date(interview.scheduledAt), "MMM d, yyyy · h:mm a")}
                      {isUpcoming && (
                        <span className="ml-1.5">
                          · {overdue ? "Overdue" : formatDistanceToNow(new Date(interview.scheduledAt), { addSuffix: true })}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                      interview.status === "upcoming" ? "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10" :
                      interview.status === "completed" ? "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-500/10" :
                      "text-text-muted bg-border-subtle"
                    )}>
                      {interview.status}
                    </span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-text-muted" /> : <ChevronDown className="w-3.5 h-3.5 text-text-muted" />}
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-border-subtle pt-3 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex items-center gap-4 text-[10px]">
                      <span className={cn("font-bold px-2 py-0.5 rounded-md", config.bg, config.color)}>
                        {config.label}
                      </span>
                      {interview.location && (
                        <span className="flex items-center gap-1 text-text-muted font-medium">
                          <MapPin className="w-3 h-3" /> {interview.location}
                        </span>
                      )}
                    </div>

                    {interview.notes && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Notes</p>
                        <p className="text-xs text-text-secondary leading-relaxed">{interview.notes}</p>
                      </div>
                    )}

                    {interview.prepNotes && (
                      <div className="space-y-1 p-3 bg-amber-50/50 dark:bg-amber-500/5 rounded-xl border border-amber-100 dark:border-amber-500/20">
                        <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1">
                          <FileText className="w-3 h-3" /> Prep Notes
                        </p>
                        <p className="text-xs text-text-secondary leading-relaxed">{interview.prepNotes}</p>
                      </div>
                    )}

                    {isUpcoming && (
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleStatusChange(interview._id, "completed")}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-bold rounded-lg hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors"
                        >
                          <Check className="w-3 h-3" /> Complete
                        </button>
                        <button
                          onClick={() => handleStatusChange(interview._id, "cancelled")}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-border-subtle text-text-muted text-[10px] font-bold rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" /> Cancel
                        </button>
                        <button
                          onClick={() => deleteInterview({ id: interview._id })}
                          className="ml-auto flex items-center gap-1 px-2 py-1.5 text-text-muted text-[10px] font-bold rounded-lg hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : !showForm ? (
        <div className="p-6 bg-surface-muted rounded-2xl border border-dashed border-border-subtle text-center">
          <Calendar className="w-5 h-5 text-text-muted mx-auto mb-2" />
          <p className="text-xs text-text-secondary font-medium">No interviews scheduled yet.</p>
        </div>
      ) : null}

      {/* Add Interview Form */}
      {showForm ? (
        <div className="bg-surface-muted rounded-2xl border border-border-subtle p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Schedule Interview</h4>

          <input
            type="text"
            placeholder="Interview title (e.g. Round 1 Technical)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 block">Date</label>
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 block">Time</label>
              <input
                type="time"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 block">Type</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setType(key)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all",
                    type === key
                      ? "border-primary bg-primary-muted text-primary"
                      : "border-border-subtle bg-surface text-text-muted hover:border-primary/30"
                  )}
                >
                  <config.icon className="w-3 h-3" />
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          <input
            type="text"
            placeholder="Location / Meeting link (optional)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />

          <textarea
            placeholder="Preparation notes — topics to review, questions to ask..."
            value={prepNotes}
            onChange={(e) => setPrepNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
          />

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleCreate}
              disabled={!title || !dateStr}
              className="flex-1 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              Schedule Interview
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2.5 text-text-muted text-xs font-bold rounded-xl hover:bg-page-bg transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 border-2 border-dashed border-border-subtle rounded-2xl text-xs font-bold text-text-muted hover:text-primary hover:border-primary/30 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-3.5 h-3.5" /> Schedule Interview
        </button>
      )}
    </div>
  );
}
