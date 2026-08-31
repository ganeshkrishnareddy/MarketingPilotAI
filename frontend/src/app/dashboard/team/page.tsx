"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users, UserPlus, Mail, Trash2, ShieldCheck,
  Crown, UserCircle2, ChevronDown,
} from "lucide-react";

type Role = "Owner" | "Admin" | "Member";

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: "Active" | "Pending";
  joined: string;
  avatar: string;
}

const initialMembers: TeamMember[] = [
  { id: 1, name: "Alexandra Chen",  email: "alex.chen@acme.com",    role: "Owner",  status: "Active",  joined: "Jan 12, 2024", avatar: "AC" },
  { id: 2, name: "Marcus Williams", email: "m.williams@acme.com",   role: "Admin",  status: "Active",  joined: "Feb  3, 2024", avatar: "MW" },
  { id: 3, name: "Priya Sharma",    email: "priya.s@acme.com",      role: "Member", status: "Active",  joined: "Mar 18, 2024", avatar: "PS" },
  { id: 4, name: "Jordan Lee",      email: "jordan.lee@acme.com",   role: "Member", status: "Active",  joined: "Apr  5, 2024", avatar: "JL" },
  { id: 5, name: "Sofia Martinez",  email: "sofia.m@acme.com",      role: "Admin",  status: "Active",  joined: "May 22, 2024", avatar: "SM" },
  { id: 6, name: "Ethan Brooks",    email: "e.brooks@acme.com",     role: "Member", status: "Pending", joined: "Jun 30, 2024", avatar: "EB" },
];

const roleMeta: Record<Role, { cls: string; icon: React.ReactNode }> = {
  Owner:  { cls: "border border-amber-200 bg-amber-50 text-amber-700",   icon: <Crown       className="h-3 w-3" /> },
  Admin:  { cls: "border border-violet-200 bg-violet-50 text-violet-700", icon: <ShieldCheck className="h-3 w-3" /> },
  Member: { cls: "border border-blue-200 bg-blue-50 text-blue-700",       icon: <UserCircle2 className="h-3 w-3" /> },
};

const avatarColors = ["bg-violet-600","bg-blue-600","bg-emerald-600","bg-rose-600","bg-amber-600","bg-cyan-600"];

export default function TeamPage() {
  const [members, setMembers]     = useState<TeamMember[]>(initialMembers);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole]   = useState<Role>("Member");
  const [sent, setSent]           = useState(false);

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    const label = inviteEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    setMembers((p) => [...p, {
      id: Date.now(), name: label, email: inviteEmail,
      role: inviteRole, status: "Pending",
      joined: new Date().toLocaleDateString("en-US",{ month:"short", day:"numeric", year:"numeric" }),
      avatar: inviteEmail.slice(0,2).toUpperCase(),
    }]);
    setInviteEmail(""); setSent(true);
    setTimeout(() => { setSent(false); setShowInvite(false); }, 2000);
  };

  const activeCount  = members.filter((m) => m.status === "Active").length;
  const pendingCount = members.filter((m) => m.status === "Pending").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-violet-200 bg-violet-50 p-2.5">
            <Users className="h-6 w-6 text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Team Management</h1>
            <p className="text-sm text-slate-500">{activeCount} active · {pendingCount} pending</p>
          </div>
        </div>
        <Button onClick={() => setShowInvite((v) => !v)}
          className="gap-2 bg-[#2563eb] text-white shadow-sm hover:bg-blue-600">
          <UserPlus className="h-4 w-4" /> Invite Member
        </Button>
      </div>

      {/* Invite Form */}
      {showInvite && (
        <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-slate-900">
              <Mail className="h-4 w-4 text-violet-600" /> Invite a New Team Member
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 space-y-1">
                <Label className="text-xs text-slate-600">Email Address</Label>
                <Input type="email" placeholder="colleague@company.com" value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="border-slate-200 bg-slate-50 text-slate-700 placeholder:text-slate-400 focus:border-violet-400" />
              </div>
              <div className="sm:w-40 space-y-1">
                <Label className="text-xs text-slate-600">Role</Label>
                <div className="relative">
                  <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as Role)}
                    className="h-10 w-full appearance-none rounded-md border border-slate-200 bg-slate-50 px-3 pr-8 text-sm text-slate-700 focus:border-violet-400 focus:outline-none">
                    <option value="Admin">Admin</option>
                    <option value="Member">Member</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="sm:w-36 flex items-end">
                <Button onClick={handleInvite} disabled={!inviteEmail.trim() || sent}
                  className={`w-full ${sent ? "bg-emerald-600" : "bg-[#2563eb] hover:bg-blue-600"} text-white shadow-sm`}>
                  {sent ? "Sent!" : "Send Invite"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Members", value: members.length,            color: "text-violet-600" },
          { label: "Active",        value: activeCount,               color: "text-emerald-600" },
          { label: "Pending",       value: pendingCount,              color: "text-amber-600" },
          { label: "Admins",        value: members.filter((m) => m.role !== "Member").length, color: "text-blue-600" },
        ].map((s) => (
          <Card key={s.label} className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <CardHeader className="border-b border-slate-100 pb-3">
          <CardTitle className="text-base text-slate-900">Team Members</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Member","Role","Status","Joined",""].map((h,i) => (
                    <th key={i} className={`px-6 py-3 font-medium text-slate-500 ${i === 4 ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map((m, idx) => {
                  const rm = roleMeta[m.role];
                  return (
                    <tr key={m.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/60">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white ${avatarColors[idx % avatarColors.length]}`}>
                            {m.avatar}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{m.name}</p>
                            <p className="text-xs text-slate-400">{m.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${rm.cls}`}>
                          {rm.icon}{m.role}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${m.status === "Active" ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "border border-amber-200 bg-amber-50 text-amber-700"}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${m.status === "Active" ? "bg-emerald-400" : "bg-amber-400"}`} />
                          {m.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-400">{m.joined}</td>
                      <td className="px-6 py-4 text-right">
                        {m.role !== "Owner" ? (
                          <Button variant="ghost" size="sm"
                            onClick={() => setMembers((p) => p.filter((x) => x.id !== m.id))}
                            className="gap-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-600">
                            <Trash2 className="h-3.5 w-3.5" /> Remove
                          </Button>
                        ) : <span className="text-xs text-slate-400">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
