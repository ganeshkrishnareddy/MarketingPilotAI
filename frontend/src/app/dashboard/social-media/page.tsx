'use client';

import { useState } from 'react';
import { Share2, Plus, Edit2, Trash2, Send, Camera, MessageCircle, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type PostStatus = 'scheduled' | 'draft' | 'published';

interface ScheduledPost {
  id: number;
  platform: 'Instagram' | 'LinkedIn' | 'Twitter';
  content: string;
  status: PostStatus;
  scheduledTime: string;
}

const initialPosts: ScheduledPost[] = [
  {
    id: 1,
    platform: 'Instagram',
    content: '🚀 Exciting product launch coming next week! Stay tuned for our biggest announcement...',
    status: 'scheduled',
    scheduledTime: '2026-07-22 10:00 AM',
  },
  {
    id: 2,
    platform: 'LinkedIn',
    content: 'We are thrilled to share our Q2 growth report — 3x revenue increase and 150+ new clients.',
    status: 'published',
    scheduledTime: '2026-07-20 09:00 AM',
  },
  {
    id: 3,
    platform: 'Twitter',
    content: 'Marketing automation just got smarter. Discover how MarketingPilot AI cuts campaign time by 60%.',
    status: 'draft',
    scheduledTime: '2026-07-23 02:00 PM',
  },
  {
    id: 4,
    platform: 'Instagram',
    content: 'Behind the scenes: How our team plans a full month of content in just 2 hours using AI ✨',
    status: 'scheduled',
    scheduledTime: '2026-07-24 11:00 AM',
  },
  {
    id: 5,
    platform: 'LinkedIn',
    content: 'Thought leadership piece: The future of B2B marketing in the age of generative AI.',
    status: 'draft',
    scheduledTime: '2026-07-25 08:30 AM',
  },
  {
    id: 6,
    platform: 'Twitter',
    content: '10 tips for writing high-converting ad copy — thread 🧵 #MarketingTips #DigitalMarketing',
    status: 'published',
    scheduledTime: '2026-07-19 03:00 PM',
  },
];

const statusStyles: Record<PostStatus, string> = {
  scheduled: 'bg-blue-50 text-blue-700 border border-blue-200',
  draft: 'bg-amber-50 text-amber-700 border border-amber-200',
  published: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

const platformIcon = (platform: ScheduledPost['platform']) => {
  switch (platform) {
    case 'Instagram':
      return <Camera className="h-4 w-4 text-pink-500" />;
    case 'LinkedIn':
      return <Briefcase className="h-4 w-4 text-blue-500" />;
    case 'Twitter':
      return <MessageCircle className="h-4 w-4 text-sky-500" />;
  }
};

const platformBadgeStyles: Record<ScheduledPost['platform'], string> = {
  Instagram: 'bg-pink-50 text-pink-700',
  LinkedIn: 'bg-blue-50 text-blue-700',
  Twitter: 'bg-sky-50 text-sky-700',
};

export default function SocialMediaPage() {
  const [posts, setPosts] = useState<ScheduledPost[]>(initialPosts);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<PostStatus | 'all'>('all');

  const filtered = posts.filter((p) => {
    const matchesSearch =
      p.content.toLowerCase().includes(search.toLowerCase()) ||
      p.platform.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const counts = {
    total: posts.length,
    scheduled: posts.filter((p) => p.status === 'scheduled').length,
    published: posts.filter((p) => p.status === 'published').length,
    draft: posts.filter((p) => p.status === 'draft').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-violet-200 bg-violet-50 p-2">
            <Share2 className="h-6 w-6 text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Social Media</h1>
            <p className="text-sm text-slate-500">Manage and schedule your posts across platforms</p>
          </div>
        </div>
        <Button className="gap-2 bg-[#2563eb] text-white shadow-sm hover:bg-blue-600">
          <Plus className="h-4 w-4" />
          New Post
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Total Posts', value: counts.total, color: 'text-slate-900' },
          { label: 'Scheduled', value: counts.scheduled, color: 'text-blue-600' },
          { label: 'Published', value: counts.published, color: 'text-emerald-600' },
          { label: 'Drafts', value: counts.draft, color: 'text-amber-600' },
        ].map((stat) => (
          <Card key={stat.label} className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <CardContent className="pb-4 pt-4">
              <p className="mb-1 text-xs text-slate-500">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 border-slate-200 bg-white text-slate-700 placeholder:text-slate-400"
        />
        <div className="flex gap-2">
          {(['all', 'scheduled', 'draft', 'published'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                filterStatus === s
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Table */}
      <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-slate-900">Scheduled Posts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 hover:bg-transparent">
                <TableHead className="font-medium text-slate-500">Platform</TableHead>
                <TableHead className="font-medium text-slate-500">Content Preview</TableHead>
                <TableHead className="font-medium text-slate-500">Status</TableHead>
                <TableHead className="font-medium text-slate-500">Scheduled Time</TableHead>
                <TableHead className="text-right font-medium text-slate-500">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((post) => (
                <TableRow key={post.id} className="border-slate-100 transition-colors hover:bg-slate-50/60">
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${platformBadgeStyles[post.platform]}`}
                    >
                      {platformIcon(post.platform)}
                      {post.platform}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs text-slate-600">
                    <p className="truncate">{post.content}</p>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyles[post.status]}`}
                    >
                      {post.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-400">{post.scheduledTime}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-blue-50 hover:text-blue-600">
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-violet-50 hover:text-violet-600">
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleDelete(post.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-slate-400">
                    No posts match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
