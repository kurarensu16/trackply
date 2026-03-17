import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ── Query: Get activities for a specific application ──
export const listByApplication = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, { applicationId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("activities")
      .withIndex("by_application", (q) => q.eq("applicationId", applicationId))
      .order("desc")
      .collect();
  },
});

// ── Query: Get recent activities across all applications (for Dashboard) ──
export const listRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit ?? 20);
    return activities;
  },
});

// ── Internal helper: Track an activity ──
export const track = mutation({
  args: {
    applicationId: v.id("applications"),
    type: v.union(
      v.literal("created"),
      v.literal("stage_change"),
      v.literal("note_updated"),
      v.literal("ai_analysis"),
      v.literal("edited"),
      v.literal("deleted")
    ),
    description: v.string(),
    metadata: v.optional(v.object({
      fromStage: v.optional(v.string()),
      toStage: v.optional(v.string()),
      field: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.insert("activities", {
      userId,
      applicationId: args.applicationId,
      type: args.type,
      description: args.description,
      metadata: args.metadata,
      timestamp: Date.now(),
    });
  },
});
