"use client";

import * as React from "react";
import {
  MessageCircle,
  Send,
  Loader2,
  Users,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
} from "lucide-react";
import { AiModuleWorkbench } from "@/components/ai-module-workbench";
import { pb } from "@/lib/pocketbase";
import { useAuth } from "@/lib/auth";

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-300 focus:outline-none";

export default function WhatsAppAiPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [clients, setClients] = React.useState<{ id: string; name: string; email: string }[]>([]);
  const [clientId, setClientId] = React.useState("");
  const [templateName, setTemplateName] = React.useState("appointment_confirmation_v1");
  const [paramNames, setParamNames] = React.useState("{{name}},Tomorrow,10:00 AM");
  const [leadCount, setLeadCount] = React.useState(0);
  const [sending, setSending] = React.useState(false);
  const [result, setResult] = React.useState("");

  const refreshTarget = React.useCallback(async () => {
    try {
      const opts: any = { fields: "id,phone", requestKey: null };
      if (isAdmin && clientId) opts.filter = `client_id = "${clientId}"`;
      const leads = await pb.collection("leads").getFullList(opts).catch(() => []);
      setLeadCount(leads.filter((l: any) => l.phone).length);
    } catch {
      setLeadCount(0);
    }
  }, [isAdmin, clientId]);

  React.useEffect(() => {
    refreshTarget();
  }, [refreshTarget]);

  React.useEffect(() => {
    if (!isAdmin) return;
    pb.collection("users")
      .getFullList<{ id: string; name: string; email: string }>({ filter: 'role = "client"', sort: "-created", requestKey: null })
      .then(setClients)
      .catch(() => {});
  }, [isAdmin]);

  const sendBroadcast = async () => {
    setSending(true);
    setResult("");
    try {
      const res = await fetch("/api/whatsapp/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: isAdmin ? clientId || undefined : user?.id,
          templateName,
          params: paramNames.split(",").map((p) => p.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Broadcast failed");
      setResult(
        `✅ Sent to ${data.sentCount} of ${data.totalRecipients} recipients via template "${data.template}".` +
          (data.failures?.length ? `\n⚠️ ${data.failures.length} failed (e.g. ${data.failures[0]}).` : "")
      );
    } catch (e: any) {
      setResult(`❌ ${e.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Marketing broadcast panel */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
              <MessageCircle className="h-5 w-5" />
              <Sparkles className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-white p-[2px] text-emerald-600" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">WhatsApp Marketing Broadcast</h2>
              <p className="text-xs text-slate-500">
                Send an approved Meta template to {leadCount} lead{leadCount === 1 ? "" : "s"} with phone numbers.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshTarget}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <Users className="h-3.5 w-3.5" /> Refresh count
            </button>
            <button
              onClick={sendBroadcast}
              disabled={sending || leadCount === 0}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#2563eb] px-4 text-xs font-medium text-white shadow-sm transition-colors hover:bg-blue-600 disabled:opacity-50"
            >
              {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              {sending ? "Sending..." : `Broadcast to ${leadCount}`}
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {isAdmin && (
            <label className="block">
              <span className="mb-1.5 flex items-center gap-1 text-xs font-medium text-slate-600">
                <Building2 className="h-3.5 w-3.5" /> Client (optional)
              </span>
              <select value={clientId} onChange={(e) => setClientId(e.target.value)} className={inputCls}>
                <option value="">All clients</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || c.email}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">Meta template name</span>
            <input value={templateName} onChange={(e) => setTemplateName(e.target.value)} className={inputCls} placeholder="e.g. marketing_promo_v1" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">
              Template body params <span className="text-slate-400">(comma-separated)</span>
            </span>
            <input
              value={paramNames}
              onChange={(e) => setParamNames(e.target.value)}
              className={inputCls}
              placeholder="e.g. {{name}},Visit our website today"
            />
          </label>
        </div>

        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-slate-500">
          <AlertCircle className="mr-1 inline h-3.5 w-3.5 text-amber-500" />
          Templates must be <strong>approved</strong> in the Meta WhatsApp Manager. Business-initiated messages can only use
          templates (no free text). Use <code className="rounded bg-slate-100 px-1">{"{{name}}"}</code> as the first param to
          auto-fill each lead&apos;s name.
        </p>

        {result && (
          <div className="mt-3 whitespace-pre-line rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {result}
          </div>
        )}
      </div>

      {/* Existing AI workbench */}
      <AiModuleWorkbench
        moduleKey="whatsapp-ai"
        title="WhatsApp AI"
        description="Generate WhatsApp broadcasts, lead qualification flows, follow-ups, and handoff scripts for sales conversations."
        defaultChannel="WhatsApp"
        quickActions={["Create broadcast campaign", "Generate lead qualification flow", "Write follow-up messages", "Create appointment booking script", "Write offer reply", "Create human handoff rules"]}
        disabledActions={["Create human handoff rules"]}
      />
    </div>
  );
}
