import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";

export const getUnread = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) => q.eq("userId", identity.subject).eq("isRead", false))
      .order("desc")
      .collect();
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

export const markAsRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const notification = await ctx.db.get(args.id);
    if (!notification || notification.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.id, { isRead: true });
  },
});

export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) => q.eq("userId", identity.subject).eq("isRead", false))
      .collect();

    for (const notif of unread) {
      await ctx.db.patch(notif._id, { isRead: true });
    }
  },
});

// Internal mutation triggered by cron job to scan and generate alerts globally
export const generateDailyAlerts = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const IN_24_HOURS = now + ONE_DAY_MS;

    // 1. Upcoming interviews
    const allInterviews = await ctx.db.query("interviews").collect();
    for (const interview of allInterviews) {
      if (
        interview.status === "upcoming" &&
        interview.scheduledAt > now &&
        interview.scheduledAt <= IN_24_HOURS
      ) {
        // Did we already send this reminder? Check recent notifications.
        const existing = await ctx.db
          .query("notifications")
          .withIndex("by_user", (q) => q.eq("userId", interview.userId))
          .filter((q) => q.eq(q.field("type"), "interview_reminder"))
          .filter((q) => q.eq(q.field("link"), `/applications/${interview.applicationId}`))
          .collect();

        const recentlySent = existing.some((n) => now - n.createdAt < ONE_DAY_MS);

        if (!recentlySent) {
          await ctx.db.insert("notifications", {
            userId: interview.userId,
            type: "interview_reminder",
            title: "Interview Tomorrow",
            message: `You have an upcoming ${interview.type} interview for "${interview.title}". Don't forget to prepare!`,
            link: `/applications/${interview.applicationId}`,
            isRead: false,
            createdAt: now,
          });
        }
      }
    }

    // 2. Application Stalled
    // If an application has been in 'applied' or 'interview' for > 14 days and NO activities in last 14 days.
    const FOURTEEN_DAYS_MS = 14 * ONE_DAY_MS;
    const allApplications = await ctx.db.query("applications").collect();

    for (const app of allApplications) {
      if (app.stage === "applied" || app.stage === "interview") {
        // Check last activity log on this app
        const lastActivity = await ctx.db
          .query("activities")
          .withIndex("by_application", (q) => q.eq("applicationId", app._id))
          .order("desc")
          .first();

        const lastActionTime = lastActivity ? lastActivity.timestamp : (app.appliedAt || app._creationTime);

        if (now - lastActionTime > FOURTEEN_DAYS_MS) {
          // Send reminder if not recently sent
          const existing = await ctx.db
            .query("notifications")
            .withIndex("by_user", (q) => q.eq("userId", app.userId))
            .filter((q) => q.eq(q.field("type"), "application_stalled"))
            .filter((q) => q.eq(q.field("link"), `/applications/${app._id}`))
            .collect();

          // Only send this nudge once every 14 days per stalled app
          const recentlySent = existing.some((n) => now - n.createdAt < FOURTEEN_DAYS_MS);

          if (!recentlySent) {
            await ctx.db.insert("notifications", {
              userId: app.userId,
              type: "application_stalled",
              title: "Follow-up Reminder",
              message: `It's been 2 weeks since your last tracked activity for the ${app.role} role at ${app.company}. Consider sending a follow-up.`,
              link: `/applications/${app._id}`,
              isRead: false,
              createdAt: now,
            });
          }
        }
      }
    }
  },
});
