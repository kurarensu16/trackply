import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const interviewTypeValidator = v.union(
  v.literal("phone"),
  v.literal("video"),
  v.literal("onsite"),
  v.literal("technical"),
  v.literal("behavioral"),
  v.literal("other")
);

const statusValidator = v.union(
  v.literal("upcoming"),
  v.literal("completed"),
  v.literal("cancelled")
);

// ── List interviews for a specific application ──
export const listByApplication = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, { applicationId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("interviews")
      .withIndex("by_application", (q) => q.eq("applicationId", applicationId))
      .order("desc")
      .collect();
  },
});

// ── List upcoming interviews for dashboard widget ──
export const listUpcoming = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const interviews = await ctx.db
      .query("interviews")
      .withIndex("by_user_status", (q) => q.eq("userId", userId).eq("status", "upcoming"))
      .collect();

    // Enrich with application data
    const enriched = await Promise.all(
      interviews.map(async (interview) => {
        const app = await ctx.db.get(interview.applicationId);
        return {
          ...interview,
          company: app?.company ?? "Unknown",
          role: app?.role ?? "Unknown",
        };
      })
    );

    // Sort by scheduledAt ascending (soonest first)
    return enriched.sort((a, b) => a.scheduledAt - b.scheduledAt);
  },
});

// ── Create interview ──
export const createInterview = mutation({
  args: {
    applicationId: v.id("applications"),
    scheduledAt: v.number(),
    type: interviewTypeValidator,
    title: v.string(),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    prepNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const interviewId = await ctx.db.insert("interviews", {
      userId,
      ...args,
      status: "upcoming",
    });

    // Track activity
    const app = await ctx.db.get(args.applicationId);
    await ctx.db.insert("activities", {
      userId,
      applicationId: args.applicationId,
      type: "edited",
      description: `Scheduled ${args.type} interview: ${args.title}${app ? ` for ${app.role}` : ""}`,
      metadata: { field: "interview" },
      timestamp: Date.now(),
    });

    return interviewId;
  },
});

// ── Update interview ──
export const updateInterview = mutation({
  args: {
    id: v.id("interviews"),
    scheduledAt: v.optional(v.number()),
    type: v.optional(interviewTypeValidator),
    title: v.optional(v.string()),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    prepNotes: v.optional(v.string()),
    status: v.optional(statusValidator),
  },
  handler: async (ctx, { id, ...fields }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const interview = await ctx.db.get(id);
    if (!interview || interview.userId !== userId) throw new Error("Not found");

    // Track status changes
    if (fields.status && fields.status !== interview.status) {
      await ctx.db.insert("activities", {
        userId,
        applicationId: interview.applicationId,
        type: "edited",
        description: `Interview "${interview.title}" marked as ${fields.status}`,
        metadata: { field: "interview_status" },
        timestamp: Date.now(),
      });
    }

    await ctx.db.patch(id, fields);
  },
});

// ── Delete interview ──
export const deleteInterview = mutation({
  args: { id: v.id("interviews") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const interview = await ctx.db.get(id);
    if (!interview || interview.userId !== userId) throw new Error("Not found");

    await ctx.db.insert("activities", {
      userId,
      applicationId: interview.applicationId,
      type: "edited",
      description: `Cancelled interview: ${interview.title}`,
      metadata: { field: "interview" },
      timestamp: Date.now(),
    });

    await ctx.db.delete(id);
  },
});
