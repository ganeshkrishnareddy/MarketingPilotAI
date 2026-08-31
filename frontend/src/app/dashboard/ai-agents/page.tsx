"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bot,
  FileText,
  Search,
  Megaphone,
  BarChart3,
  Play,
  Square,
  Activity,
  Cpu,
  Zap,
  CheckCircle2,
} from "lucide-react";

interface Agent {
  id: number;
  name: string;
  role: string;
  description: string;
  capabilities: string[];
  icon: React.ReactNode;
  color: string;
  glowColor: string;
  running: boolean;
  tasksToday: number;
  successRate: number;
  lastAction: string;
}

const initialAgents: Agent[] = [
  {
    id: 1,
    name: "Content Agent",
    role: "Content Generation",
    description:
      "Generates SEO-optimised blog posts, social captions, email copy, and ad creatives tailored to your brand voice and target audience.",
    capabilities: ["Blog Posts", "Social Captions", "Email Copy", "Ad Copy"],
    icon: <FileText className="h-6 w-6" />,
    color: "from-blue-600/30 to-cyan-600/10",
    glowColor: "shadow-blue-500/20",
    running: true,
    tasksToday: 14,
    successRate: 98,
    lastAction: "Generated LinkedIn post — 3 min ago",
  },
  {
    id: 2,
    name: "SEO Agent",
    role: "Search Optimisation",
    description:
      "Audits pages, researches keywords, rewrites meta tags, and builds internal link structures to improve organic search rankings.",
    capabilities: ["Keyword Research", "Meta Tags", "Content Audit", "Link Building"],
    icon: <Search className="h-6 w-6" />,
    color: "from-violet-600/30 to-purple-600/10",
    glowColor: "shadow-violet-500/20",
    running: true,
    tasksToday: 9,
    successRate: 95,
    lastAction: "Optimised 5 product pages — 18 min ago",
  },
  {
    id: 3,
    name: "Ad Agent",
    role: "Paid Media Management",
    description:
      "Monitors campaign performance in real-time, adjusts bidding strategies, rotates ad creatives, and pauses under-performing ads automatically.",
    capabilities: ["Bid Optimisation", "Creative Rotation", "Budget Pacing", "A/B Testing"],
    icon: <Megaphone className="h-6 w-6" />,
    color: "from-amber-600/30 to-orange-600/10",
    glowColor: "shadow-amber-500/20",
    running: false,
    tasksToday: 32,
    successRate: 91,
    lastAction: "Paused 2 low-ROAS ads — 2 hr ago",
  },
  {
    id: 4,
    name: "Analytics Agent",
    role: "Performance Intelligence",
    description:
      "Aggregates data across all channels, detects anomalies, generates narrative performance reports, and surfaces actionable recommendations.",
    capabilities: ["Multi-channel Reports", "Anomaly Detection", "Attribution", "Forecasting"],
    icon: <BarChart3 className="h-6 w-6" />,
    color: "from-green-600/30 to-emerald-600/10",
    glowColor: "shadow-green-500/20",
    running: true,
    tasksToday: 7,
    successRate: 99,
    lastAction: "Sent weekly digest to Slack — 1 hr ago",
  },
];

export default function AIAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);

  const toggleAgent = (id: number) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, running: !a.running } : a))
    );
  };

  const runningCount = agents.filter((a) => a.running).length;

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-500/20 border border-violet-500/30">
            <Bot className="h-6 w-6 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">AI Agents</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {runningCount} of {agents.length} agents running
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
            <Activity className="h-3.5 w-3.5 text-green-400 animate-pulse" />
            <span className="text-xs text-green-400 font-medium">System Healthy</span>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Running Agents", value: runningCount, icon: <Bot className="h-4 w-4 text-violet-400" /> },
          { label: "Tasks Today", value: agents.reduce((s, a) => s + a.tasksToday, 0), icon: <Zap className="h-4 w-4 text-amber-400" /> },
          { label: "Avg. Success Rate", value: `${Math.round(agents.reduce((s, a) => s + a.successRate, 0) / agents.length)}%`, icon: <CheckCircle2 className="h-4 w-4 text-green-400" /> },
          { label: "CPU Usage", value: "34%", icon: <Cpu className="h-4 w-4 text-cyan-400" /> },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
              {s.icon} {s.label}
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className={`glass-panel rounded-2xl p-5 bg-gradient-to-br ${agent.color} border border-white/10 hover:border-white/20 transition-all duration-300 shadow-lg ${agent.glowColor}`}
          >
            {/* Card Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 text-white">
                  {agent.icon}
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">{agent.name}</h2>
                  <p className="text-xs text-slate-400">{agent.role}</p>
                </div>
              </div>
              <Badge
                variant="outline"
                className={
                  agent.running
                    ? "border-green-500/50 text-green-400 bg-green-500/10 text-xs gap-1"
                    : "border-slate-500/50 text-slate-400 bg-slate-500/10 text-xs gap-1"
                }
              >
                <span
                  className={`inline-block h-1.5 w-1.5 rounded-full ${
                    agent.running ? "bg-green-400 animate-pulse" : "bg-slate-500"
                  }`}
                />
                {agent.running ? "Running" : "Idle"}
              </Badge>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              {agent.description}
            </p>

            {/* Capabilities */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {agent.capabilities.map((cap) => (
                <span
                  key={cap}
                  className="text-xs px-2 py-0.5 rounded-md bg-white/8 border border-white/10 text-slate-300"
                >
                  {cap}
                </span>
              ))}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-xs text-slate-400 mb-0.5">Tasks Today</p>
                <p className="text-lg font-bold text-white">{agent.tasksToday}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-xs text-slate-400 mb-0.5">Success Rate</p>
                <p className="text-lg font-bold text-white">{agent.successRate}%</p>
              </div>
            </div>

            {/* Last Action + Button */}
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500 truncate">{agent.lastAction}</p>
              <Button
                size="sm"
                onClick={() => toggleAgent(agent.id)}
                className={`gap-1.5 text-xs shrink-0 ${
                  agent.running
                    ? "bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30"
                    : "bg-green-500/20 border border-green-500/40 text-green-400 hover:bg-green-500/30"
                }`}
                variant="ghost"
              >
                {agent.running ? (
                  <>
                    <Square className="h-3.5 w-3.5" /> Stop
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" /> Start
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
