"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  MousePointerClick,
  ShoppingCart,
  Eye,
  Download,
  Filter,
} from "lucide-react";

interface PlatformRow {
  platform: string;
  color: string;
  posts: number;
  reach: string;
  engagementRate: number;
  engagementDelta: number;
  clicks: string;
  conversions: number;
  conversionDelta: number;
}

const platformData: PlatformRow[] = [
  {
    platform: "Instagram",
    color: "bg-gradient-to-br from-pink-500 to-purple-600",
    posts: 48,
    reach: "124.5K",
    engagementRate: 6.8,
    engagementDelta: 1.2,
    clicks: "9,312",
    conversions: 214,
    conversionDelta: 18,
  },
  {
    platform: "LinkedIn",
    color: "bg-blue-600",
    posts: 22,
    reach: "87.2K",
    engagementRate: 4.3,
    engagementDelta: 0.7,
    clicks: "5,840",
    conversions: 167,
    conversionDelta: 24,
  },
  {
    platform: "Facebook",
    color: "bg-blue-500",
    posts: 35,
    reach: "201.1K",
    engagementRate: 3.1,
    engagementDelta: -0.4,
    clicks: "11,290",
    conversions: 298,
    conversionDelta: -9,
  },
  {
    platform: "Google",
    color: "bg-gradient-to-br from-red-500 via-yellow-400 to-green-500",
    posts: 14,
    reach: "340.8K",
    engagementRate: 2.9,
    engagementDelta: 0.3,
    clicks: "28,450",
    conversions: 512,
    conversionDelta: 41,
  },
  {
    platform: "Email",
    color: "bg-emerald-600",
    posts: 8,
    reach: "56.3K",
    engagementRate: 22.4,
    engagementDelta: 3.1,
    clicks: "12,620",
    conversions: 389,
    conversionDelta: 55,
  },
];

const summaryCards = [
  { label: "Total Reach", value: "810.0K", icon: Eye, color: "text-blue-400", bg: "bg-blue-500/20", delta: "+14.2%" },
  { label: "Total Clicks", value: "67.5K", icon: MousePointerClick, color: "text-violet-400", bg: "bg-violet-500/20", delta: "+8.7%" },
  { label: "Avg. Engagement", value: "7.9%", icon: Users, color: "text-pink-400", bg: "bg-pink-500/20", delta: "+1.4%" },
  { label: "Total Conversions", value: "1,580", icon: ShoppingCart, color: "text-emerald-400", bg: "bg-emerald-500/20", delta: "+25.6%" },
];

export default function PerformancePage() {
  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-500/20 border border-violet-500/30">
            <Activity className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Performance</h1>
            <p className="text-sm text-white/50">Cross-platform marketing metrics · July 2026</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10 text-white gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button className="bg-violet-600 hover:bg-violet-500 text-white gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label} className="glass-panel border-white/10 bg-white/5 rounded-2xl">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${c.bg}`}>
                    <Icon className={`w-4 h-4 ${c.color}`} />
                  </div>
                  <span className="text-xs text-emerald-400 font-medium">{c.delta}</span>
                </div>
                <p className="text-2xl font-bold text-white">{c.value}</p>
                <p className="text-xs text-white/50 mt-1">{c.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Platform Breakdown Table */}
      <Card className="glass-panel border-white/10 bg-white/5 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-white/10 pb-4">
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-violet-400" />
            Platform Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
                  <th className="text-left px-6 py-3 font-medium">Platform</th>
                  <th className="text-right px-4 py-3 font-medium">Posts</th>
                  <th className="text-right px-4 py-3 font-medium">Reach</th>
                  <th className="text-right px-4 py-3 font-medium">Engagement Rate</th>
                  <th className="text-right px-4 py-3 font-medium">Clicks</th>
                  <th className="text-right px-6 py-3 font-medium">Conversions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {platformData.map((row) => (
                  <tr
                    key={row.platform}
                    className="hover:bg-white/5 transition-colors"
                  >
                    {/* Platform */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-lg ${row.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                          {row.platform.slice(0, 2)}
                        </span>
                        <span className="text-white font-medium">{row.platform}</span>
                      </div>
                    </td>

                    {/* Posts */}
                    <td className="px-4 py-4 text-right text-white/80">{row.posts}</td>

                    {/* Reach */}
                    <td className="px-4 py-4 text-right text-white/80">{row.reach}</td>

                    {/* Engagement Rate */}
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-white font-semibold">{row.engagementRate}%</span>
                        <span
                          className={`flex items-center gap-0.5 text-xs font-medium ${
                            row.engagementDelta >= 0 ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {row.engagementDelta >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {Math.abs(row.engagementDelta)}%
                        </span>
                      </div>
                    </td>

                    {/* Clicks */}
                    <td className="px-4 py-4 text-right text-white/80">{row.clicks}</td>

                    {/* Conversions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-white font-semibold">{row.conversions}</span>
                        <span
                          className={`flex items-center gap-0.5 text-xs font-medium ${
                            row.conversionDelta >= 0 ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {row.conversionDelta >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {row.conversionDelta >= 0 ? "+" : ""}
                          {row.conversionDelta}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Totals footer */}
              <tfoot>
                <tr className="border-t border-white/20 bg-white/5 text-xs font-semibold text-white/60 uppercase tracking-wide">
                  <td className="px-6 py-3">Totals</td>
                  <td className="px-4 py-3 text-right text-white">127</td>
                  <td className="px-4 py-3 text-right text-white">810.0K</td>
                  <td className="px-4 py-3 text-right text-white">—</td>
                  <td className="px-4 py-3 text-right text-white">67,512</td>
                  <td className="px-6 py-3 text-right text-white">1,580</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Rate Bar Visual */}
      <Card className="glass-panel border-white/10 bg-white/5 rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-white text-base">Engagement Rate by Platform</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {platformData.map((row) => (
            <div key={row.platform} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">{row.platform}</span>
                <span className="text-white font-medium">{row.engagementRate}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full ${row.color}`}
                  style={{ width: `${Math.min((row.engagementRate / 25) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
