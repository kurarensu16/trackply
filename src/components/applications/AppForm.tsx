import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { X, Building2, Briefcase, Link as LinkIcon, Globe, CircleDollarSign, StickyNote, Plus } from "lucide-react";
import type { Doc } from "../../../convex/_generated/dataModel";


type Stage = "saved" | "applied" | "interview" | "offer" | "rejected";
type Source = "OnlineJobs.ph" | "LinkedIn" | "Referral" | "Other";

const STAGES: { value: Stage; label: string }[] = [
  { value: "saved", label: "Saved" },
  { value: "applied", label: "Applied" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
];

const SOURCES: Source[] = ["OnlineJobs.ph", "LinkedIn", "Referral", "Other"];

interface Props {
  onClose: () => void;
  existing?: Doc<"applications">;
}

export default function AppForm({ onClose, existing }: Props) {
  const createApplication = useMutation(api.applications.createApplication);
  const updateApplication = useMutation(api.applications.updateApplication);
  const settings = useQuery(api.settings.get);

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [source, setSource] = useState<Source>("LinkedIn");
  const [stage, setStage] = useState<Stage>("saved");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [notes, setNotes] = useState("");
  const [rawJD, setRawJD] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existing) {
      setCompany(existing.company);
      setRole(existing.role);
      setJobUrl(existing.jobUrl ?? "");
      setSource((existing.source as Source) ?? "LinkedIn");
      setStage(existing.stage as Stage);
      setSalaryMin(existing.salaryMin?.toString() ?? "");
      setSalaryMax(existing.salaryMax?.toString() ?? "");
      setNotes(existing.notes ?? "");
      setRawJD(existing.rawJD ?? "");
    }
  }, [existing]);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      company,
      role,
      jobUrl: jobUrl || undefined,
      source,
      stage,
      salaryMin: salaryMin ? Number(salaryMin) : undefined,
      salaryMax: salaryMax ? Number(salaryMax) : undefined,
      notes: notes || undefined,
      rawJD: rawJD || undefined,
      appliedAt: stage === "applied" ? Date.now() : undefined,
    };
    try {
      if (existing) {
        await updateApplication({ id: existing._id, ...payload });
      } else {
        await createApplication(payload);
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Drawer */}
      <div className="relative bg-surface w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between px-8 py-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                {existing ? "Edit Application" : "New Application"}
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">Fill in the details below to track your progress.</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-text-muted hover:text-text-primary hover:bg-page-bg rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 px-8 py-8 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Company & Role Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">Company Information</label>
              <div className="relative group">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                <input
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Google, Stripe, etc."
                  className="w-full bg-page-bg border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="relative group">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
              <input
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full bg-page-bg border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="h-[1px] bg-border-subtle" />

          {/* Job Details */}
          <div className="space-y-4">
            <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">Job Details</label>
            <div className="relative group">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="Job listing URL (https://...)"
                className="w-full bg-page-bg border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as Source)}
                  className="w-full bg-page-bg border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                >
                  {SOURCES.map((s) => <option key={s} className="bg-surface">{s}</option>)}
                </select>
              </div>
              <div className="relative group px-1 flex items-center bg-page-bg border border-border rounded-xl">
                <div className="w-1.5 h-1.5 rounded-full bg-primary ml-2 mr-3" />
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as Stage)}
                  className="flex-1 bg-transparent py-3 text-sm text-text-primary outline-none cursor-pointer appearance-none pr-4"
                >
                  {STAGES.map((s) => (
                    <option key={s.value} value={s.value} className="bg-surface capitalize">
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="h-[1px] bg-border-subtle" />

          {/* Salary & Notes */}
          <div className="space-y-4">
            <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">Compensation & Notes</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <CircleDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="number"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder={`Min (${settings?.defaults?.currency || "$"})`}
                  className="w-full bg-page-bg border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div className="relative group">
                <CircleDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="number"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  placeholder={`Max (${settings?.defaults?.currency || "$"})`}
                  className="w-full bg-page-bg border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="relative group">
              <StickyNote className="absolute left-3 top-4 w-4 h-4 text-text-muted group-focus-within:text-primary" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about the role, interview process, or company culture..."
                rows={3}
                className="w-full bg-page-bg border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              />
            </div>

            <div className="relative group">
              <Plus className="absolute left-3 top-4 w-4 h-4 text-text-muted group-focus-within:text-primary" />
              <textarea
                value={rawJD}
                onChange={(e) => setRawJD(e.target.value)}
                placeholder="Paste the full Job Description here for AI analysis..."
                rows={4}
                className="w-full bg-page-bg border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              />
            </div>
          </div>
        </form>

        <div className="p-8 border-t border-border bg-surface">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full btn-primary py-4 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {loading ? "Saving..." : existing ? "Update Application" : "Create Application"}
          </button>
        </div>
      </div>
    </div>
  );
}

