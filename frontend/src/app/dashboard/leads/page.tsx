"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Plus,
  Mail,
  TrendingUp,
  Star,
  UserCheck,
  UserPlus,
  Flame,
  ArrowUpDown,
  Loader2,
  Edit,
  Trash2,
  UserCircle,
  Building2,
} from "lucide-react";
import { pb } from "@/lib/pocketbase";
import { useAuth } from "@/lib/auth";

const statusConfig: Record<string, { label: string; className: string }> = {
  New: { label: "New", className: "bg-blue-50 text-blue-700" },
  Contacted: { label: "Contacted", className: "bg-amber-50 text-amber-700" },
  Qualified: { label: "Qualified", className: "bg-emerald-50 text-emerald-700" },
};

const sourceColors: Record<string, string> = {
  LinkedIn: "bg-blue-600",
  "Google Ads": "bg-red-500",
  Webinar: "bg-purple-500",
  "Email Campaign": "bg-emerald-600",
  Facebook: "bg-blue-500",
  Referral: "bg-orange-500",
  Instagram: "bg-pink-500",
};

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-300 focus:outline-none";

export default function LeadsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [search, setSearch] = React.useState("");
  const [clientFilter, setClientFilter] = React.useState("");
  const [leads, setLeads] = React.useState<any[]>([]);
  const [clients, setClients] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
    status: "New",
    source: "LinkedIn",
    score: 0,
    client_id: "",
  });
  const [submitting, setSubmitting] = React.useState(false);

  // Support /leads?client=ID (deep link from the Clients page)
  React.useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search).get("client");
      if (q) setClientFilter(q);
    } catch {
      /* ignore */
    }
  }, []);

  React.useEffect(() => {
    async function fetchAll() {
      try {
        const [records, clientRecords] = await Promise.all([
          pb.collection("leads").getFullList({ expand: "contact,client_id", sort: "-created", requestKey: null }),
          isAdmin
            ? pb.collection("users").getFullList({ filter: 'role = "client"', sort: "-created", requestKey: null }).catch(() => [])
            : Promise.resolve([]),
        ]);
        setLeads(records);
        setClients(clientRecords);
      } catch (err) {
        console.error("Failed to fetch leads", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();

    pb.collection("leads")
      .subscribe("*", (e) => {
        if (e.action === "create") setLeads((prev) => [e.record, ...prev]);
        if (e.action === "delete") setLeads((prev) => prev.filter((l) => l.id !== e.record.id));
        if (e.action === "update") setLeads((prev) => prev.map((l) => (l.id === e.record.id ? e.record : l)));
      })
      .catch(() => {});

    return () => {
      pb.collection("leads").unsubscribe("*").catch(() => {});
    };
  }, [isAdmin]);

  const filtered = leads.filter((l) => {
    if (isAdmin && clientFilter && l.client_id !== clientFilter) return false;
    const name = `${l.first_name || ""} ${l.last_name || ""}`.toLowerCase();
    const email = (l.email || "").toLowerCase();
    const company = (l.company || "").toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || email.includes(q) || company.includes(q);
  });

  const totalNew = leads.filter((l) => l.status === "New").length;
  const totalQualified = leads.filter((l) => l.status === "Qualified").length;
  const avgScore = leads.length > 0 ? Math.round(leads.reduce((a, l) => a + (l.score || 0), 0) / leads.length) : 0;

  const clientName = (id: string) => clients.find((c) => c.id === id)?.name || "—";

  const openCreate = () => {
    setEditingId(null);
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      company: "",
      status: "New",
      source: "LinkedIn",
      score: 0,
      client_id: isAdmin ? clientFilter : (user?.id || ""),
    });
    setDialogOpen(true);
  };

  const openEdit = (lead: any) => {
    setEditingId(lead.id);
    setFormData({
      first_name: lead.first_name || "",
      last_name: lead.last_name || "",
      email: lead.email || "",
      phone: lead.phone || "",
      company: lead.company || "",
      status: lead.status || "New",
      source: lead.source || "LinkedIn",
      score: lead.score || 0,
      client_id: lead.client_id || (isAdmin ? "" : user?.id || ""),
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        status: formData.status,
        source: formData.source,
        score: Number(formData.score) || 0,
      };
      if (isAdmin) payload.client_id = formData.client_id || null;
      else payload.client_id = user!.id;

      if (editingId) await pb.collection("leads").update(editingId, payload);
      else await pb.collection("leads").create(payload);
      setDialogOpen(false);
    } catch (err) {
      console.error("Failed to save lead", err);
      alert("Failed to save lead. Please check the fields and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this lead?")) return;
    try {
      await pb.collection("leads").delete(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConvert = async (lead: any) => {
    if (!confirm("Convert this lead to a contact?")) return;
    try {
      await pb.collection("contacts").create({
        first_name: lead.first_name || "",
        last_name: lead.last_name || "",
        email: lead.email || "",
        company: lead.company || "",
        client_id: lead.client_id || null,
      });
      await pb.collection("leads").delete(lead.id);
    } catch (err) {
      console.error("Convert failed", err);
      alert("Error converting lead. Check the contacts collection fields.");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Leads</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isAdmin ? "Upload leads for any client, or view all leads across clients." : "Upload and manage your leads."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/leads/import"
            className="inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
          >
            Import leads
          </Link>
          <button
            onClick={openCreate}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#2563eb] px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-600"
          >
            <Plus className="h-4 w-4" /> Add Lead
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Leads", value: leads.length, icon: Users, color: "text-slate-900", bg: "bg-slate-50" },
          { label: "New", value: totalNew, icon: UserPlus, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Qualified", value: totalQualified, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Avg. Score", value: avgScore, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.bg}`}>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">All Leads ({filtered.length})</h2>
          <div className="flex flex-wrap items-center gap-2">
            {isAdmin && (
              <select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)} className={inputCls + " w-48"}>
                <option value="">All clients</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || c.email}
                  </option>
                ))}
              </select>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search leads…"
                className="w-56 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-300 focus:outline-none"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3">
                  <span className="inline-flex items-center gap-1">
                    Lead Name <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
                <th className="px-5 py-3">Source</th>
                <th className="px-5 py-3">Score</th>
                <th className="px-5 py-3">Status</th>
                {isAdmin && <th className="px-5 py-3">Client</th>}
                <th className="px-5 py-3">Date Added</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="px-5 py-12 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-400" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="px-5 py-14 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <Users className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-slate-600">No leads found</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {isAdmin && clientFilter ? "This client has no leads yet — upload some." : "Add your first lead or import a CSV."}
                    </p>
                    <button onClick={openCreate} className="mt-3 inline-flex items-center gap-1 rounded-lg bg-[#2563eb] px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600">
                      <Plus className="h-3.5 w-3.5" /> Add lead
                    </button>
                  </td>
                </tr>
              ) : (
                filtered.map((l) => (
                  <tr key={l.id} className="transition-colors hover:bg-slate-50/60">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                          {(l.first_name?.[0] || "?")}
                          {l.last_name?.[0] || ""}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800">
                            {l.first_name} {l.last_name}
                          </p>
                          <p className="truncate text-xs text-slate-400">
                            {l.email}
                            {l.company ? ` • ${l.company}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 text-slate-600">
                        <span className={`h-2 w-2 rounded-full ${sourceColors[l.source] || "bg-gray-400"}`} />
                        {l.source || "Unknown"}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          (l.score || 0) >= 90
                            ? "bg-emerald-50 text-emerald-700"
                            : (l.score || 0) >= 70
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {(l.score || 0) >= 90 ? <Flame className="h-3 w-3" /> : <Star className="h-3 w-3" />}
                        {l.score || 0}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusConfig[l.status || "New"]?.className || "bg-slate-100 text-slate-500"}`}>
                        {statusConfig[l.status || "New"]?.label || l.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
                          <Building2 className="h-3.5 w-3.5 text-slate-400" />
                          {clientName(l.client_id)}
                        </span>
                      </td>
                    )}
                    <td className="px-5 py-3.5 text-xs text-slate-400">
                      {l.created ? new Date(l.created).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleConvert(l)}
                          title="Convert to Contact"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 transition-colors hover:bg-emerald-50"
                        >
                          <UserCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEdit(l)}
                          title="Edit"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-600 transition-colors hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(l.id)}
                          title="Delete"
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

      {/* Create/Edit dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={() => setDialogOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold tracking-tight text-slate-900">{editingId ? "Edit Lead" : "Create Lead"}</h3>
            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="First name">
                  <input required value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Last name">
                  <input required value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className={inputCls} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Email">
                  <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Phone">
                  <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91..." className={inputCls} />
                </Field>
              </div>
              <Field label="Company">
                <input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className={inputCls} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Status">
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={inputCls}>
                    <option>New</option>
                    <option>Contacted</option>
                    <option>Qualified</option>
                  </select>
                </Field>
                <Field label="Source">
                  <select value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} className={inputCls}>
                    {Object.keys(sourceColors).map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Score (0-100)">
                  <input type="number" min={0} max={100} value={formData.score} onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })} className={inputCls} />
                </Field>
                {isAdmin && (
                  <Field label="Client">
                    <select value={formData.client_id} onChange={(e) => setFormData({ ...formData, client_id: e.target.value })} className={inputCls}>
                      <option value="">— Select client —</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name || c.email}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setDialogOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-60"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingId ? "Save changes" : "Create lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}
