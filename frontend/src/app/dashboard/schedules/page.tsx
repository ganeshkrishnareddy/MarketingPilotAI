"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  MessageCircle,
  Briefcase,
  Camera,
  Mail,
  ThumbsUp,
  CalendarDays,
  ChevronRight,
  Edit2,
  Trash2,
  RefreshCw,
  Filter,
} from "lucide-react";

type Platform = "Twitter" | "LinkedIn" | "Instagram" | "Email" | "Facebook";
type Status = "Scheduled" | "Published" | "Failed" | "Draft";
type DateFilter = "Today" | "This Week" | "This Month";

interface ScheduledItem {
  id: number;
  title: string;
  platform: Platform;
  scheduledTime: string;
  status: Status;
  author: string;
}

const platformMeta: Record<Platform, { icon: React.ReactNode; color: string }> = {
  Twitter: { icon: <MessageCircle className="h-3.5 w-3.5" />, color: "text-sky-400 bg-sky-500/10 border-sky-500/30" },
  LinkedIn: { icon: <Briefcase className="h-3.5 w-3.5" />, color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  Instagram: { icon: <Camera className="h-3.5 w-3.5" />, color: "text-pink-400 bg-pink-500/10 border-pink-500/30" },
  Email: { icon: <Mail className="h-3.5 w-3.5" />, color: "text-violet-400 bg-violet-500/10 border-violet-500/30" },
  Facebook: { icon: <ThumbsUp className="h-3.5 w-3.5" />, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30" },
};

const statusMeta: Record<Status, { label: string; className: string }> = {
  Scheduled: { label: "Scheduled", className: "border-amber-500/40 text-amber-400 bg-amber-500/10" },
  Published: { label: "Published", className: "border-green-500/40 text-green-400 bg-green-500/10" },
  Failed: { label: "Failed", className: "border-red-500/40 text-red-400 bg-red-500/10" },
  Draft: { label: "Draft", className: "border-slate-500/40 text-slate-400 bg-slate-500/10" },
};

const allItems: ScheduledItem[] = [];

export default function SchedulesPage() {
  const [activeFilter, setActiveFilter] = useState<DateFilter>("This Week");

  const filters: DateFilter[] = ["Today", "This Week", "This Month"];

  const todayItems = allItems.filter((i) =>
    i.scheduledTime.startsWith("Today")
  );
  const displayItems = activeFilter === "Today" ? todayItems : allItems;

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30">
            <Clock className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Content Schedules
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {displayItems.length} items in queue
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 text-sm">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button className="bg-amber-600 hover:bg-amber-500 text-white gap-2 shadow-lg shadow-amber-500/20 text-sm">
            <CalendarDays className="h-4 w-4" />
            Schedule Content
          </Button>
        </div>
      </div>

      {/* Date Filter Buttons */}
      <div className="flex items-center gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
              activeFilter === f
                ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                : "bg-transparent border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300"
            }`}
          >
            {f}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-500">
          <RefreshCw className="h-3.5 w-3.5" />
          Last synced 1 min ago
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-[2fr_1fr_1.2fr_0.8fr_auto] gap-4 px-5 py-3 border-b border-white/10 text-xs text-slate-500 font-medium uppercase tracking-wider">
          <span>Content Title</span>
          <span>Platform</span>
          <span>Scheduled Time</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-white/5">
          {displayItems.map((item) => {
            const pm = platformMeta[item.platform];
            const sm = statusMeta[item.status];
            return (
              <div
                key={item.id}
                className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1.2fr_0.8fr_auto] gap-3 sm:gap-4 items-start sm:items-center px-5 py-4 hover:bg-white/3 transition-colors group"
              >
                {/* Title */}
                <div>
                  <p className="text-sm font-medium text-white leading-snug group-hover:text-amber-300 transition-colors">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">by {item.author}</p>
                </div>

                {/* Platform */}
                <div>
                  <Badge
                    variant="outline"
                    className={`gap-1.5 text-xs border ${pm.color}`}
                  >
                    {pm.icon}
                    {item.platform}
                  </Badge>
                </div>

                {/* Time */}
                <div className="flex items-center gap-1.5 text-sm text-slate-300">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  {item.scheduledTime}
                </div>

                {/* Status */}
                <div>
                  <Badge variant="outline" className={`text-xs border ${sm.className}`}>
                    {sm.label}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-500 hover:text-white hover:bg-white/10"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-500 hover:text-white hover:bg-white/10"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Showing {displayItems.length} items</span>
        <button className="hover:text-slate-300 transition-colors">View All Scheduled Content →</button>
      </div>
    </div>
  );
}
