import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "generate-daily-alerts",
  { hourUTC: 12, minuteUTC: 0 }, // Run every day at noon UTC (or adjust timing as preferred)
  internal.notifications.generateDailyAlerts
);

export default crons;
