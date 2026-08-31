"use client";

import * as React from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  Users,
  IndianRupee,
  Calendar,
  Briefcase,
  Globe,
  ListTodo,
  Bot,
  MessageCircle,
  Camera,
  Mic,
  Mail,
  Gauge,
  Filter,
  UserPlus,
  CalendarCheck,
  Trophy,
  Sparkles,
  Send,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  X,
  Zap,
  CheckCircle2,
  Loader2,
  Database,
} from "lucide-react";
import { pb } from "@/lib/pocketbase";

/* --------------------------------- helpers --------------------------------- */

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function daysAgo(dateStr: string | undefined, days: number) {
  if (!dateStr) return false;
  const t = new Date(dateStr).getTime();
  if (isNaN(t)) return false;
  return Date.now() - t <= days * 86400000;
}

function bucketByDay(records: any[], days = 14) {
  const out: { label: string; value: number }[] = [];
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(now.getDate() - (days - 1));
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    out.push({
      label: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      value: 0,
    });
  }
  for (const r of records) {
    if (!r.created) continue;
    const d = new Date(r.created);
    if (isNaN(d.getTime())) continue;
    const idx = Math.floor((d.getTime() - start.getTime()) / 86400000);
    if (idx >= 0 && idx < days) out[idx].value += 1;
  }
  return out;
}

function bucketRevenue(records: any[], days = 14) {
  const out = bucketByDay(records, days).map((b) => ({ label: b.label, value: 0 }));
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(now.getDate() - (days - 1));
  for (const r of records) {
    if (!r.created) continue;
    const d = new Date(r.created);
    if (isNaN(d.getTime())) continue;
    const idx = Math.floor((d.getTime() - start.getTime()) / 86400000);
    if (idx >= 0 && idx < days) out[idx].value += Number(r.revenue) || Number(r.value) || 0;
  }
  return out;
}

/* ---------------------------------- page ---------------------------------- */

