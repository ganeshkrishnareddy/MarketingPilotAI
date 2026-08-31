"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Sparkles,
  CheckCircle2,
  Clock,
  TrendingUp,
  Calendar,
  Target,
  Zap,
  Users,
  RefreshCw,
} from "lucide-react";

interface Insight {
  id: string;
  title: string;
  detail: string;
  category: string;
  categoryColor: string;
  confidence: number;
  impact: "High" | "Medium" | "Low";
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  applied: boolean;
}

const initialInsights: Insight[] = [
  {
    id: "tuesday-posting",
    title: "Post on Tuesdays for Maximum Engagement",
    detail:
      "Your Tuesday posts receive 34% more engagement than the weekly average. Analysis of 6 months of data shows your audience is most active between 9–11 AM on Tuesdays. Schedule your most important content — launches, promotions, and thought leadership — during this window for peak visibility.",
    category: "Scheduling",
    categoryColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    confidence: 92,
    impact: "High",
    icon: Calendar,
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
    applied: false,
  },
  {
    id: "video-content",
    title: "Short-Form Video Outperforms Static Posts 3x",
    detail:
      "Reels and short videos (15–30 seconds) are generating 3.2× more reach than static image posts across Instagram and LinkedIn. Your competitors are investing heavily here. Increasing video output from 2 to 6 per week could add an estimated 45K impressions monthly.",
    category: "Content",
    categoryColor: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    confidence: 88,
    impact: "High",
    icon: TrendingUp,
    iconBg: "bg-violet-500/20",
    iconColor: "text-violet-400",
    applied: false,
  },
  {
    id: "email-subject",
    title: "Question-Style Subject Lines Boost Open Rates",
    detail:
      "Email campaigns using question-based subject lines (e.g. \"Are you leaving conversions on the table?\") achieve a 28.4% open rate vs. your current average of 21.9%. Apply this pattern to your next 3 campaigns and we predict an additional 1,200 opens per send.",
    category: "Email",
    categoryColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    confidence: 85,
    impact: "Medium",
    icon: Zap,
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
    applied: true,
  },
  {
    id: "audience-retargeting",
    title: "Retarget Blog Visitors on LinkedIn for 4× ROI",
    detail:
      "Users who visited your blog in the last 30 days and were retargeted on LinkedIn converted at 4.1× the rate of cold audiences. Your current retargeting budget is underallocated. Shifting 20% of your Google Ads budget to LinkedIn retargeting is projected to increase conversion volume by 38%.",
    category: "Paid Ads",
    categoryColor: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    confidence: 79,
    impact: "High",
    icon: Target,
    iconBg: "bg-orange-500/20",
    iconColor: "text-orange-400",
    applied: false,
  },
  {
    id: "influencer-micro",
    title: "Micro-Influencers Drive Higher Conversion Than Macro",
    detail:
      "In your niche, influencers with 5K–50K followers are generating a 6.7% conversion rate vs. 1.4% for macro-influencers (100K+). Partnering with 10 micro-influencers in the B2B SaaS space instead of 1 macro-influencer is estimated to triple your campaign ROI at the same budget.",
    category: "Influencer",
    categoryColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    confidence: 74,
    impact: "Medium",
    icon: Users,
    iconBg: "bg-pink-500/20",
    iconColor: "text-pink-400",
    applied: false,
  },
];

const impactColors: Record<Insight["impact"], string> = {
  High: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  Medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  Low: "bg-white/10 text-white/50 border-white/20",
};

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>(initialInsights);
  const [refreshing, setRefreshing] = useState(false);

  const handleApply = (id: string) => {
    setInsights((prev) =>
      prev.map((ins) => (ins.id === id ? { ...ins, applied: true } : ins))
    );
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1800);
  };

  const appliedCount = insights.filter((i) => i.applied).length;

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-500/20 border border-violet-500/30">
            <LineChart className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">AI Insights</h1>
            <p className="text-sm text-white/50">
              Personalized recommendations powered by MarketingPilot AI
            </p>
          </div>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          className="border-white/20 bg-white/5 hover:bg-white/10 text-white gap-2"
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing…" : "Refresh Insights"}
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active Insights", value: insights.length, color: "text-violet-400" },
          { label: "Applied", value: appliedCount, color: "text-emerald-400" },
          { label: "Pending", value: insights.length - appliedCount, color: "text-yellow-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-white/50 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Insight Cards */}
      <div className="space-y-5">
        {insights.map((ins) => {
          const Icon = ins.icon;
          return (
            <Card
              key={ins.id}
              className={`glass-panel border-white/10 bg-white/5 rounded-2xl transition-all ${
                ins.applied ? "opacity-70" : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${ins.iconBg} border border-white/10`}>
                      <Icon className={`w-5 h-5 ${ins.iconColor}`} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                        <CardTitle className="text-white text-base leading-tight">
                          {ins.title}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`text-xs border ${ins.categoryColor}`}>
                          {ins.category}
                        </Badge>
                        <Badge className={`text-xs border ${impactColors[ins.impact]}`}>
                          {ins.impact} Impact
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Confidence */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs text-white/40">Confidence</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-400"
                          style={{ width: `${ins.confidence}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-white">{ins.confidence}%</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-white/65 leading-relaxed">{ins.detail}</p>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-white/30 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    Generated just now
                  </span>

                  {ins.applied ? (
                    <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      Recommendation Applied
                    </span>
                  ) : (
                    <Button
                      onClick={() => handleApply(ins.id)}
                      className="bg-violet-600 hover:bg-violet-500 text-white gap-2 text-sm h-8"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Apply Recommendation
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
