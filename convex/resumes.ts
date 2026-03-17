import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ── Generate upload URL for client-side upload ──
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

// ── Save resume record after upload ──
export const saveResume = mutation({
  args: {
    storageId: v.id("_storage"),
    fileName: v.string(),
    label: v.string(),
    skills: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Calculate version number (count existing resumes with same label)
    const existing = await ctx.db
      .query("resumes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const sameLabelCount = existing.filter((r) => r.label === args.label).length;
    const isFirstResume = existing.length === 0;

    const resumeId = await ctx.db.insert("resumes", {
      userId,
      storageId: args.storageId,
      fileName: args.fileName,
      label: args.label,
      version: sameLabelCount + 1,
      skills: args.skills,
      isDefault: isFirstResume,
      uploadedAt: Date.now(),
    });

    return resumeId;
  },
});

// ── List all resumes for the user ──
export const listResumes = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const resumes = await ctx.db
      .query("resumes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    // Enrich with download URLs
    const enriched = await Promise.all(
      resumes.map(async (resume) => {
        const url = await ctx.storage.getUrl(resume.storageId);
        return { ...resume, url };
      })
    );

    return enriched;
  },
});

// ── Set a resume as default ──
export const setDefault = mutation({
  args: { id: v.id("resumes") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Unset all other defaults
    const all = await ctx.db
      .query("resumes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const r of all) {
      if (r.isDefault) {
        await ctx.db.patch(r._id, { isDefault: false });
      }
    }

    // Set new default
    await ctx.db.patch(id, { isDefault: true });
  },
});

// ── Update skills on a resume ──
export const updateSkills = mutation({
  args: {
    id: v.id("resumes"),
    skills: v.array(v.string()),
  },
  handler: async (ctx, { id, skills }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const resume = await ctx.db.get(id);
    if (!resume || resume.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(id, { skills });
  },
});

// ── Delete a resume ──
export const deleteResume = mutation({
  args: { id: v.id("resumes") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const resume = await ctx.db.get(id);
    if (!resume || resume.userId !== userId) throw new Error("Not found");

    // Delete the file from storage
    await ctx.storage.delete(resume.storageId);
    await ctx.db.delete(id);
  },
});

// ── Get the default resume's skills (for skill comparison) ──
export const getDefaultSkills = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const resumes = await ctx.db
      .query("resumes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const defaultResume = resumes.find((r) => r.isDefault);
    return defaultResume?.skills ?? [];
  },
});
