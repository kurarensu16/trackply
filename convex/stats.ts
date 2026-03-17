import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ── Pipeline stage counts ──
export const stageCounts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { saved: 0, applied: 0, interview: 0, offer: 0, rejected: 0, total: 0 };

    const apps = await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const counts = { saved: 0, applied: 0, interview: 0, offer: 0, rejected: 0, total: apps.length };
    for (const app of apps) {
      if (app.stage in counts) {
        counts[app.stage as keyof typeof counts]++;
      }
    }
    return counts;
  },
});

// ── Conversion funnel (percentage that moved past each stage) ──
export const conversionFunnel = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const apps = await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const total = apps.length;
    if (total === 0) return [];

    // Count apps that reached at least each stage
    const stageOrder = ["saved", "applied", "interview", "offer"];
    const stageIndex: Record<string, number> = { saved: 0, applied: 1, interview: 2, offer: 3, rejected: -1 };

    const reachedStage = stageOrder.map((stage) => {
      const idx = stageIndex[stage];
      // An app "reached" a stage if its current stage index >= this stage index
      const count = apps.filter((a) => {
        const appIdx = stageIndex[a.stage] ?? -1;
        return appIdx >= idx;
      }).length;
      return {
        stage: stage.charAt(0).toUpperCase() + stage.slice(1),
        count,
        percentage: Math.round((count / total) * 100),
      };
    });

    return reachedStage;
  },
});

// ── Applications over time (grouped by week) ──
export const volumeOverTime = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const apps = await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Group by week using _creationTime
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const weeks: { label: string; count: number; week: number }[] = [];

    for (let i = 7; i >= 0; i--) {
      const weekStart = now - (i + 1) * weekMs;
      const weekEnd = now - i * weekMs;
      const count = apps.filter(
        (a) => a._creationTime >= weekStart && a._creationTime < weekEnd
      ).length;

      const date = new Date(weekEnd);
      const label = `${date.getMonth() + 1}/${date.getDate()}`;
      weeks.push({ label, count, week: 7 - i });
    }

    return weeks;
  },
});

// ── Top sources breakdown ──
export const sourceBreakdown = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const apps = await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const sourceMap: Record<string, { total: number; interviews: number }> = {};
    for (const app of apps) {
      if (!sourceMap[app.source]) {
        sourceMap[app.source] = { total: 0, interviews: 0 };
      }
      sourceMap[app.source].total++;
      if (app.stage === "interview" || app.stage === "offer") {
        sourceMap[app.source].interviews++;
      }
    }

    return Object.entries(sourceMap)
      .map(([source, data]) => ({
        source,
        total: data.total,
        conversionRate: data.total > 0 ? Math.round((data.interviews / data.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  },
});

// ── Skill gap frequency across all apps ──
export const skillGapFrequency = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const apps = await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const skillMap: Record<string, number> = {};
    for (const app of apps) {
      if (app.skillGaps) {
        for (const skill of app.skillGaps) {
          skillMap[skill] = (skillMap[skill] || 0) + 1;
        }
      }
    }

    const totalAppsWithGaps = apps.filter((a) => a.skillGaps && a.skillGaps.length > 0).length;

    return Object.entries(skillMap)
      .map(([skill, count]) => ({
        skill,
        count,
        percentage: totalAppsWithGaps > 0 ? Math.round((count / totalAppsWithGaps) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  },
});
