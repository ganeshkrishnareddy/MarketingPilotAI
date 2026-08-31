"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  Search,
  Loader2,
  Trash2,
  Power,
  Users,
  Mail,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  UserPlus,
} from "lucide-react";
import { pb } from "@/lib/pocketbase";
import { useAuth } from "@/lib/auth";

interface ClientUser {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  business: string;
  expand?: { business?: { name?: string; industry?: string } };
  created: string;
}

export default function ClientsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [clients, setClients] = React.useState<ClientUser[]>([]);
  const [leadsByClient, setLeadsByClient] = React.useState<Record<string, number>>({});
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", email: "", password: "", business_name: "", industry: "" });
  const [submitting, setSubmitting] = React.useState(false);
  const [notice, setNotice] = React.useState("");

  const loadClients = React.useCallback(async () => {
    try {
      const [users, leads] = await Promise.all([
        pb.collection("users").getFullList<ClientUser>({ filter: 'role = "client"', sort: "-created", expand: "business", requestKey: null }),
        pb.collection("leads").getFullList({ fields: "id,client_id", requestKey: null }).catch(() => []),
      ]);
      const counts: Record<string, number> = {};
      for (const l of leads) if (l.client_id) counts[l.client_id] = (counts[l.client_id] || 0) + 1;
      setLeadsByClient(counts);
      setClients(users);
    } catch (e) {
      console.error("Failed to load clients", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!authLoading && user?.role !== "admin") {
      router.replace("/dashboard");
      return;
    }
    if (authLoading || !user) return;
    loadClients();
  }, [authLoading, user, router, loadClients]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setNotice("");
    try {
      // 1. Create the client's business
      const business = await pb.collection("businesses").create({
        name: form.business_name.trim() || `${form.name.trim()}'s Business`,
        industry: form.industry.trim(),
      });
      // 2. Create the client user linked to the admin and business
      const created = await pb.collection("users").create({
        email: form.email.trim(),
        password: form.password,
        passwordConfirm: form.password,
        name: form.name.trim(),
        role: "client",
        status: "active",
        client_of: user!.id,
        business: business.id,
      });
      // PB may mask fields like `email` in the create response; merge the record
      // with what we already know (and the business object we just created).
      const merged: ClientUser = {
        ...(created as unknown as ClientUser),
        name: created.name || form.name.trim(),
        email: created.email || form.email.trim(),
        business: business.id,
        expand: { business: business as unknown as { name?: string; industry?: string } },
      };
      setClients((prev) => [merged, ...prev]);
      setDialogOpen(false);
      setForm({ name: "", email: "", password: "", business_name: "", industry: "" });
      setNotice(`Client onboarded! ${merged.email} can now sign in and manage their leads.`);
    } catch (err: any) {
      setNotice(`Error: ${err?.message || "Failed to create client"}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (client: ClientUser) => {
    const next = client.status === "active" ? "inactive" : "active";
    try {
      await pb.collection("users").update(client.id, { status: next });
      setClients((prev) => prev.map((c) => (c.id === client.id ? { ...c, status: next } : c)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (client: ClientUser) => {
    if (!confirm(`Delete client ${client.email}? This removes their account (leads are kept for admin review).`)) return;
    try {
      await pb.collection("users").delete(client.id);
      setClients((prev) => prev.filter((c) => c.id !== client.id));
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (c.name || "").toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.expand?.business?.name || "").toLowerCase().includes(q);
  });

  if (authLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Client Onboarding</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create client accounts and businesses. Clients then sign in to upload leads and run marketing.
          </p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#2563eb] px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-600"
        >
          <UserPlus className="h-4 w-4" /> Onboard New Client
        </button>
      </div>

      {notice && (
        <div
          className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
            notice.startsWith("Error")
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          {notice}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total Clients", value: clients.length, icon: Building2, color: "#2563eb", bg: "bg-blue-50" },
          { label: "Active", value: clients.filter((c) => c.status === "active").length, icon: ShieldCheck, color: "#10b981", bg: "bg-emerald-50" },
          { label: "Leads Uploaded", value: Object.values(leadsByClient).reduce((a, b) => a + b, 0), icon: Users, color: "#8b5cf6", bg: "bg-violet-50" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">{s.label}</span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}>
                <s.icon className="h-4 w-4" style={{ color: s.color }} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">
            Clients ({filtered.length})
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients..."
              className="w-56 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-300 focus:outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Business</th>
                <th className="px-5 py-3">Leads</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Onboarded</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-slate-600">No clients yet</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Click &quot;Onboard New Client&quot; to create the first one.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((client) => (
                  <tr key={client.id} className="transition-colors hover:bg-slate-50/60">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-700 text-xs font-bold text-white">
                          {(client.name || "C").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-800">{client.name || "—"}</p>
                          <p className="flex items-center gap-1 truncate text-xs text-slate-400">
                            <Mail className="h-3 w-3" /> {client.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-700">{client.expand?.business?.name || "—"}</p>
                      {client.expand?.business?.industry && (
                        <p className="text-xs text-slate-400">{client.expand.business.industry}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/dashboard/leads?client=${client.id}`}
                        className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                      >
                        {leadsByClient[client.id] || 0} <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          client.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {client.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">
                      {client.created ? new Date(client.created).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleStatus(client)}
                          title={client.status === "active" ? "Deactivate" : "Activate"}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                            client.status === "active"
                              ? "text-amber-600 hover:bg-amber-50"
                              : "text-emerald-600 hover:bg-emerald-50"
                          }`}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(client)}
                          title="Delete client"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={() => setDialogOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold tracking-tight text-slate-900">Onboard New Client</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Creates the client&apos;s business + login. The client can then upload leads and run marketing.
                </p>
              </div>
              <button onClick={() => setDialogOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreate} className="mt-5 space-y-4">
              <Field label="Client name">
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Bright Hospital" className={inputCls} />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Email (login)">
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="client@business.com" className={inputCls} />
                </Field>
                <Field label="Password (login)">
                  <input required minLength={8} type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="min 8 characters" className={inputCls} />
                </Field>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Business name">
                  <input value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} placeholder="e.g. Bright Hospital" className={inputCls} />
                </Field>
                <Field label="Industry">
                  <input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="e.g. Healthcare" className={inputCls} />
                </Field>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setDialogOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-60"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {submitting ? "Creating..." : <><Plus className="h-4 w-4" /> Create Client</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-300 focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}
