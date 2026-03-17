import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const stageValidator = v.union(
  v.literal("saved"),
  v.literal("applied"),
  v.literal("interview"),
  v.literal("offer"),
  v.literal("rejected")
);

export const listApplications = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const createApplication = mutation({
  args: {
    company: v.string(),
    role: v.string(),
    jobUrl: v.optional(v.string()),
    source: v.string(),
    stage: stageValidator,
    salaryMin: v.optional(v.number()),
    salaryMax: v.optional(v.number()),
    notes: v.optional(v.string()),
    appliedAt: v.optional(v.number()),
    rawJD: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const appId = await ctx.db.insert("applications", { userId, ...args });

    // Auto-track creation
    await ctx.db.insert("activities", {
      userId,
      applicationId: appId,
      type: "created",
      description: `Added ${args.role} at ${args.company}`,
      timestamp: Date.now(),
    });

    return appId;
  },
});

export const updateApplication = mutation({
  args: {
    id: v.id("applications"),
    company: v.optional(v.string()),
    role: v.optional(v.string()),
    jobUrl: v.optional(v.string()),
    source: v.optional(v.string()),
    stage: v.optional(stageValidator),
    salaryMin: v.optional(v.number()),
    salaryMax: v.optional(v.number()),
    notes: v.optional(v.string()),
    appliedAt: v.optional(v.number()),
    rawJD: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const app = await ctx.db.get(id);
    if (!app || app.userId !== userId) throw new Error("Not found");

    // Detect what changed and auto-track
    if (fields.stage && fields.stage !== app.stage) {
      await ctx.db.insert("activities", {
        userId,
        applicationId: id,
        type: "stage_change",
        description: `Moved from ${app.stage} to ${fields.stage}`,
        metadata: { fromStage: app.stage, toStage: fields.stage },
        timestamp: Date.now(),
      });
    } else if (fields.notes !== undefined && fields.notes !== app.notes) {
      await ctx.db.insert("activities", {
        userId,
        applicationId: id,
        type: "note_updated",
        description: "Updated personal notes",
        timestamp: Date.now(),
      });
    } else if (Object.keys(fields).length > 0) {
      const changedFields = Object.keys(fields).filter(
        (k) => (fields as any)[k] !== (app as any)[k]
      );
      if (changedFields.length > 0) {
        await ctx.db.insert("activities", {
          userId,
          applicationId: id,
          type: "edited",
          description: `Updated ${changedFields.join(", ")}`,
          metadata: { field: changedFields.join(", ") },
          timestamp: Date.now(),
        });
      }
    }

    await ctx.db.patch(id, fields);
  },
});

export const deleteApplication = mutation({
  args: { id: v.id("applications") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const app = await ctx.db.get(id);
    if (!app || app.userId !== userId) throw new Error("Not found");

    // Track deletion before removing
    await ctx.db.insert("activities", {
      userId,
      applicationId: id,
      type: "deleted",
      description: `Deleted ${app.role} at ${app.company}`,
      timestamp: Date.now(),
    });

    await ctx.db.delete(id);
  },
});

export const saveAIResults = mutation({
  args: {
    id: v.id("applications"),
    aiSummary: v.optional(v.object({
      overview: v.string(),
      responsibilities: v.array(v.string()),
      requiredSkills: v.array(v.string()),
    })),
    skillGaps: v.optional(v.array(v.string())),
    interviewPrep: v.optional(v.object({
      questions: v.array(v.object({
        question: v.string(),
        rationale: v.string(),
        suggestedPoint: v.string(),
      })),
      smartQuestions: v.array(v.string()),
      strategy: v.string(),
    })),
  },
  handler: async (ctx, { id, ...fields }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const app = await ctx.db.get(id);
    if (!app || app.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(id, fields);

    // Track AI analysis
    let description = "AI analyzed job description";
    if (fields.skillGaps && fields.skillGaps.length > 0) {
      description += ` — ${fields.skillGaps.length} skill gaps found`;
    }
    if (fields.interviewPrep) {
      description = "AI generated a tailored interview prep kit";
    }

    await ctx.db.insert("activities", {
      userId,
      applicationId: id,
      type: "ai_analysis",
      description,
      timestamp: Date.now(),
    });
  },
});
