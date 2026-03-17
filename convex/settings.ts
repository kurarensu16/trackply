import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const DEFAULT_SETTINGS = {
  appearance: {
    theme: "system" as const,
    accentColor: "#3b82f6", // Default primary blue
  },
  ai: {
    matchStrictness: "relaxed" as const,
    summaryDepth: "executive_summary" as const,
    interviewPersona: "friendly_recruiter" as const,
    focusAreas: ["Skills Match", "Experience Gaps"],
  },
  defaults: {
    currency: "PHP",
    defaultSources: ["LinkedIn", "Indeed", "Glassdoor"],
  },
};

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!settings) {
      return { ...DEFAULT_SETTINGS, userId };
    }

    return {
      ...settings,
      ai: {
        ...DEFAULT_SETTINGS.ai,
        ...settings.ai,
      }
    };
  },
});

export const update = mutation({
  args: {
    appearance: v.optional(v.object({
      theme: v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
      accentColor: v.optional(v.string()),
    })),
    ai: v.optional(v.object({
      matchStrictness: v.union(v.literal("relaxed"), v.literal("strict")),
      summaryDepth: v.union(v.literal("bullet_points"), v.literal("executive_summary"), v.literal("in_depth")),
      interviewPersona: v.union(v.literal("friendly_recruiter"), v.literal("technical_lead"), v.literal("rigorous_hiring_manager")),
      focusAreas: v.array(v.string()),
    })),
    defaults: v.optional(v.object({
      currency: v.string(),
      defaultSources: v.array(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("userSettings", {
        userId,
        appearance: args.appearance ?? DEFAULT_SETTINGS.appearance,
        ai: args.ai ?? DEFAULT_SETTINGS.ai,
        defaults: args.defaults ?? DEFAULT_SETTINGS.defaults,
        updatedAt: Date.now(),
      });
    }
  },
});
