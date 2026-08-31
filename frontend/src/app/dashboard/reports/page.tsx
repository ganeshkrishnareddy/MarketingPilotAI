"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PieChart,
  Download,
  RefreshCw,
  Calendar,
  TrendingUp,
  BarChart2,
  DollarSign,
  Clock,
  CheckCircle2,
  FileText,
} from "lucide-react";

interface Report {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  lastGenerated: string;
  status: "ready" | "generating" | "outdated";
  period: string;
  size: string;
}

const reports: Report[] = [
  {
    id: "monthly-performance",
    title: "Monthly Performance",
    description:
      "Comprehensive overview of all marketing activities, KPIs, and growth metrics across every channel for the current month.",
    icon: TrendingUp,
    iconColor: "text-blue-400",
    lastGenerated: "Jul 20, 2026 · 09:14 AM",
    status: "ready",
    period: "July 2026",
    size: "2.4 MB",
  },
  {
    id: "campaign-analysis",
    title: "Campaign Analysis",
    description:
      "Deep-dive into individual campaign performance, A/B test results, audience segments, and creative effectiveness scores.",
    icon: BarChart2,
    iconColor: "text-violet-400",
    lastGenerated: "Jul 19, 2026 · 03:45 PM",
    status: "ready",
    period: "Q3 2026",
    size: "3.1 MB",
  },
  {
    id: "competitor-report",
    title: "Competitor Report",
    description:
      "AI-powered competitor intelligence covering share of voice, content strategy gaps, keyword overlap, and market positioning shifts.",
    icon: PieChart,
    iconColor: "text-rose-400",
    lastGenerated: "Jul 15, 2026 · 11:00 AM",
    status: "outdated",
    period: "Jun–Jul 2026",
    size: "1.8 MB",
  },
  {
    id: "roi-summary",
    title: "ROI Summary",
    description:
      "Financial impact report mapping ad spend to revenue attribution, customer acquisition cost trends, and lifetime value projections.",
    icon: DollarSign,
    iconColor: "text-emerald-400",
    lastGenerated: "Jul 20, 2026 · 06:00 AM",
    status: "ready",
    period: "July 2026",
    size: "1.2 MB",
  },
];

const statusConfig: Record<Report["status"], { label: string; className: string }> = {
  ready: { label: "Ready", className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  generating: { label: "Generating…", className: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  outdated: { label: "Outdated", className: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
};

export default function ReportsPage() {
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());

  const handleGenerate = (id: string) => {
    setGeneratingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setGeneratingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 2500);
  };

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-500/30">
            <PieChart className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
            <p className="text-sm text-white/50">Generate and download marketing intelligence reports</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="glass-card flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/60">
            <Calendar className="w-4 h-4" />
            <span>July 2026</span>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-500 text-white gap-2">
            <FileText className="w-4 h-4" />
            Schedule Reports
          </Button>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Reports", value: "4", sub: "available" },
          { label: "Ready to Download", value: "3", sub: "this month" },
          { label: "Auto-Scheduled", value: "2", sub: "recurring" },
          { label: "Last Refresh", value: "6h", sub: "ago" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] text-center">
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-white/70 mt-1">{s.label}</p>
            <p className="text-xs text-white/40">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          const isGenerating = generatingIds.has(report.id);
          const status = isGenerating ? "generating" : report.status;
          const { label, className } = statusConfig[status];

          return (
            <Card key={report.id} className="glass-panel border-white/10 bg-white/5 rounded-2xl overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
                      <Icon className={`w-5 h-5 ${report.iconColor}`} />
                    </div>
                    <div>
                      <CardTitle className="text-white text-base">{report.title}</CardTitle>
                      <CardDescription className="text-white/50 text-xs mt-0.5">
                        Period: {report.period}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={`text-xs border ${className} shrink-0`}>{label}</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-white/60 leading-relaxed">{report.description}</p>

                <div className="flex items-center gap-4 text-xs text-white/40 border-t border-white/10 pt-3">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {report.lastGenerated}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    {report.size}
                  </span>
                </div>

                <div className="flex gap-3 pt-1">
                  <Button
                    onClick={() => handleGenerate(report.id)}
                    disabled={isGenerating}
                    variant="outline"
                    className="flex-1 border-white/20 bg-white/5 hover:bg-white/10 text-white gap-2 text-sm"
                  >
                    {isGenerating ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    {isGenerating ? "Generating…" : "Generate Report"}
                  </Button>

                  <Button
                    disabled={status === "generating"}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white gap-2 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </Button>
                </div>

                {status === "ready" && !isGenerating && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Report is up-to-date and ready to download
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
