import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  TrendingUp, Send, Target, Award, Briefcase,
  BarChart3, ArrowRight, Clock, CalendarCheck, Calendar, Video, Phone, MapPin, Code, MessageSquare, Users
} from "lucide-react";
import { cn } from "../lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { format, formatDistanceToNow } from "date-fns";

const INTERVIEW_TYPE_ICONS: Record<string, typeof Phone> = {
  phone: Phone, video: Video, onsite: MapPin,
  technical: Code, behavioral: MessageSquare, other: Users,
};

const STAGE_COLORS: Record<string, string> = {
  Saved: "#94A3B8",
  Applied: "#3B82F6",
  Interview: "#F59E0B",
  Offer: "#10B981",
};

export default function Dashboard() {
  const counts = useQuery(api.stats.stageCounts);
  const funnel = useQuery(api.stats.conversionFunnel);
  const volume = useQuery(api.stats.volumeOverTime);
  const sources = useQuery(api.stats.sourceBreakdown);
  const skillGaps = useQuery(api.stats.skillGapFrequency);
  const recentActivity = useQuery(api.activities.listRecent, { limit: 6 });
  const upcomingInterviews = useQuery(api.interviews.listUpcoming);

  if (!counts) return null;

  const stats = [
    {
      label: "Total Applications",
      value: counts.total,
      icon: Send,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-500/10",
    },
    {
      label: "Interview Rate",
      value: counts.total > 0 ? `${Math.round(((counts.interview + counts.offer) / counts.total) * 100)}%` : "0%",
      icon: Target,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-500/10",
    },
    {
      label: "Active Pipeline",
      value: counts.saved + counts.applied + counts.interview,
      icon: Briefcase,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-500/10",
    },
    {
      label: "Offers",
      value: counts.offer,
      icon: Award,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Dashboard</h1>
        <p className="text-text-secondary text-sm mt-1">Your job search at a glance.</p>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="card-premium p-6 group hover:shadow-[var(--shadow-premium-hover)] transition-shadow">
            <div className="flex items-start justify-between">
              <div className={cn("p-2.5 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em]">{stat.label}</p>
              <h3 className="text-3xl font-bold text-text-primary mt-1 tracking-tight">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Applications Over Time (Area Chart) */}
        <div className="lg:col-span-2 card-premium p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" /> Applications Over Time
              </h3>
              <p className="text-[10px] text-text-muted mt-0.5">Weekly volume — last 8 weeks</p>
            </div>
          </div>
          <div className="h-52">
            {volume && volume.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volume} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "var(--text-muted)", fontWeight: 600 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "var(--text-muted)", fontWeight: 600 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: 600,
                      boxShadow: "var(--shadow-premium)",
                    }}
                    labelStyle={{ color: "var(--text-secondary)", fontWeight: 700 }}
                    itemStyle={{ color: "var(--primary)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Applications"
                    stroke="var(--primary)"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorApps)"
                    dot={{ r: 4, fill: "var(--primary)", strokeWidth: 2, stroke: "var(--surface)" }}
                    activeDot={{ r: 6, strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-text-muted text-xs">
                Add applications to see your volume trend.
              </div>
            )}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="card-premium p-6">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Stage Conversion
            </h3>
            <p className="text-[10px] text-text-muted mt-0.5">How far your apps get</p>
          </div>
          <div className="space-y-4">
            {funnel && funnel.length > 0 ? (
              funnel.map((stage, i) => (
                <div key={stage.stage} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: STAGE_COLORS[stage.stage] || "#94A3B8" }}
                      />
                      <span className="text-xs font-bold text-text-primary">{stage.stage}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-text-muted">{stage.count}</span>
                      <span className="text-[10px] font-bold text-primary bg-primary-muted px-1.5 py-0.5 rounded-md">
                        {stage.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-border-subtle rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${stage.percentage}%`,
                        backgroundColor: STAGE_COLORS[stage.stage] || "#94A3B8",
                      }}
                    />
                  </div>
                  {i < funnel.length - 1 && (
                    <div className="flex justify-center">
                      <ArrowRight className="w-3 h-3 text-text-muted rotate-90" />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-text-muted text-xs">
                No data yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Upcoming Interviews ── */}
      {upcomingInterviews && upcomingInterviews.length > 0 && (
        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-primary" /> Upcoming Interviews
            </h3>
            <span className="text-[10px] font-bold text-primary bg-primary-muted px-2 py-0.5 rounded-md">
              {upcomingInterviews.length} scheduled
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingInterviews.slice(0, 6).map((interview) => {
              const TypeIcon = INTERVIEW_TYPE_ICONS[interview.type] || Users;
              return (
                <div
                  key={interview._id}
                  className="p-4 bg-surface-muted rounded-xl border border-border-subtle hover:shadow-[var(--shadow-premium-hover)] transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary-muted flex-shrink-0">
                      <TypeIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-text-primary truncate">{interview.title}</p>
                      <p className="text-[10px] text-text-muted font-medium truncate">
                        {interview.company} · {interview.role}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-text-muted">
                    <Calendar className="w-3 h-3 text-primary" />
                    {format(new Date(interview.scheduledAt), "MMM d · h:mm a")}
                    <span className="text-primary ml-auto">
                      {formatDistanceToNow(new Date(interview.scheduledAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Skill Gap Frequency */}
        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-text-primary">Skill Gaps</h3>
              <p className="text-[10px] text-text-muted mt-0.5">Most requested missing skills</p>
            </div>
            {skillGaps && skillGaps.length > 0 && (
              <span className="text-[10px] font-bold text-primary bg-primary-muted px-2 py-0.5 rounded-md">
                Top: {skillGaps[0].skill}
              </span>
            )}
          </div>
          <div className="space-y-4">
            {skillGaps && skillGaps.length > 0 ? (
              skillGaps.map((skill) => (
                <div key={skill.skill} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-text-primary">{skill.skill}</span>
                    <span className="text-text-muted">{skill.percentage}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-border-subtle rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${skill.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-text-muted text-xs">
                Run AI analysis on applications to see skill gap trends.
              </div>
            )}
          </div>
        </div>

        {/* Top Sources */}
        <div className="card-premium overflow-hidden">
          <div className="p-6 border-b border-border-subtle">
            <h3 className="text-sm font-bold text-text-primary">Top Sources</h3>
            <p className="text-[10px] text-text-muted mt-0.5">Where your applications come from</p>
          </div>
          <div className="divide-y divide-border-subtle">
            {sources && sources.length > 0 ? (
              sources.map((src, i) => {
                const colors = ["bg-blue-600", "bg-purple-600", "bg-primary", "bg-amber-600", "bg-green-600"];
                return (
                  <div key={src.source} className="px-6 py-4 flex items-center justify-between hover:bg-page-bg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white", colors[i % colors.length])}>
                        {src.source.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-text-primary">{src.source}</span>
                        <p className="text-[10px] text-text-muted">{src.total} apps</p>
                      </div>
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      src.conversionRate >= 30
                        ? "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-500/10"
                        : src.conversionRate >= 15
                        ? "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10"
                        : "text-text-muted bg-border-subtle"
                    )}>
                      {src.conversionRate}% conv.
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-text-muted text-xs">
                Add applications to see source insights.
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Recent Activity
              </h3>
              <p className="text-[10px] text-text-muted mt-0.5">Latest actions across all apps</p>
            </div>
          </div>
          <div className="space-y-3">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((act) => {
                const typeColors: Record<string, string> = {
                  created: "bg-green-500",
                  stage_change: "bg-blue-500",
                  note_updated: "bg-amber-500",
                  ai_analysis: "bg-purple-500",
                  edited: "bg-primary",
                  deleted: "bg-red-500",
                };
                return (
                  <div key={act._id} className="flex items-start gap-3 group">
                    <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", typeColors[act.type] || "bg-primary")} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-primary font-medium leading-snug truncate">
                        {act.description}
                      </p>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        {formatDistanceToNow(new Date(act.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-text-muted text-xs">
                Your activity feed will appear here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
