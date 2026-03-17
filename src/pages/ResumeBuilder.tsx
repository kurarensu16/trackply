import { useState, useRef, useCallback, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useReactToPrint } from "react-to-print";
import {
  Plus, Printer, Trash2, ChevronDown, ChevronUp,
  Briefcase, GraduationCap, Wrench, FolderGit2,
  User, ArrowLeft, FileText, Loader2
} from "lucide-react";
import ModernTemplate from "../components/resumes/templates/ModernTemplate";
import HarvardTemplate from "../components/resumes/templates/HarvardTemplate";

// ── Types ──────────────────────────────────────────────────
type WorkItem = { id: string; company: string; position: string; startDate: string; endDate?: string; current?: boolean; summary?: string; highlights: string[] };
type EduItem  = { id: string; institution: string; area: string; studyType: string; startDate: string; endDate?: string; gpa?: string };
type SkillItem = { id: string; name: string; keywords: string[] };
type ProjectItem = { id: string; name: string; description?: string; url?: string; highlights: string[] };

type ResumeData = {
  title: string;
  templateId: string;
  basics: { name: string; label?: string; email?: string; phone?: string; website?: string; location?: string; summary?: string };
  work: WorkItem[];
  education: EduItem[];
  skills: SkillItem[];
  projects: ProjectItem[];
};

const uid = () => Math.random().toString(36).slice(2, 9);

const EMPTY_RESUME: ResumeData = {
  title: "My Resume",
  templateId: "modern",
  basics: { name: "" },
  work: [],
  education: [],
  skills: [],
  projects: [],
};

// ── Input field helpers ────────────────────────────────────
function Field({ label, value, onChange, placeholder, multiline }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean;
}) {
  const cls = "w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{label}</label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className={cls + " resize-none"} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      }
    </div>
  );
}

