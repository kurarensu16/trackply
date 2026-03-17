import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const basicsValidator = v.object({
  name: v.string(),
  label: v.optional(v.string()),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  website: v.optional(v.string()),
  location: v.optional(v.string()),
  summary: v.optional(v.string()),
});

const workItemValidator = v.object({
  id: v.string(),
  company: v.string(),
  position: v.string(),
  startDate: v.string(),
  endDate: v.optional(v.string()),
  current: v.optional(v.boolean()),
  summary: v.optional(v.string()),
  highlights: v.array(v.string()),
});

const educationItemValidator = v.object({
  id: v.string(),
  institution: v.string(),
  area: v.string(),
  studyType: v.string(),
  startDate: v.string(),
  endDate: v.optional(v.string()),
  gpa: v.optional(v.string()),
});

const skillItemValidator = v.object({
  id: v.string(),
  name: v.string(),
  keywords: v.array(v.string()),
});

const projectItemValidator = v.object({
  id: v.string(),
  name: v.string(),
  description: v.optional(v.string()),
  url: v.optional(v.string()),
  highlights: v.array(v.string()),
});

// ── List user's saved resumes ──
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("resumeBuilder")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// ── Get a single resume ──
export const get = query({
  args: { id: v.id("resumeBuilder") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const resume = await ctx.db.get(id);
    if (!resume || resume.userId !== userId) return null;
    return resume;
  },
});

// ── Create a new resume ──
export const create = mutation({
  args: {
    title: v.string(),
    templateId: v.optional(v.string()),
  },
  handler: async (ctx, { title, templateId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("resumeBuilder", {
      userId,
      title,
      templateId: templateId ?? "modern",
      basics: { name: "" },
      work: [],
      education: [],
      skills: [],
      projects: [],
      updatedAt: Date.now(),
    });
  },
});

// ── Auto-save the entire resume (called on every field change) ──
export const save = mutation({
  args: {
    id: v.id("resumeBuilder"),
    title: v.optional(v.string()),
    templateId: v.optional(v.string()),
    basics: v.optional(basicsValidator),
    work: v.optional(v.array(workItemValidator)),
    education: v.optional(v.array(educationItemValidator)),
    skills: v.optional(v.array(skillItemValidator)),
    projects: v.optional(v.array(projectItemValidator)),
  },
  handler: async (ctx, { id, ...fields }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const resume = await ctx.db.get(id);
    if (!resume || resume.userId !== userId) throw new Error("Not found");

    await ctx.db.patch(id, { ...fields, updatedAt: Date.now() });
  },
});

// ── Delete a resume ──
export const remove = mutation({
  args: { id: v.id("resumeBuilder") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const resume = await ctx.db.get(id);
    if (!resume || resume.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});