export default function DashboardPage() {
  const [state, setState] = React.useState<{
    loading: boolean;
    error: string | null;
    leads: any[];
    deals: any[];
    activities: any[];
    aiTasks: any[];
    aiWorkflows: any[];
    reportsCount: number;
  }>({
    loading: true,
    error: null,
    leads: [],
    deals: [],
    activities: [],
    aiTasks: [],
    aiWorkflows: [],
    reportsCount: 0,
  });

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [leads, deals, activities, aiTasks, aiWorkflows, reports] = await Promise.all([
          pb.collection("leads").getFullList({ sort: "-created", requestKey: null }).catch(() => []),
          pb.collection("deals").getFullList({ sort: "-created", requestKey: null }).catch(() => []),
          pb.collection("activities").getFullList({ sort: "-created", requestKey: null }).catch(() => []),
          pb.collection("ai_tasks").getFullList({ sort: "-created", requestKey: null }).catch(() => []),
          pb.collection("ai_workflows").getFullList({ sort: "-created", requestKey: null }).catch(() => []),
          pb.collection("ai_analysis_reports").getList(1, 1, { requestKey: null }).catch(() => ({ totalItems: 0 })),
        ]);
        if (cancelled) return;
        setState({
          loading: false,
          error: null,
          leads: Array.isArray(leads) ? leads : [],
          deals: Array.isArray(deals) ? deals : [],
          activities: Array.isArray(activities) ? activities : [],
          aiTasks: Array.isArray(aiTasks) ? aiTasks : [],
          aiWorkflows: Array.isArray(aiWorkflows) ? aiWorkflows : [],
          reportsCount: reports?.totalItems ?? 0,
        });
      } catch (e: any) {
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: e?.message || "Failed to load data" }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ----- derived metrics (all real, computed from PocketBase) ----- */
  const totalLeads = state.leads.length;
  const wonDeals = state.deals.filter((d) => (d.winLoss || "").toLowerCase() === "won" || (d.stage || "").toLowerCase() === "won");
  const openDeals = state.deals.filter((d) => (d.winLoss || "open").toLowerCase() !== "won" && (d.winLoss || "open").toLowerCase() !== "lost");
  const revenue = wonDeals.reduce((acc, d) => acc + (Number(d.revenue) || Number(d.value) || 0), 0);
  const openTasks = state.aiTasks.filter((t) => (t.status || "Pending").toLowerCase() !== "completed").length;

  const weeklyNewLeads = state.leads.filter((l) => daysAgo(l.created, 7)).length;
  const weeklyNewDeals = wonDeals.filter((d) => daysAgo(d.created, 7)).length;
  const weeklyNewActivities = state.activities.filter((a) => daysAgo(a.created, 7)).length;

  const leadsPerDay = bucketByDay(state.leads);
  const revenuePerDay = bucketRevenue(wonDeals);

  const funnelStages = [
    { label: "Leads", count: totalLeads, sub: "all leads" },
    { label: "Qualified", count: state.leads.filter((l) => (l.status || "").toLowerCase() === "qualified").length, sub: "status = Qualified" },
    { label: "Won", count: wonDeals.length, sub: "deals won" },
  ];
  const funnelMax = Math.max(...funnelStages.map((s) => s.count), 1);

  const sourceMap = new Map<string, number>();
  for (const l of state.leads) {
    const src = (l.source || "Unknown").trim() || "Unknown";
    sourceMap.set(src, (sourceMap.get(src) || 0) + 1);
  }
  const sourceColors = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#94a3b8"];
  const leadSources = Array.from(sourceMap.entries()).map(([name, value], i) => ({
    name,
    value,
    color: sourceColors[i % sourceColors.length],
  }));

  const recentEvents: { icon: React.ElementType; color: string; text: string; time: string; ts: number }[] = [
    ...state.leads.slice(0, 5).map((l) => ({
      icon: UserPlus,
      color: "bg-blue-100 text-blue-600",
      text: `New lead: ${`${l.first_name || ""} ${l.last_name || ""}`.trim() || "received"}`,
      time: timeAgo(l.created),
      ts: new Date(l.created).getTime() || 0,
    })),
    ...state.deals.slice(0, 5).map((d) => ({
      icon: Trophy,
      color: "bg-cyan-100 text-cyan-600",
      text: `New deal: ${d.title || "Untitled deal"}`,
      time: timeAgo(d.created),
      ts: new Date(d.created).getTime() || 0,
    })),
    ...state.activities.slice(0, 5).map((a) => ({
      icon: CalendarCheck,
      color: "bg-violet-100 text-violet-600",
      text: `Activity: ${a.type || a.title || "log entry"}`,
      time: timeAgo(a.created),
      ts: new Date(a.created).getTime() || 0,
    })),
  ]
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 5);

  const conversionRate = totalLeads > 0 ? ((wonDeals.length / totalLeads) * 100).toFixed(2) : null;

  const kpiCards = [
    {
      label: "Total Leads",
      value: totalLeads.toLocaleString(),
      icon: Users,
      color: "#2563eb",
      delta: weeklyNewLeads > 0 ? `+${weeklyNewLeads} this week` : null,
      up: true,
      spark: leadsPerDay.map((d) => d.value),
      emptyHint: { text: "No leads yet — add your first", href: "/dashboard/leads" },
      href: "/dashboard/leads",
    },
    {
      label: "Revenue",
      value: inr(revenue),
      icon: IndianRupee,
      color: "#10b981",
      delta: weeklyNewDeals > 0 ? `+${inr(weeklyNewDeals)} this week` : null,
      up: true,
      spark: revenuePerDay.map((d) => Math.round(d.value / 1000)),
      emptyHint: { text: "No won deals yet — move deals to Won", href: "/dashboard/crm" },
      href: "/dashboard/crm",
    },
    {
      label: "Appointments",
      value: state.activities.length.toLocaleString(),
      icon: Calendar,
      color: "#8b5cf6",
      delta: weeklyNewActivities > 0 ? `+${weeklyNewActivities} this week` : null,
      up: true,
      spark: bucketByDay(state.activities).map((d) => d.value),
      emptyHint: { text: "No appointments yet", href: "/dashboard/appointment-booking" },
      href: "/dashboard/appointment-booking",
    },
    {
      label: "Deals Won",
      value: wonDeals.length.toLocaleString(),
      icon: Briefcase,
      color: "#f59e0b",
      delta: weeklyNewDeals > 0 ? `+${weeklyNewDeals} this week` : null,
      up: true,
      spark: bucketByDay(wonDeals).map((d) => d.value),
      emptyHint: { text: "No won deals yet", href: "/dashboard/crm" },
      href: "/dashboard/crm",
    },
    {
      label: "Website Visitors",
      value: "—",
      icon: Globe,
      color: "#06b6d4",
      delta: null,
      up: true,
      spark: [],
      emptyHint: { text: "Connect website analytics" },
      href: "/dashboard/analytics",
    },
    {
      label: "Open Tasks",
      value: openTasks.toLocaleString(),
      icon: ListTodo,
      color: "#ef4444",
      delta: null,
      up: false,
      spark: bucketByDay(state.aiTasks.filter((t) => (t.status || "").toLowerCase() !== "completed")).map((d) => d.value),
      emptyHint: { text: "No AI tasks in queue", href: "/dashboard/tasks" },
      href: "/dashboard/tasks",
    },
  ];

  const automationCards = [
    { title: "AI Automation", icon: Bot, color: "bg-blue-100 text-blue-600", stat: state.aiWorkflows.length > 0 ? `${state.aiWorkflows.length} workflows` : "No workflows yet", url: "/dashboard/workflows" },
    { title: "WhatsApp Automation", icon: MessageCircle, color: "bg-emerald-100 text-emerald-600", stat: state.aiTasks.length > 0 ? `${state.aiTasks.length} queued tasks` : "No automations yet", url: "/dashboard/whatsapp-ai" },
    { title: "Instagram DM Automation", icon: Camera, color: "bg-pink-100 text-pink-600", stat: "Not connected", url: "/dashboard/instagram-automation" },
    { title: "AI Voice Agent", icon: Mic, color: "bg-violet-100 text-violet-600", stat: "Not connected", url: "/dashboard/voice-ai" },
    { title: "Email Marketing", icon: Mail, color: "bg-amber-100 text-amber-600", stat: "No campaigns yet", url: "/dashboard/email-marketing" },
    { title: "Google Ads", icon: Gauge, color: "bg-orange-100 text-orange-600", stat: "Not connected", url: "/dashboard/google-ads" },
    { title: "CRM Pipeline", icon: Filter, color: "bg-indigo-100 text-indigo-600", stat: openDeals.length > 0 ? `${openDeals.length} open deals` : "No open deals", url: "/dashboard/crm" },
  ];

  const analyticsMetrics = [
    { label: "Conversion Rate", value: conversionRate !== null ? `${conversionRate}%` : "—", delta: null, up: true },
    { label: "Cost Per Lead", value: "—", delta: null, up: true, note: "Connect ad platforms" },
    { label: "ROAS", value: "—", delta: null, up: true, note: "Connect ad platforms" },
    { label: "Avg. Response Time", value: "—", delta: null, up: false, note: "Connect inbox" },
  ];

  return (
    <div className="space-y-5 font-sans">
      {/* Row 1: KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpiCards.map((card) => (
          <Link key={card.label} href={card.href} className="group">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)] transition-all group-hover:-translate-y-0.5 group-hover:border-blue-200 group-hover:shadow-[0_12px_28px_-12px_rgba(37,99,235,0.25)]">
              <div className="flex items-start justify-between">
                <span className="text-xs font-medium text-slate-500">{card.label}</span>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.color === "#ef4444" ? "bg-red-50" : "bg-slate-50"}`}>
                  <card.icon className="h-4 w-4" style={{ color: card.color }} />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900">{card.value}</span>
                {card.delta && (
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600">
                    {card.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {card.delta}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[10px] text-slate-400">vs last 30 days</p>
              {card.spark.length > 0 && card.spark.some((v) => v > 0) ? (
                <div className="mt-2 flex justify-end">
                  <Sparkline data={card.spark} color={card.color} />
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-1 text-[10px] font-medium text-[#2563eb]">
                  <ArrowRight className="h-3 w-3" />
                  {card.emptyHint.text}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Row 2: Revenue overview + funnel + sources */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* Revenue Overview */}
        <Card className="p-5 lg:col-span-2">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">Revenue Overview</h2>
            <button className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50">
              All time
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">{inr(revenue)}</span>
            {wonDeals.length > 0 && (
              <span className="text-xs font-medium text-slate-500">{wonDeals.length} won deal{wonDeals.length === 1 ? "" : "s"}</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">Won-deal revenue (from CRM)</p>
          {revenuePerDay.some((d) => d.value > 0) ? (
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenuePerDay} margin={{ top: 5, right: 5, bottom: 0, left: 5 }}>
                  <defs>
                    <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="label" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 10 }} tickLine={false} axisLine={false} interval={2} />
                  <YAxis stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))} />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(value: any) => [inr(Number(value)), "Revenue"]}
                    labelStyle={{ color: "#64748b", fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2.5} fill="url(#revFill)" activeDot={{ r: 5, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyPanel
              icon={IndianRupee}
              title="No revenue data yet"
              text="Move deals to Won in the CRM and your revenue will appear here automatically."
              cta={{ label: "Open CRM", href: "/dashboard/crm" }}
            />
          )}
        </Card>

        {/* Sales Funnel */}
        <Card className="p-5">
          <SectionHeader title="Sales Funnel" action="View all" href="/dashboard/reports" />
          {funnelMax > 1 ? (
            <div className="mt-4 flex flex-col items-center gap-2.5">
              {funnelStages.map((stage, i) => (
                <div key={stage.label} className="flex w-full items-center gap-3">
                  <div
                    className="flex h-9 items-center justify-between rounded-lg px-3 transition-all"
                    style={{ width: `${Math.max((stage.count / funnelMax) * 100, 30)}%`, backgroundColor: i === 2 ? "#1d4ed8" : `rgba(37, 99, 235, ${0.95 - i * 0.22})` }}
                  >
                    <span className="truncate text-[11px] font-medium text-white">{stage.label}</span>
                    <span className="ml-2 shrink-0 text-[11px] font-bold text-white">{stage.count}</span>
                  </div>
                </div>
              ))}
              <p className="text-[10px] text-slate-400">Live from leads &amp; deals</p>
            </div>
          ) : (
            <EmptyPanel icon={Filter} title="No funnel data yet" text="Add leads and move deals to Won to see your funnel." cta={{ label: "Add leads", href: "/dashboard/leads" }} />
          )}
        </Card>

        {/* Leads by Source */}
        <Card className="p-5">
          <SectionHeader title="Leads by Source" action="View all" href="/dashboard/analytics" />
          {leadSources.length > 0 ? (
            <div className="mt-2 flex flex-col items-center">
              <div className="relative h-40 w-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={leadSources} cx="50%" cy="50%" innerRadius={52} outerRadius={72} paddingAngle={3} dataKey="value" stroke="none">
                      {leadSources.map((s, i) => (
                        <Cell key={i} fill={s.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={chartTooltipStyle} formatter={(v: any) => [String(v), ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-slate-900">{totalLeads.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400">Leads</span>
                </div>
              </div>
              <div className="mt-3 grid w-full grid-cols-2 gap-x-3 gap-y-1.5">
                {leadSources.map((s) => (
                  <div key={s.name} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="flex-1 truncate text-[11px] text-slate-500">{s.name}</span>
                    <span className="text-[11px] font-semibold text-slate-700">{totalLeads > 0 ? Math.round((s.value / totalLeads) * 1000) / 10 : 0}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyPanel icon={Users} title="No leads yet" text="Leads are grouped by their source field once you add them." cta={{ label: "Add leads", href: "/dashboard/leads" }} />
          )}
        </Card>
      </div>

      {/* Row 3: Automations + activity + appointments */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Automations */}
        <Card className="p-5 xl:col-span-2">
          <SectionHeader title="Automations" action="Manage" href="/dashboard/workflows" />
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {automationCards.map((a) => (
              <Link
                key={a.title}
                href={a.url}
                className="group rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-[0_8px_20px_-8px_rgba(37,99,235,0.25)]"
              >
                <div className="flex items-center justify-between">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${a.color}`}>
                    <a.icon className="h-4 w-4" />
                  </div>
                  {a.stat.includes("workflows") || a.stat.includes("tasks") || a.stat.includes("deals") || a.stat.includes("reports") ? (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">Active</span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400">Setup</span>
                  )}
                </div>
                <p className="mt-2.5 text-[13px] font-semibold leading-tight text-slate-800">{a.title}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">{a.stat}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[#2563eb] opacity-0 transition-opacity group-hover:opacity-100">
                  Manage <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </Card>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Recent Activity */}
          <Card className="p-5">
            <SectionHeader title="Recent Activity" action="View all" href="/dashboard/insights" />
            {recentEvents.length > 0 ? (
              <div className="mt-3 space-y-3">
                {recentEvents.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.color}`}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-slate-700">{item.text}</p>
                    </div>
                    <span className="shrink-0 text-[11px] text-slate-400">{item.time}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyPanel icon={ActivityIcon} title="No activity yet" text="New leads, deals, and activities will show up here in real time." cta={{ label: "Add a lead", href: "/dashboard/leads" }} />
            )}
          </Card>

          {/* Upcoming Appointments */}
          <Card className="p-5">
            <SectionHeader title="Upcoming Appointments" action="View all" href="/dashboard/appointment-booking" />
            {state.activities.filter((a) => a.datetime && new Date(a.datetime).getTime() > Date.now()).length > 0 ? (
              <div className="mt-3 space-y-3">
                {state.activities
                  .filter((a) => a.datetime && new Date(a.datetime).getTime() > Date.now())
                  .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
                  .slice(0, 5)
                  .map((appt, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${["bg-blue-600", "bg-emerald-600", "bg-violet-600"][i % 3]}`}>
                        {(appt.title || appt.type || "APT").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-slate-800">{appt.title || appt.type || "Appointment"}</p>
                        <p className="truncate text-[11px] text-slate-400">{appt.datetime ? new Date(appt.datetime).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}</p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <EmptyPanel icon={Calendar} title="No upcoming appointments" text="Booked appointments with a future date appear here." cta={{ label: "Booking page", href: "/dashboard/appointment-booking" }} />
            )}
          </Card>
        </div>
      </div>

      {/* Row 4: workflows + analytics + campaigns */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="flex flex-col gap-4 xl:col-span-2">
          {/* Automation Workflows */}
          <Card className="p-5">
            <SectionHeader title="Automation Workflows" action="View all" href="/dashboard/workflows" />
            {state.aiWorkflows.length > 0 ? (
              <div className="mt-3 divide-y divide-slate-100">
                {state.aiWorkflows.map((wf) => (
                  <div key={wf.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Zap className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-slate-800">{wf.name || wf.title || "Untitled workflow"}</p>
                        <p className="truncate text-[11px] text-slate-400">{wf.description || `Trigger: ${wf.trigger || "manual"}`}</p>
                      </div>
                    </div>
                    <Toggle defaultOn={(wf.enabled ?? true) === true} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyPanel icon={Zap} title="No workflows yet" text="Build your first trigger → action workflow in the Workflow Builder." cta={{ label: "Create workflow", href: "/dashboard/workflows" }} />
            )}
          </Card>

          {/* Analytics Overview */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">Analytics Overview</h2>
              <span className="text-[11px] text-slate-400">Live from CRM</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {analyticsMetrics.map((m) => (
                <div key={m.label} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <p className="text-[11px] text-slate-400">{m.label}</p>
                  <p className="mt-1 text-lg font-bold tracking-tight text-slate-900">{m.value}</p>
                  {m.delta ? (
                    <p className={`mt-0.5 inline-flex items-center gap-0.5 text-[11px] font-semibold ${m.up ? "text-emerald-600" : "text-red-500"}`}>
                      {m.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {m.delta}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-[10px] text-slate-400">{m.note || "—"}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 h-40">
              {leadsPerDay.some((d) => d.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leadsPerDay} margin={{ top: 5, right: 5, bottom: 0, left: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="label" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 10 }} tickLine={false} axisLine={false} interval={2} />
                    <YAxis stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: "rgba(37,99,235,0.06)" }} />
                    <Bar dataKey="value" name="New leads" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                  New-lead trend appears here as leads are added
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Top Performing Campaigns */}
        <Card className="p-5">
          <SectionHeader title="Top Performing Campaigns" action="View all" href="/dashboard/email-marketing" />
          <EmptyPanel
            icon={Trophy}
            title="No campaign data yet"
            text="Once campaigns are running through Email Marketing or Ads, their lead counts and cost-per-lead will rank here."
            cta={{ label: "Create campaign", href: "/dashboard/email-marketing/create" }}
          />
          <div className="mt-5 rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2563eb] text-white">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-800">Dashboard is live</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                  All numbers above come straight from your PocketBase database — no simulated data.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <footer className="pb-2 pt-4 text-center text-xs text-slate-400">© 2024 Vision 360. All rights reserved.</footer>

      {/* Floating AI Assistant */}
      <AiAssistant />
    </div>
  );
}

/* ------------------------------- components ------------------------------- */

function timeAgo(dateStr: string | undefined) {
  if (!dateStr) return "";
  const t = new Date(dateStr).getTime();
  if (isNaN(t)) return "";
  const mins = Math.max(1, Math.round((Date.now() - t) / 60000));
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const width = 96;
  const height = 32;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1 || 1);
  const points = data.map((v, i) => `${(i * step).toFixed(1)},${(height - 4 - ((v - min) / range) * (height - 8)).toFixed(1)}`);
  const id = React.useId();
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${points.join(" ")} ${width},${height}`} fill={`url(#spark-${id})`} />
      <polyline points={points.join(" ")} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Toggle({ defaultOn = true }: { defaultOn?: boolean }) {
  const [on, setOn] = React.useState(defaultOn);
  return (
    <button
      onClick={() => setOn((v) => !v)}
      aria-pressed={on}
      className={`relative h-5.5 w-10 shrink-0 rounded-full transition-colors duration-200 ${on ? "bg-[#2563eb]" : "bg-slate-200"}`}
    >
      <span className={`absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white shadow transition-all duration-200 ${on ? "left-5" : "left-0.5"}`} />
    </button>
  );
}

const chartTooltipStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
  fontSize: "12px",
  color: "#0f172a",
};

function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)] ${className}`}>
      {children}
    </div>
  );
}

function SectionHeader({ title, action, href }: { title: string; action?: string; href?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">{title}</h2>
      {action && (
        <Link href={href || "/dashboard"} className="inline-flex items-center gap-1 text-xs font-medium text-[#2563eb] hover:text-blue-700">
          {action}
          <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

function EmptyPanel({
  icon: Icon,
  title,
  text,
  cta,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
  cta?: { label: string; href: string };
}) {
  return (
    <div className="mt-3 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/40 px-4 py-8 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-[13px] font-semibold text-slate-700">{title}</p>
      <p className="mt-1 max-w-[220px] text-[11px] leading-relaxed text-slate-400">{text}</p>
      {cta && (
        <Link href={cta.href} className="mt-3 inline-flex items-center gap-1 rounded-lg bg-[#2563eb] px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-blue-600">
          {cta.label}
          <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

const ActivityIcon = Database;

/* ------------------------------ AI assistant ------------------------------ */

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const assistantChips = [
  "Show me today's insights",
  "Create a follow-up campaign",
  "Generate AI content",
  "Analyze my ads performance",
];

function AiAssistant() {
  const [open, setOpen] = React.useState(true);
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    { role: "assistant", content: "Hello Vicky! 👋\nHow can I help grow your business today?" },
  ]);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const send = async (text: string) => {
    const prompt = text.trim();
    if (!prompt || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: prompt }]);
    setBusy(true);
    try {
      const res = await fetch("/api/ai/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt:
            "You are the Vision 360 AI Business Growth Assistant. You help Vicky run her agency: summarize insights, suggest campaigns, draft content, and recommend actions. Be concise, friendly, and actionable. Use short bullet points when useful.",
          userPrompt: prompt,
          taskType: "Chat",
        }),
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.details || "Failed to reach AI provider");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const next = [...m];
          next[next.length - 1] = { role: "assistant", content: acc };
          return next;
        });
      }
      if (!acc.trim()) {
        setMessages((m) => [
          ...m.slice(0, -1),
          {
            role: "assistant",
            content: "I couldn't reach the AI provider right now. Make sure an AI provider is configured in AI Settings, then try again.",
          },
        ]);
      }
    } catch (e: any) {
      setMessages((m) => [...m, { role: "assistant", content: `⚠️ ${e.message || "Something went wrong. Please try again."}` }]);
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#172554] text-white shadow-2xl shadow-blue-900/40 transition-transform hover:scale-105"
        aria-label="Open AI Assistant"
      >
        <Sparkles className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-[#172554] shadow-2xl shadow-blue-950/50 ring-1 ring-white/10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
            <Sparkles className="h-4 w-4 text-sky-300" />
          </div>
          <div className="leading-tight">
            <span className="block text-sm font-semibold text-white">AI Assistant</span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Online
            </span>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Minimize AI Assistant"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div ref={scrollRef} className="flex max-h-72 flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
              msg.role === "assistant" ? "self-start rounded-tl-sm bg-white/10 text-slate-100" : "self-end rounded-tr-sm bg-[#2563eb] text-white"
            }`}
          >
            {msg.role === "assistant" ? (
              <ReactMarkdown
                components={{
                  p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({children}) => <ul className="mb-2 list-disc pl-4">{children}</ul>,
                  ol: ({children}) => <ol className="mb-2 list-decimal pl-4">{children}</ol>,
                  li: ({children}) => <li className="mb-1">{children}</li>,
                  strong: ({children}) => <strong className="font-semibold text-white">{children}</strong>,
                  em: ({children}) => <em className="italic text-slate-300">{children}</em>,
                  code: ({children}) => <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">{children}</code>,
                  blockquote: ({children}) => <blockquote className="border-l-2 border-cyan-400/50 pl-3 italic text-slate-300">{children}</blockquote>,
                }}
              >
                {msg.content}
              </ReactMarkdown>
            ) : msg.content}
          </div>
        ))}
        {busy && (
          <div className="flex items-center gap-2 self-start rounded-2xl rounded-tl-sm bg-white/10 px-3.5 py-2.5 text-[13px] text-slate-200">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking...
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 px-4 pb-2">
        {assistantChips.map((chip) => (
          <button
            key={chip}
            onClick={() => send(chip)}
            disabled={busy}
            className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-sky-100 transition-colors hover:bg-white/20 disabled:opacity-50"
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="border-t border-white/10 p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            className="flex-1 bg-transparent text-[13px] text-white placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#2563eb] text-white transition-colors hover:bg-blue-500 disabled:opacity-40"
            aria-label="Send message"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