// ── Accordion section wrapper ──────────────────────────────
function SectionAccordion({ title, icon: Icon, children, count }: {
  title: string; icon: React.ElementType; children: React.ReactNode; count?: number;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="card-premium overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-page-bg/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-text-primary">{title}</span>
          {count !== undefined && count > 0 && (
            <span className="text-[9px] font-bold bg-primary-muted text-primary px-1.5 py-0.5 rounded-md">{count}</span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
      </button>
      {open && <div className="px-5 pb-5 space-y-4 border-t border-border-subtle pt-4">{children}</div>}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────
export default function ResumeBuilder() {
  const savedResumes = useQuery(api.builder.list);
  const createResume = useMutation(api.builder.create);
  const saveResume = useMutation(api.builder.save);
  const removeResume = useMutation(api.builder.remove);

  const [activeId, setActiveId] = useState<Id<"resumeBuilder"> | null>(null);
  const [data, setData] = useState<ResumeData>(EMPTY_RESUME);
  const [saving, setSaving] = useState(false);
  const [saveTimer, setSaveTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: printRef });

  // Load first resume on mount
  useEffect(() => {
    if (savedResumes && savedResumes.length > 0 && !activeId) {
      const r = savedResumes[0];
      setActiveId(r._id);
      setData({
        title: r.title,
        templateId: r.templateId,
        basics: r.basics,
        work: r.work,
        education: r.education,
        skills: r.skills,
        projects: r.projects,
      });
    }
  }, [savedResumes]);

  // Auto-save with debounce
  const triggerSave = useCallback((newData: ResumeData) => {
    if (!activeId) return;
    if (saveTimer) clearTimeout(saveTimer);
    setSaving(true);
    const t = setTimeout(async () => {
      await saveResume({ id: activeId, ...newData });
      setSaving(false);
    }, 900);
    setSaveTimer(t);
  }, [activeId, saveTimer, saveResume]);

  const update = (patch: Partial<ResumeData>) => {
    const newData = { ...data, ...patch };
    setData(newData);
    triggerSave(newData);
  };

  // ── Basics ──
  const setBasics = (field: string, value: string) => {
    update({ basics: { ...data.basics, [field]: value } });
  };

  // ── Work ──
  const addWork = () => update({ work: [...data.work, { id: uid(), company: "", position: "", startDate: "", highlights: [] }] });
  const updateWork = (id: string, patch: Partial<WorkItem>) =>
    update({ work: data.work.map(w => w.id === id ? { ...w, ...patch } : w) });
  const removeWork = (id: string) => update({ work: data.work.filter(w => w.id !== id) });

  // ── Education ──
  const addEdu = () => update({ education: [...data.education, { id: uid(), institution: "", area: "", studyType: "Bachelor's", startDate: "" }] });
  const updateEdu = (id: string, patch: Partial<EduItem>) =>
    update({ education: data.education.map(e => e.id === id ? { ...e, ...patch } : e) });
  const removeEdu = (id: string) => update({ education: data.education.filter(e => e.id !== id) });

  // ── Skills ──
  const addSkill = () => update({ skills: [...data.skills, { id: uid(), name: "", keywords: [] }] });
  const updateSkill = (id: string, patch: Partial<SkillItem>) =>
    update({ skills: data.skills.map(s => s.id === id ? { ...s, ...patch } : s) });
  const removeSkill = (id: string) => update({ skills: data.skills.filter(s => s.id !== id) });

  // ── Projects ──
  const addProject = () => update({ projects: [...data.projects, { id: uid(), name: "", highlights: [] }] });
  const updateProject = (id: string, patch: Partial<ProjectItem>) =>
    update({ projects: data.projects.map(p => p.id === id ? { ...p, ...patch } : p) });
  const removeProject = (id: string) => update({ projects: data.projects.filter(p => p.id !== id) });

  const handleNewResume = async () => {
    const id = await createResume({ title: "New Resume" });
    setActiveId(id);
    setData(EMPTY_RESUME);
  };

  // ── Resume list picker ──
  if (!activeId) {
    return (
      <div className="space-y-8 max-w-2xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Resume Builder</h1>
          <p className="text-text-secondary text-sm mt-1">Create professional resumes with a live preview.</p>
        </div>
        <div className="card-premium p-8 text-center space-y-4">
          <FileText className="w-10 h-10 text-text-muted mx-auto" />
          <div>
            <h3 className="text-sm font-bold text-text-primary">Start Building</h3>
            <p className="text-xs text-text-muted mt-1">Create a new resume or continue editing an existing one.</p>
          </div>
          {savedResumes && savedResumes.length > 0 && (
            <div className="text-left space-y-2">
              {savedResumes.map(r => (
                <button
                  key={r._id}
                  onClick={() => { setActiveId(r._id); setData({ title: r.title, templateId: r.templateId, basics: r.basics, work: r.work, education: r.education, skills: r.skills, projects: r.projects }); }}
                  className="w-full flex items-center gap-3 p-3 bg-page-bg rounded-xl border border-border-subtle hover:border-primary/30 text-left transition-all"
                >
                  <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-text-primary truncate">{r.title}</p>
                    <p className="text-[10px] text-text-muted">{r.basics.name || "No name set"}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          <button onClick={handleNewResume} className="w-full py-3 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Create New Resume
          </button>
        </div>
      </div>
    );
  }

  // ── Builder ──
  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveId(null)} className="flex items-center gap-1.5 text-xs text-text-muted hover:text-primary transition-colors font-bold">
            <ArrowLeft className="w-3.5 h-3.5" /> All Resumes
          </button>
          <span className="text-text-muted text-xs">/</span>
          <input
            value={data.title}
            onChange={e => update({ title: e.target.value })}
            className="text-sm font-bold text-text-primary bg-transparent border-none outline-none focus:ring-0 min-w-0 max-w-[200px]"
          />
          {saving && (
            <span className="flex items-center gap-1 text-[10px] text-text-muted font-medium">
              <Loader2 className="w-3 h-3 animate-spin" /> Saving...
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Template Switcher */}
          <div className="flex items-center gap-1 p-1 bg-page-bg rounded-xl border border-border-subtle">
            {(["modern", "harvard"] as const).map(t => (
              <button
                key={t}
                onClick={() => update({ templateId: t })}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold capitalize transition-all ${
                  data.templateId === t
                    ? "bg-primary text-white shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {t === "modern" ? "Modern" : "Harvard"}
              </button>
            ))}
          </div>
          <button
            onClick={() => { if (activeId) removeResume({ id: activeId }).then(() => { setActiveId(null); }); }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handlePrint()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" /> Export PDF
          </button>
        </div>
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">

        {/* LEFT — Editor Forms */}
        <div className="overflow-y-auto space-y-4 pr-1 max-h-[calc(100vh-200px)]">

          {/* Basics */}
          <SectionAccordion title="Personal Info" icon={User}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full Name" value={data.basics.name} onChange={v => setBasics("name", v)} placeholder="Jane Doe" />
              <Field label="Job Title" value={data.basics.label ?? ""} onChange={v => setBasics("label", v)} placeholder="Software Engineer" />
              <Field label="Email" value={data.basics.email ?? ""} onChange={v => setBasics("email", v)} placeholder="jane@email.com" />
              <Field label="Phone" value={data.basics.phone ?? ""} onChange={v => setBasics("phone", v)} placeholder="+1 (555) 000-0000" />
              <Field label="Location" value={data.basics.location ?? ""} onChange={v => setBasics("location", v)} placeholder="San Francisco, CA" />
              <Field label="Website" value={data.basics.website ?? ""} onChange={v => setBasics("website", v)} placeholder="github.com/jane" />
            </div>
            <Field label="Professional Summary" value={data.basics.summary ?? ""} onChange={v => setBasics("summary", v)} placeholder="Brief description of your professional background..." multiline />
          </SectionAccordion>

          {/* Work */}
          <SectionAccordion title="Work Experience" icon={Briefcase} count={data.work.length}>
            {data.work.map((job, idx) => (
              <div key={job.id} className="p-4 bg-page-bg rounded-xl border border-border-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-text-muted">Position {idx + 1}</span>
                  <button onClick={() => removeWork(job.id)} className="text-text-muted hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Company" value={job.company} onChange={v => updateWork(job.id, { company: v })} placeholder="Acme Corp" />
                  <Field label="Position" value={job.position} onChange={v => updateWork(job.id, { position: v })} placeholder="Senior Developer" />
                  <Field label="Start Date" value={job.startDate} onChange={v => updateWork(job.id, { startDate: v })} placeholder="Jan 2022" />
                  <Field label="End Date" value={job.endDate ?? ""} onChange={v => updateWork(job.id, { endDate: v })} placeholder="Present" />
                </div>
                <Field label="Summary" value={job.summary ?? ""} onChange={v => updateWork(job.id, { summary: v })} placeholder="Brief role description..." multiline />
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Key Highlights (one per line)</label>
                  <textarea
                    value={job.highlights.join("\n")}
                    onChange={e => updateWork(job.id, { highlights: e.target.value.split("\n") })}
                    placeholder={"• Built REST API serving 1M+ requests/day\n• Reduced load time by 40%"}
                    rows={3}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  />
                </div>
              </div>
            ))}
            <button onClick={addWork} className="w-full py-2.5 border-2 border-dashed border-border-subtle rounded-xl text-xs font-bold text-text-muted hover:text-primary hover:border-primary/30 transition-all flex items-center justify-center gap-2">
              <Plus className="w-3.5 h-3.5" /> Add Position
            </button>
          </SectionAccordion>

          {/* Education */}
          <SectionAccordion title="Education" icon={GraduationCap} count={data.education.length}>
            {data.education.map((edu, idx) => (
              <div key={edu.id} className="p-4 bg-page-bg rounded-xl border border-border-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-text-muted">Entry {idx + 1}</span>
                  <button onClick={() => removeEdu(edu.id)} className="text-text-muted hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Institution" value={edu.institution} onChange={v => updateEdu(edu.id, { institution: v })} placeholder="MIT" />
                  <Field label="Degree Type" value={edu.studyType} onChange={v => updateEdu(edu.id, { studyType: v })} placeholder="Bachelor's" />
                  <Field label="Field of Study" value={edu.area} onChange={v => updateEdu(edu.id, { area: v })} placeholder="Computer Science" />
                  <Field label="GPA" value={edu.gpa ?? ""} onChange={v => updateEdu(edu.id, { gpa: v })} placeholder="3.9" />
                  <Field label="Start Year" value={edu.startDate} onChange={v => updateEdu(edu.id, { startDate: v })} placeholder="2018" />
                  <Field label="End Year" value={edu.endDate ?? ""} onChange={v => updateEdu(edu.id, { endDate: v })} placeholder="2022" />
                </div>
              </div>
            ))}
            <button onClick={addEdu} className="w-full py-2.5 border-2 border-dashed border-border-subtle rounded-xl text-xs font-bold text-text-muted hover:text-primary hover:border-primary/30 transition-all flex items-center justify-center gap-2">
              <Plus className="w-3.5 h-3.5" /> Add Education
            </button>
          </SectionAccordion>

          {/* Skills */}
          <SectionAccordion title="Skills" icon={Wrench} count={data.skills.length}>
            {data.skills.map((skill, idx) => (
              <div key={skill.id} className="p-4 bg-page-bg rounded-xl border border-border-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-text-muted">Skill Group {idx + 1}</span>
                  <button onClick={() => removeSkill(skill.id)} className="text-text-muted hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <Field label="Category" value={skill.name} onChange={v => updateSkill(skill.id, { name: v })} placeholder="Frontend, Backend, Tools..." />
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Keywords (comma-separated)</label>
                  <input
                    type="text"
                    value={skill.keywords.join(", ")}
                    onChange={e => updateSkill(skill.id, { keywords: e.target.value.split(",").map(s => s.trim()) })}
                    placeholder="React, TypeScript, Node.js, AWS"
                    className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
            ))}
            <button onClick={addSkill} className="w-full py-2.5 border-2 border-dashed border-border-subtle rounded-xl text-xs font-bold text-text-muted hover:text-primary hover:border-primary/30 transition-all flex items-center justify-center gap-2">
              <Plus className="w-3.5 h-3.5" /> Add Skill Group
            </button>
          </SectionAccordion>

          {/* Projects */}
          <SectionAccordion title="Projects" icon={FolderGit2} count={data.projects.length}>
            {data.projects.map((proj, idx) => (
              <div key={proj.id} className="p-4 bg-page-bg rounded-xl border border-border-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-text-muted">Project {idx + 1}</span>
                  <button onClick={() => removeProject(proj.id)} className="text-text-muted hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Project Name" value={proj.name} onChange={v => updateProject(proj.id, { name: v })} placeholder="Trackply" />
                  <Field label="URL" value={proj.url ?? ""} onChange={v => updateProject(proj.id, { url: v })} placeholder="github.com/user/project" />
                </div>
                <Field label="Description" value={proj.description ?? ""} onChange={v => updateProject(proj.id, { description: v })} placeholder="What this project does..." multiline />
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Highlights (one per line)</label>
                  <textarea
                    value={proj.highlights.join("\n")}
                    onChange={e => updateProject(proj.id, { highlights: e.target.value.split("\n") })}
                    placeholder="• Built with React and Convex&#10;• 500+ active users"
                    rows={2}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  />
                </div>
              </div>
            ))}
            <button onClick={addProject} className="w-full py-2.5 border-2 border-dashed border-border-subtle rounded-xl text-xs font-bold text-text-muted hover:text-primary hover:border-primary/30 transition-all flex items-center justify-center gap-2">
              <Plus className="w-3.5 h-3.5" /> Add Project
            </button>
          </SectionAccordion>
        </div>

        {/* RIGHT — Live Preview */}
        <div className="hidden lg:block overflow-y-auto max-h-[calc(100vh-200px)] rounded-2xl border border-border-subtle bg-white shadow-lg">
          <div style={{ transform: "scale(0.82)", transformOrigin: "top left", width: "122%", minHeight: "800px" }}>
            <div ref={printRef}>
              {data.templateId === "harvard"
                ? <HarvardTemplate data={data} />
                : <ModernTemplate data={data} />
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
