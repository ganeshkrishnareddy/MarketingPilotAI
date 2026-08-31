'use client';

import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ContentItem {
  day: number;
  platform: 'Instagram' | 'LinkedIn' | 'Email';
  title: string;
}

const MONTH_CONTENT: ContentItem[] = [
  { day: 1,  platform: 'Instagram', title: 'Product launch teaser' },
  { day: 1,  platform: 'LinkedIn',  title: 'Industry insights post' },
  { day: 3,  platform: 'Email',     title: 'Weekly newsletter' },
  { day: 5,  platform: 'Instagram', title: 'Behind-the-scenes reel' },
  { day: 7,  platform: 'LinkedIn',  title: 'Case study feature' },
  { day: 8,  platform: 'Email',     title: 'Product update blast' },
  { day: 10, platform: 'Instagram', title: 'User testimonial carousel' },
  { day: 12, platform: 'LinkedIn',  title: 'Thought leadership article' },
  { day: 14, platform: 'Instagram', title: 'Feature spotlight' },
  { day: 15, platform: 'Email',     title: 'Mid-month promo' },
  { day: 16, platform: 'LinkedIn',  title: 'Team culture post' },
  { day: 17, platform: 'Instagram', title: 'Q&A Story highlight' },
  { day: 19, platform: 'Email',     title: 'Re-engagement sequence' },
  { day: 21, platform: 'Instagram', title: 'Partnership announcement' },
  { day: 21, platform: 'LinkedIn',  title: 'Partnership announcement' },
  { day: 22, platform: 'Email',     title: 'Flash sale alert' },
  { day: 24, platform: 'Instagram', title: 'Tutorial reel' },
  { day: 25, platform: 'LinkedIn',  title: 'Milestone celebration' },
  { day: 28, platform: 'Email',     title: 'Monthly digest' },
  { day: 28, platform: 'Instagram', title: 'Month recap stories' },
  { day: 30, platform: 'LinkedIn',  title: 'Upcoming events preview' },
];

const PLATFORM_COLOR: Record<ContentItem['platform'], string> = {
  Instagram: 'bg-purple-500',
  LinkedIn:  'bg-blue-500',
  Email:     'bg-amber-500',
};

const PLATFORM_TEXT: Record<ContentItem['platform'], string> = {
  Instagram: 'text-purple-600',
  LinkedIn:  'text-blue-600',
  Email:     'text-amber-600',
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// July 2026 starts on Wednesday (index 3), 31 days
const MONTH_START_WEEKDAY = 3;
const DAYS_IN_MONTH = 31;
const MONTH_LABEL = 'July 2026';

export default function ContentCalendarPage() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Build a 5-row × 7-col grid (35 cells)
  const cells: (number | null)[] = [];
  for (let i = 0; i < MONTH_START_WEEKDAY; i++) cells.push(null);
  for (let d = 1; d <= DAYS_IN_MONTH; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const contentForDay = (day: number) => MONTH_CONTENT.filter((c) => c.day === day);

  const totalByPlatform = (platform: ContentItem['platform']) =>
    MONTH_CONTENT.filter((c) => c.platform === platform).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-2">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Content Calendar</h1>
            <p className="text-sm text-slate-500">Plan and visualise your content across all channels</p>
          </div>
        </div>
        <Button className="gap-2 bg-[#2563eb] text-white shadow-sm hover:bg-blue-600">
          <Plus className="h-4 w-4" />
          Add Content
        </Button>
      </div>

      {/* Legend & Stats */}
      <div className="flex flex-wrap items-center gap-4">
        {(['Instagram', 'LinkedIn', 'Email'] as const).map((p) => (
          <div key={p} className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-2 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <span className={`h-3 w-3 rounded-full ${PLATFORM_COLOR[p]}`} />
            <span className="text-sm font-medium text-slate-700">{p}</span>
            <span className="text-xs text-slate-400">({totalByPlatform(p)} posts)</span>
          </div>
        ))}
        <div className="ml-auto rounded-xl border border-slate-200/80 bg-white px-4 py-2 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <span className="text-sm text-slate-500">Total: </span>
          <span className="font-bold text-slate-900">{MONTH_CONTENT.length} pieces</span>
        </div>
      </div>

      {/* Calendar */}
      <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-900">{MONTH_LABEL}</CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Day name headers */}
          <div className="mb-2 grid grid-cols-7">
            {DAY_NAMES.map((d) => (
              <div key={d} className="py-1 text-center text-xs font-medium text-slate-500">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              const items = day ? contentForDay(day) : [];
              const isSelected = day === selectedDay;
              const isToday = day === 21; // highlight July 21 as "today"
              return (
                <div
                  key={idx}
                  onClick={() => day && setSelectedDay(day === selectedDay ? null : day)}
                  className={`min-h-[80px] cursor-pointer rounded-lg border p-1.5 transition-all
                    ${!day ? 'pointer-events-none opacity-0' : ''}
                    ${isSelected ? 'border-blue-400 bg-blue-50' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'}
                    ${isToday && !isSelected ? 'border-blue-300 bg-blue-50/50' : ''}
                  `}
                >
                  {day && (
                    <>
                      <p
                        className={`mb-1 text-xs font-semibold ${
                          isToday ? 'text-blue-600' : 'text-slate-400'
                        }`}
                      >
                        {day}
                        {isToday && (
                          <span className="ml-1 rounded bg-blue-600 px-1 py-0.5 text-[9px] text-white">TODAY</span>
                        )}
                      </p>
                      <div className="flex flex-col gap-0.5">
                        {items.slice(0, 3).map((item, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${PLATFORM_COLOR[item.platform]}`} />
                            <span className="truncate text-[9px] leading-tight text-slate-500">{item.title}</span>
                          </div>
                        ))}
                        {items.length > 3 && (
                          <span className="text-[9px] text-slate-400">+{items.length - 3} more</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Day Detail Panel */}
      {selectedDay && (
        <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-slate-900">
              July {selectedDay}, 2026 — Scheduled Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contentForDay(selectedDay).length === 0 ? (
              <p className="text-sm text-slate-500">No content scheduled for this day.</p>
            ) : (
              <div className="space-y-2">
                {contentForDay(selectedDay).map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${PLATFORM_COLOR[item.platform]}`} />
                      <span className={`text-xs font-medium ${PLATFORM_TEXT[item.platform]}`}>{item.platform}</span>
                      <span className="text-sm text-slate-600">{item.title}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700">Edit</Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700">View</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
