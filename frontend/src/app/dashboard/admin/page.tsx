"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck, Users, Mail, KeyRound, CirclePlus, RefreshCcw, Send, CheckCircle2 } from "lucide-react";

type Role = "Owner" | "Admin" | "Member";
type Status = "Active" | "Pending" | "Suspended";

type Account = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  defaultPassword: string;
  createdAt: string;
};

function makeAccountId() {
  return `MP-${Math.floor(1000 + Math.random() * 9000)}`;
}

function makePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const seedAccounts: Account[] = [];

const roleCopy: Record<Role, string> = {
  Owner: "Full access to billing, users, and automation",
  Admin: "Manage campaigns, leads, and integrations",
  Member: "Work inside assigned modules only",
};

export default function AdminPage() {
  const [accounts, setAccounts] = useState<Account[]>(seedAccounts);
  const [name, setName] = useState("New Client Workspace");
  const [email, setEmail] = useState("owner@company.com");
  const [role, setRole] = useState<Role>("Owner");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string>("");

  const stats = useMemo(() => ({
    total: accounts.length,
    active: accounts.filter((a) => a.status === "Active").length,
    pending: accounts.filter((a) => a.status === "Pending").length,
  }), [accounts]);

  async function createAccount() {
    setSending(true);
    setResult("");
    const accountId = makeAccountId();
    const defaultPassword = makePassword();

    try {
      const response = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          role,
          accountId,
          defaultPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Invite failed");

      setAccounts((prev) => [
        {
          id: data.accountId || accountId,
          name,
          email,
          role,
          status: data.sent ? "Active" : "Pending",
          defaultPassword: data.defaultPassword || defaultPassword,
          createdAt: new Date().toISOString().slice(0, 10),
        },
        ...prev,
      ]);
      setResult(data.sent ? `Invite sent to ${email}` : "Email preview ready. Add SMTP to send live invites.");
      setMessage(data.sent ? "Account created and mail sent." : data.warning || "SMTP not set, so we generated a preview instead.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create account.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <Badge className="mb-3 gap-2 bg-primary/10 text-primary" variant="secondary">
          <ShieldCheck className="h-3.5 w-3.5" />
          Main admin
        </Badge>
        <h1 className="font-outfit text-3xl font-bold tracking-tight">Account control and invite center</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
          Create customer workspaces, generate a default password, and send login details by email. When SMTP is not connected, the app still shows the invite preview so you can test the flow locally.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Accounts</p>
            <p className="mt-2 text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="mt-2 text-3xl font-bold text-emerald-400">{stats.active}</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="mt-2 text-3xl font-bold text-amber-400">{stats.pending}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CirclePlus className="h-5 w-5 text-primary" />
              Create account
            </CardTitle>
            <CardDescription>Generate an account ID, default password, and invite email.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Workspace / Client name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(value) => setRole(value as Role)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Owner">Owner</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              <p className="font-medium text-foreground">{role}</p>
              <p className="mt-1">{roleCopy[role]}</p>
            </div>

            <Button onClick={createAccount} disabled={sending} className="w-full gap-2">
              {sending ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Create and send invite
            </Button>

            {message && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                {message}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Current accounts
            </CardTitle>
            <CardDescription>Review who has access, what password is assigned, and whether the invite was sent.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {accounts.map((account) => (
              <div key={account.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{account.name}</p>
                      <Badge variant="outline" className="border-white/10 bg-white/5">
                        {account.role}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={account.status === "Active" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-amber-500/30 bg-amber-500/10 text-amber-300"}
                      >
                        {account.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground break-all">{account.email}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Account ID: {account.id} • Created: {account.createdAt}</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <KeyRound className="h-4 w-4" />
                      Default password
                    </div>
                    <p className="mt-1 font-mono text-sm">{account.defaultPassword}</p>
                  </div>
                </div>
              </div>
            ))}
            {result && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                <CheckCircle2 className="h-4 w-4" />
                {result}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
