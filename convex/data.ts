
import { query, mutation } from "./_generated/server";
import { api } from "./_generated/api";

export const exportAllData = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const profile: any = await ctx.runQuery(api.profile.getProfile);
    const settings: any = await ctx.runQuery(api.settings.get);
    
    // Fetch all applications created by user
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    // Prepare a clean structured payload
    return {
      metadata: {
        exportDate: new Date().toISOString(),
        version: "1.0",
      },
      profile,
      settings,
      applications,
    };
  },
});

export const eraseWorkspace = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const userId = identity.subject;

    // 1. Delete Profile
    const profile = await ctx.db
      .query("profile")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (profile) {
      await ctx.db.delete(profile._id);
    }

    // 2. Delete Settings
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (settings) {
      await ctx.db.delete(settings._id);
    }

    // 3. Delete all applications
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const app of applications) {
      // Delete any associated events or linked documents later if needed
      await ctx.db.delete(app._id);
    }

    return { success: true };
  },
});
