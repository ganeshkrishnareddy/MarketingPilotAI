"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckSquare,
  Check,
  X,
  MessageCircle,
  Briefcase,
  Camera,
  Mail,
  FileText,
  Image as ImageIcon,
  Video,
  AlignLeft,
  Clock,
  Filter,
  ChevronDown,
  Bot,
} from "lucide-react";

type ContentType = "Blog Post" | "Social Post" | "Email" | "Ad Creative" | "Video Script";
type Platform = "LinkedIn" | "Twitter" | "Instagram" | "Email" | "All Platforms";

interface ApprovalItem {
  id: number;
  title: string;
  contentType: ContentType;
  platform: Platform;
  preview: string;
  createdAt: string;
  wordCount?: number;
  thumbnailColor: string;
  status: "pending" | "approved" | "rejected";
}

const typeIcon: Record<ContentType, React.ReactNode> = {
  "Blog Post":     <FileText className="h-4 w-4" />,
  "Social Post":   <AlignLeft className="h-4 w-4" />,
  "Email":         <Mail className="h-4 w-4" />,
  "Ad Creative":   <ImageIcon className="h-4 w-4" />,
  "Video Script":  <Video className="h-4 w-4" />,
};

const platformIcon: Record<Platform, React.ReactNode> = {
  LinkedIn:      <Briefcase className="h-3.5 w-3.5" />,
  Twitter:       <MessageCircle className="h-3.5 w-3.5" />,
  Instagram:     <Camera className="h-3.5 w-3.5" />,
  Email:         <Mail className="h-3.5 w-3.5" />,
  "All Platforms": <AlignLeft className="h-3.5 w-3.5" />,
};

const platformColor: Record<Platform, string> = {
  LinkedIn:      "text-blue-400 bg-blue-500/10 border-blue-500/30",
  Twitter:       "text-sky-400 bg-sky-500/10 border-sky-500/30",
  Instagram:     "text-pink-400 bg-pink-500/10 border-pink-500/30",
  Email:         "text-violet-400 bg-violet-500/10 border-violet-500/30",
  "All Platforms": "text-slate-400 bg-slate-500/10 border-slate-500/30",
};

const initialItems: ApprovalItem[] = [];

export default function ApprovalsPage() {
  const [items, setItems] = useState<ApprovalItem[]>(initialItems);

  const pending  = items.filter((i) => i.status === "pending");
  const approved = items.filter((i) => i.status === "approved");
  const rejected = items.filter((i) => i.status === "rejected");

  const handleApprove = (id: number) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: "approved" } : i)));

  const handleReject = (id: number) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: "rejected" } : i)));

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
            <CheckSquare className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Content Approvals
              </h1>
              {pending.length > 0 && (
                <span className="inline-flex items-center justify-center h-6 min-w-6 px-1.5 rounded-full bg-rose-500 text-white text-xs font-bold">
                  {pending.length}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400 mt-0.5">
              {pending.length} awaiting review · {approved.length} approved · {rejected.length} rejected
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 text-sm">
            <Filter className="h-4 w-4" />
            Filter
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
          {pending.length > 0 && (
            <Button
              onClick={() => setItems((prev) => prev.map((i) => ({ ...i, status: "approved" })))}
              className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-lg shadow-emerald-500/20 text-sm"
            >
              <Check className="h-4 w-4" />
              Approve All
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending Review", value: pending.length,  className: "text-amber-400",  bg: "bg-amber-500/10  border-amber-500/20"  },
          { label: "Approved",       value: approved.length, className: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "Rejected",       value: rejected.length, className: "text-rose-400",    bg: "bg-rose-500/10   border-rose-500/20"    },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] border ${s.bg}`}>
            <p className="text-xs text-slate-400 mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.className}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Approval Cards */}
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={`glass-panel rounded-2xl overflow-hidden border transition-all duration-300 ${
              item.status === "approved"
                ? "border-emerald-500/30 opacity-70"
                : item.status === "rejected"
                ? "border-rose-500/30 opacity-50"
                : "border-white/10 hover:border-white/20"
            }`}
          >
            <div className="flex flex-col sm:flex-row gap-0">
              {/* Thumbnail */}
              <div
                className={`bg-gradient-to-br ${item.thumbnailColor} sm:w-36 h-24 sm:h-auto shrink-0 flex items-center justify-center`}
              >
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
                  {typeIcon[item.contentType]}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold text-slate-900">{item.title}</h2>
                    {item.status !== "pending" && (
                      <Badge
                        variant="outline"
                        className={
                          item.status === "approved"
                            ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-xs"
                            : "border-rose-500/40 text-rose-400 bg-rose-500/10 text-xs"
                        }
                      >
                        {item.status === "approved" ? "Approved" : "Rejected"}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className={`text-xs gap-1.5 border ${platformColor[item.platform]}`}>
                      {platformIcon[item.platform]}
                      {item.platform}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-slate-600/40 text-slate-400 bg-slate-500/10">
                      {item.contentType}
                    </Badge>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 mb-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Bot className="h-3.5 w-3.5 text-violet-400" />
                    <span className="text-slate-400">AI Assistant</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {item.createdAt}
                  </span>
                  {item.wordCount && (
                    <span>{item.wordCount.toLocaleString()} words</span>
                  )}
                </div>

                {/* Preview */}
                <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 mb-4">
                  {item.preview}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {item.status === "pending" ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(item.id)}
                        className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow shadow-emerald-500/20 text-xs"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReject(item.id)}
                        className="gap-1.5 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-400 text-xs"
                        variant="ghost"
                      >
                        <X className="h-3.5 w-3.5" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-slate-400 hover:text-white hover:bg-white/10 ml-auto"
                      >
                        Preview full content →
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setItems((prev) =>
                          prev.map((i) => (i.id === item.id ? { ...i, status: "pending" } : i))
                        )
                      }
                      className="text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5"
                    >
                      Undo decision
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.every((i) => i.status !== "pending") && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-10 flex flex-col items-center justify-center text-center">
          <CheckSquare className="h-12 w-12 text-emerald-400 mb-3 opacity-60" />
          <h3 className="text-lg font-semibold text-white mb-1">All caught up!</h3>
          <p className="text-sm text-slate-400">No content items are awaiting your review.</p>
        </div>
      )}
    </div>
  );
}
