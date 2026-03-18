import { useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { formatDistanceToNow } from "date-fns";
import {
  Upload, FileText, Star, Trash2, Plus, Tag,
  Check, Download
} from "lucide-react";
import { cn } from "../lib/utils";

const LABEL_PRESETS = [
  "General", "Technical", "Marketing", "Design",
  "Management", "Data Science", "Freelance",
];

export default function Resumes() {
  const resumes = useQuery(api.resumes.listResumes);
  const generateUploadUrl = useMutation(api.resumes.generateUploadUrl);
  const saveResume = useMutation(api.resumes.saveResume);
  const setDefault = useMutation(api.resumes.setDefault);
  const updateSkills = useMutation(api.resumes.updateSkills);
  const deleteResume = useMutation(api.resumes.deleteResume);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [label, setLabel] = useState("General");
  const [showUpload, setShowUpload] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [editingSkillsId, setEditingSkillsId] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      await saveResume({
        storageId,
        fileName: file.name,
        label,
      });

      setShowUpload(false);
      setLabel("General");
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveSkills = async (resumeId: Id<"resumes">) => {
    const skills = skillInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    await updateSkills({ id: resumeId, skills });
    setEditingSkillsId(null);
    setSkillInput("");
  };


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Resumes</h1>
          <p className="text-text-secondary text-sm mt-1">Manage your resume versions and track skills.</p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Upload Resume
        </button>
      </div>

      {/* Upload Card */}
      {showUpload && (
        <div className="card-premium p-6 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
          <h3 className="text-sm font-bold text-text-primary">Upload New Resume</h3>

          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 block">Label / Version Type</label>
            <div className="flex flex-wrap gap-2">
              {LABEL_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setLabel(preset)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all",
                    label === preset
                      ? "border-primary bg-primary-muted text-primary"
                      : "border-border-subtle bg-surface text-text-muted hover:border-primary/30"
                  )}
                >
                  <Tag className="w-3 h-3 inline mr-1" />
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div
            className={cn(
              "border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer",
              isUploading
                ? "border-primary bg-primary-muted"
                : "border-border-subtle hover:border-primary/40 hover:bg-page-bg"
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
            />
            {isUploading ? (
              <div className="space-y-2">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-primary font-bold">Uploading...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 text-text-muted mx-auto" />
                <p className="text-sm text-text-secondary font-medium">Click to upload or drop your file</p>
                <p className="text-[10px] text-text-muted">PDF, DOC, or DOCX • Max 10MB</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resume Grid */}
      {resumes && resumes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume: any) => {
            const isEditingSkills = editingSkillsId === resume._id;

            return (
              <div
                key={resume._id}
                className={cn(
                  "card-premium overflow-hidden transition-all group",
                  resume.isDefault && "ring-2 ring-primary/30"
                )}
              >
                {/* Card Header */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-primary-muted">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text-primary truncate max-w-[150px]">
                          {resume.fileName}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] font-bold text-primary bg-primary-muted px-1.5 py-0.5 rounded">
                            {resume.label}
                          </span>
                          <span className="text-[9px] font-bold text-text-muted">
                            v{resume.version}
                          </span>
                        </div>
                      </div>
                    </div>
                    {resume.isDefault && (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3" /> Default
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-text-muted font-medium">
                    Uploaded {formatDistanceToNow(new Date(resume.uploadedAt), { addSuffix: true })}
                  </p>

                  {resume.skills && resume.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {resume.skills.slice(0, 6).map((skill: string) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 bg-surface-muted border border-border-subtle text-[9px] font-bold text-text-secondary rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                      {resume.skills.length > 6 && (
                        <span className="px-2 py-0.5 text-[9px] font-bold text-primary">
                          +{resume.skills.length - 6} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Skill Editor */}
                {isEditingSkills && (
                  <div className="px-5 pb-3 space-y-2 animate-in fade-in duration-150">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      Skills (comma separated)
                    </label>
                    <textarea
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="React, TypeScript, Node.js, AWS..."
                      rows={2}
                      className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveSkills(resume._id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-primary-hover transition-colors"
                      >
                        <Check className="w-3 h-3" /> Save
                      </button>
                      <button
                        onClick={() => { setEditingSkillsId(null); setSkillInput(""); }}
                        className="px-3 py-1.5 text-text-muted text-[10px] font-bold rounded-lg hover:bg-page-bg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="px-5 py-3 border-t border-border-subtle flex items-center gap-2 bg-page-bg/50">
                  {resume.url && (
                    <a
                      href={resume.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-text-muted hover:text-primary rounded-lg hover:bg-surface transition-colors"
                    >
                      <Download className="w-3 h-3" /> Download
                    </a>
                  )}
                  <button
                    onClick={() => {
                      setEditingSkillsId(resume._id);
                      setSkillInput(resume.skills?.join(", ") || "");
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-text-muted hover:text-primary rounded-lg hover:bg-surface transition-colors"
                  >
                    <Tag className="w-3 h-3" /> Skills
                  </button>
                  {!resume.isDefault && (
                    <button
                      onClick={() => setDefault({ id: resume._id })}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-text-muted hover:text-amber-500 rounded-lg hover:bg-surface transition-colors"
                    >
                      <Star className="w-3 h-3" /> Default
                    </button>
                  )}
                  <button
                    onClick={() => deleteResume({ id: resume._id })}
                    className="ml-auto flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-text-muted hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-premium p-12 text-center">
          <FileText className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <h3 className="text-sm font-bold text-text-primary mb-1">No resumes uploaded yet</h3>
          <p className="text-xs text-text-muted">Upload your first resume to start tracking your skills and versions.</p>
        </div>
      )}
    </div>
  );
}
