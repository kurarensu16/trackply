import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  User, 
  Sparkles, 
  Palette, 
  Database, 
  Save, 
  Loader2,
  Check,
  Moon,
  Sun,
  Monitor,
  ChevronRight,
  ShieldCheck,
  Clock,
  ExternalLink,
  X,
  Plus as PlusIcon,
  Camera,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { cn } from "../lib/utils";

type Tab = "profile" | "ai" | "appearance" | "data";

// ── Reusable Professional UI Components ──────────────────

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="pb-4 border-b border-border mb-6">
      <h3 className="text-sm font-semibold text-text-primary tracking-tight">{title}</h3>
      {description && <p className="text-xs text-text-secondary mt-1">{description}</p>}
    </div>
  );
}

function FormRow({ label, description, children, align = "center" }: { 
  label: string; description?: string; children: React.ReactNode; align?: "center" | "top" 
}) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 py-6 first:pt-0", align === "top" ? "items-start" : "items-center")}>
      <div className="md:col-span-1">
        <label className="text-xs font-semibold text-text-primary tracking-wide block">{label}</label>
        {description && <p className="text-[11px] text-text-muted mt-1 leading-relaxed">{description}</p>}
      </div>
      <div className="md:col-span-2">
        {children}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────

export default function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [saving, setSaving] = useState(false);
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  // Data Fetching
  const profile = useQuery(api.profile.getProfile);
  const settings = useQuery(api.settings.get);

  // Mutations
  const updateProfile = useMutation(api.profile.upsertProfile);
  const updateSettings = useMutation(api.settings.update);
  const generateUploadUrl = useMutation(api.profile.generateUploadUrl);
  const eraseWorkspace = useMutation(api.data.eraseWorkspace);
  const convex = useConvex();

  // Data Mgmt State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Download helpers
  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = async () => {
    try {
      const data = await convex.query(api.data.exportAllData);
      downloadFile(JSON.stringify(data, null, 2), `trackply-export-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  const handleExportCSV = async () => {
    try {
      const data = await convex.query(api.data.exportAllData);
      const apps = data.applications || [];
      const headers = ["Company", "Role", "Location", "Status", "Date Applied", "Link", "Salary"];
      const rows = apps.map((app: any) => [
          `"${(app.company || '').replace(/"/g, '""')}"`,
          `"${(app.role || '').replace(/"/g, '""')}"`,
          `"${(app.location || '').replace(/"/g, '""')}"`,
          `"${app.status || ''}"`,
          `"${app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : ''}"`,
          `"${app.link || ''}"`,
          `"${app.salary || ''}"`
      ]);
      const csvContent = [headers.join(","), ...rows.map((e: string[]) => e.join(","))].join("\n");
      downloadFile(csvContent, `trackply-export-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await eraseWorkspace();
      window.location.href = "/"; // Force redirect to trigger auth root/landing
    } catch (err) {
      console.error("Deletion failed", err);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local state for forms
  const [localProfile, setLocalProfile] = useState({ 
    name: "", 
    title: "", 
    bio: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    pictureStorageId: "" as any
  });
  const [localSkills, setLocalSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [localSettings, setLocalSettings] = useState<any>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (profile) {
      setLocalProfile({ 
        name: profile.name || "",
        title: profile.title || "", 
        bio: profile.bio || "",
        location: profile.location || "",
        website: profile.website || "",
        linkedin: profile.linkedin || "",
        github: profile.github || "",
        pictureStorageId: profile.pictureStorageId || ""
      });
      setLocalSkills(profile.skills || []);
    }
  }, [profile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      // 1. Get upload URL
      const postUrl = await generateUploadUrl();
      
      // 2. Upload file
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      // 3. Update profile immediately
      await updateProfile({ 
        ...localProfile, 
        skills: localSkills, 
        pictureStorageId: storageId 
      });
    } catch (error) {
      console.error("Avatar upload failed:", error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  useEffect(() => {
    if (settings) setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeTab === "profile") {
        await updateProfile({ ...localProfile, skills: localSkills });
      } else if (localSettings) {
        // Prepare patch: exclude userId and id
        const { _id, userId, ...patch } = localSettings;
        await updateSettings(patch);
      }
      setShowSavedMsg(true);
      setTimeout(() => setShowSavedMsg(false), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "ai", label: "AI & Search", icon: Sparkles },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "data", label: "Data Management", icon: Database },
  ] as const;

  if (!settings || !localSettings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-5 h-5 animate-spin text-primary/50" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-4">
      {/* Refined Header */}
      <div className="flex items-end justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">Account Settings</h1>
          <p className="text-xs text-text-secondary mt-1.5 font-medium">Configure your workspace and career preferences.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-text-primary text-page-bg text-[11px] font-bold rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : showSavedMsg ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          {showSavedMsg ? "Saved" : "Save Changes"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Professional Sidebar Navigation */}
        <aside className="w-full lg:w-56 space-y-1 flex-shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center justify-between group px-3 py-2 rounded-lg text-[11px] font-semibold transition-colors",
                activeTab === tab.id
                  ? "bg-text-primary/5 text-text-primary border border-border"
                  : "text-text-muted hover:text-text-primary hover:bg-page-bg"
              )}
            >
              <div className="flex items-center gap-2.5">
                <tab.icon className={cn("w-3.5 h-3.5", activeTab === tab.id ? "text-primary" : "opacity-70 group-hover:opacity-100")} />
                {tab.label}
              </div>
              <ChevronRight className={cn("w-3 h-3 transition-opacity", activeTab === tab.id ? "opacity-40" : "opacity-0")} />
            </button>
          ))}
        </aside>

        {/* Content Area - Structured & Minimal */}
        <main className="flex-1 max-w-2xl divide-y divide-border/60">
          
          {activeTab === "profile" && (
            <div className="space-y-0">
              <SectionHeader title="Public Profile" description="This information is used by the AI to detect skill matches." />
              
              <FormRow label="Identify" description="Set your professional avatar.">
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-full border border-border overflow-hidden bg-primary/5 flex items-center justify-center relative group">
                    {profile?.pictureUrl ? (
                      <img src={profile.pictureUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-primary font-bold text-xs">
                        {localProfile.name ? localProfile.name.substring(0, 2).toUpperCase() : "TP"}
                      </span>
                    )}
                    {uploadingAvatar && (
                      <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 flex items-center justify-center">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="text-[10px] font-bold text-text-primary hover:text-primary transition-colors flex items-center gap-1.5 px-3 py-1.5 bg-page-bg border border-border rounded-lg disabled:opacity-50"
                  >
                    <Camera className="w-3 h-3" /> 
                    {uploadingAvatar ? "Uploading..." : "Change Photo"}
                  </button>
                </div>
              </FormRow>

              <FormRow label="Full Name" description="Your display name used throughout the app.">
                <input
                  type="text"
                  value={localProfile.name}
                  onChange={(e) => setLocalProfile({ ...localProfile, name: e.target.value })}
                  placeholder="e.g. Alex Rivera"
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-text-muted/50"
                />
              </FormRow>

              <FormRow label="Professional Headline" description="A short summary of your current role or expertise.">
                <input
                  type="text"
                  value={localProfile.title}
                  onChange={(e) => setLocalProfile({ ...localProfile, title: e.target.value })}
                  placeholder="e.g. Staff Research Scientist"
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-text-muted/50"
                />
              </FormRow>

              <FormRow label="Location" description="Helping the AI match relevant job markets.">
                <input
                  type="text"
                  value={localProfile.location}
                  onChange={(e) => setLocalProfile({ ...localProfile, location: e.target.value })}
                  placeholder="e.g. San Francisco, CA"
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-text-muted/50"
                />
              </FormRow>

              <FormRow label="Professional Bio" description="Write about your career trajectory and technical focus." align="top">
                <textarea
                  rows={4}
                  value={localProfile.bio}
                  onChange={(e) => setLocalProfile({ ...localProfile, bio: e.target.value })}
                  placeholder="Detailed background for better AI context..."
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none placeholder:text-text-muted/50"
                />
              </FormRow>

              <FormRow label="Online Presence" description="Connect your professional profiles for quick access." align="top">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-20 text-[10px] font-bold text-text-muted uppercase">LinkedIn</span>
                    <input
                      type="text"
                      value={localProfile.linkedin}
                      onChange={(e) => setLocalProfile({ ...localProfile, linkedin: e.target.value })}
                      placeholder="linkedin.com/in/username"
                      className="flex-1 px-3 py-1.5 bg-surface border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-20 text-[10px] font-bold text-text-muted uppercase">GitHub</span>
                    <input
                      type="text"
                      value={localProfile.github}
                      onChange={(e) => setLocalProfile({ ...localProfile, github: e.target.value })}
                      placeholder="github.com/username"
                      className="flex-1 px-3 py-1.5 bg-surface border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-20 text-[10px] font-bold text-text-muted uppercase">Website</span>
                    <input
                      type="text"
                      value={localProfile.website}
                      onChange={(e) => setLocalProfile({ ...localProfile, website: e.target.value })}
                      placeholder="portfolio.me"
                      className="flex-1 px-3 py-1.5 bg-surface border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </FormRow>
              <FormRow label="Core Skills" description="Add technical skills for the AI to track in gaps." align="top">
                <div className="space-y-4">
                  <div className="relative">
                    <PlusIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          const trimmed = skillInput.trim();
                          if (trimmed && !localSkills.includes(trimmed)) {
                            setLocalSkills([...localSkills, trimmed]);
                          }
                          setSkillInput("");
                        }
                      }}
                      placeholder="Add a skill..."
                      className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {localSkills.map((skill) => (
                      <div
                        key={skill}
                        className="flex items-center gap-1.5 bg-page-bg text-text-primary text-[10px] font-bold pl-2.5 pr-1.5 py-1 rounded-md border border-border group"
                      >
                        {skill}
                        <button 
                          onClick={() => setLocalSkills(localSkills.filter(s => s !== skill))}
                          className="text-text-muted hover:text-red-500 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {localSkills.length === 0 && (
                      <p className="text-[10px] text-text-muted italic pt-1">No skills added yet.</p>
                    )}
                  </div>
                </div>
              </FormRow>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="space-y-0">
              <SectionHeader title="AI Configurations" description="Tune the summarization and matching algorithms." />
              
              <FormRow label="Match Strictness" description="How rigorously the AI compares your profile to the job.">
                <div className="flex p-1 bg-page-bg border border-border rounded-lg max-w-fit">
                  {[
                    { id: "relaxed", label: "Relaxed (Conceptual)" }, 
                    { id: "strict", label: "Strict (Exact Match)" }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setLocalSettings({ ...localSettings, ai: { ...localSettings.ai, matchStrictness: mode.id } })}
                      className={cn(
                        "px-3 py-1.5 rounded-md text-[10px] font-bold transition-all",
                        localSettings.ai.matchStrictness === mode.id
                          ? "bg-surface text-text-primary shadow-sm ring-1 ring-border"
                          : "text-text-muted hover:text-text-secondary"
                      )}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </FormRow>

              <FormRow label="Summarization Depth" description="Controls the format of the job description summary.">
                <div className="flex gap-2">
                  {[
                    { id: "bullet_points", label: "Bullet Points" }, 
                    { id: "executive_summary", label: "Exec Summary" },
                    { id: "in_depth", label: "In-Depth Analysis" }
                  ].map((depth) => (
                    <button
                      key={depth.id}
                      onClick={() => setLocalSettings({ ...localSettings, ai: { ...localSettings.ai, summaryDepth: depth.id } })}
                      className={cn(
                        "px-3 py-1.5 rounded-md border text-[10px] font-bold transition-all",
                        localSettings.ai.summaryDepth === depth.id
                          ? "bg-primary/10 border-primary/30 text-primary"
                          : "bg-surface border-border text-text-muted hover:border-text-secondary"
                      )}
                    >
                      {depth.label}
                    </button>
                  ))}
                </div>
              </FormRow>

              <FormRow label="Interview Persona" description="Who the AI simulates when generating questions.">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
                  {[
                    { id: "friendly_recruiter", label: "Friendly Recruiter", desc: "Focuses on culture & behavioral fit" }, 
                    { id: "technical_lead", label: "Technical Lead", desc: "Deep technical probing & system design" },
                    { id: "rigorous_hiring_manager", label: "Hiring Manager", desc: "Strategic & high-pressure situations" }
                  ].map((persona) => (
                    <button
                      key={persona.id}
                      onClick={() => setLocalSettings({ ...localSettings, ai: { ...localSettings.ai, interviewPersona: persona.id } })}
                      className={cn(
                        "flex flex-col items-start text-left p-3 rounded-xl border transition-all h-full",
                        localSettings.ai.interviewPersona === persona.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "border-border bg-surface hover:border-border-strong group hover:shadow-sm"
                      )}
                    >
                      <span className={cn("text-[10px] font-bold mb-1", localSettings.ai.interviewPersona === persona.id ? "text-primary" : "text-text-primary group-hover:text-primary transition-colors")}>
                        {persona.label}
                      </span>
                      <span className="text-[9px] text-text-muted leading-relaxed">
                        {persona.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </FormRow>
              <FormRow label="Focus Areas" description="Targeted analysis during skill gap detection." align="top">
                <div className="flex flex-wrap gap-2 pt-1">
                  {["Tech Stack", "Soft Skills", "Experience", "Certifications", "Leadership"].map((area) => (
                    <button
                      key={area}
                      onClick={() => {
                        const areas = localSettings.ai.focusAreas.includes(area)
                          ? localSettings.ai.focusAreas.filter((a: string) => a !== area)
                          : [...localSettings.ai.focusAreas, area];
                        setLocalSettings({ ...localSettings, ai: { ...localSettings.ai, focusAreas: areas } });
                      }}
                      className={cn(
                        "px-2 py-1 rounded-md border text-[10px] font-bold transition-all",
                        localSettings.ai.focusAreas.includes(area)
                          ? "bg-primary/10 border-primary/30 text-primary"
                          : "bg-surface border-border text-text-muted hover:border-text-secondary"
                      )}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </FormRow>
              <FormRow label="Preferred Currency" description="Used for global salary analysis and job budget parsing.">
                <div className="flex gap-3">
                  {["PHP", "USD", "EUR", "GBP"].map((curr) => (
                    <button
                      key={curr}
                      onClick={() => setLocalSettings({ ...localSettings, defaults: { ...localSettings.defaults, currency: curr } })}
                      className={cn(
                        "px-3 py-1.5 rounded-md border text-[10px] font-bold transition-all",
                        localSettings.defaults.currency === curr
                          ? "bg-primary/10 border-primary/30 text-primary"
                          : "bg-surface border-border text-text-muted hover:border-text-secondary"
                      )}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </FormRow>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-0">
              <SectionHeader title="Personalization" description="Customize how Trackply looks in your browser." />
              <FormRow label="Theme Preference" description="Select your preferred interface aesthetic.">
                <div className="grid grid-cols-3 gap-3 max-w-sm">
                  {[
                    { id: "light", icon: Sun, label: "Light" },
                    { id: "dark", icon: Moon, label: "Dark" },
                    { id: "system", icon: Monitor, label: "System" },
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => {
                        const newApp = { ...localSettings.appearance, theme: theme.id };
                        setLocalSettings({ ...localSettings, appearance: newApp });
                        updateSettings({ appearance: newApp }).catch(console.error);
                      }}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all",
                        localSettings.appearance.theme === theme.id
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-surface text-text-muted hover:border-text-muted"
                      )}
                    >
                      <theme.icon className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </FormRow>
              <FormRow label="Brand Color" description="The primary accent color for links and buttons.">
                <div className="flex gap-4 items-center">
                  {["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"].map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        const newApp = { ...localSettings.appearance, accentColor: color };
                        setLocalSettings({ ...localSettings, appearance: newApp });
                        updateSettings({ appearance: newApp }).catch(console.error);
                      }}
                      className={cn(
                        "w-5 h-5 rounded-full border-2 transition-transform hover:scale-110",
                        localSettings.appearance.accentColor === color ? "border-text-primary scale-110" : "border-transparent"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </FormRow>
            </div>
          )}

          {activeTab === "data" && (
            <div className="space-y-0">
              <SectionHeader title="Data & Privacy" description="Manage your stored search history and privacy." />
              <FormRow label="Portability" description="Download a full record of your data in JSON or CSV.">
                <div className="flex gap-3">
                  <button onClick={handleExportJSON} className="px-3 py-1.5 bg-surface border border-border rounded-lg text-[10px] font-bold text-text-primary hover:bg-page-bg transition-all flex items-center gap-2">
                    Export JSON <ExternalLink className="w-3 h-3 opacity-50" />
                  </button>
                  <button onClick={handleExportCSV} className="px-3 py-1.5 bg-surface border border-border rounded-lg text-[10px] font-bold text-text-primary hover:bg-page-bg transition-all flex items-center gap-2">
                    Export CSV <ExternalLink className="w-3 h-3 opacity-50" />
                  </button>
                </div>
              </FormRow>
              <FormRow label="Security" description="Current security status and audit log." align="top">
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-2 text-xs text-text-primary">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>End-to-end encrypted storage active</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-primary">
                    <Clock className="w-3.5 h-3.5 text-text-muted" />
                    <span>Last export: Never</span>
                  </div>
                </div>
              </FormRow>
              <div className="py-12">
                <button onClick={() => setShowDeleteModal(true)} className="text-[11px] font-semibold text-red-500 hover:text-red-600 transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-500/5">
                  <Trash2 className="w-3.5 h-3.5" /> Permanently delete account and erase workspace
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-page-bg/80 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full shadow-[var(--shadow-premium)] relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 p-1.5 text-text-muted hover:bg-page-bg rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 text-red-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">Erase Workspace?</h2>
            <p className="text-sm text-text-secondary leading-relaxed mb-6">
              This action is <span className="font-semibold text-text-primary">permanent and irreversible</span>. 
              All your applications, AI insights, profile information, and custom settings will be permanently erased.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-page-bg text-text-primary text-sm font-semibold rounded-lg hover:bg-border transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-red-600 focus:ring-2 focus:ring-red-500/20 active:scale-95 transition-all disabled:opacity-70 disabled:pointer-events-none flex items-center gap-2"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isDeleting ? "Erasing Data..." : "Yes, Erase Everything"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
