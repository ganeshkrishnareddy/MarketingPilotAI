"use client";

import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileUp, ListPlus, Mail, Phone, User, Download, MessageSquare, Send, Sparkles, CheckCircle2, FileText, Database, Building2 } from "lucide-react";
import { emailTemplates, getEmailTemplate, renderEmailTemplate, type EmailTemplateKey } from "@/lib/email-templates";
import { pb } from "@/lib/pocketbase";
import { useAuth } from "@/lib/auth";

type LeadRow = {
  name: string;
  email: string;
  phone: string;
  business: string;
};

function parseCsv(text: string): LeadRow[] {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length <= 1) return [];
  const headers = lines[0].split(",").map((header) => header.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = (values[index] || "").trim();
    });
    return {
      name: row.name || row.full_name || "",
      email: row.email || "",
      phone: row.phone || row.number || "",
      business: row.business || row.company || "",
    };
  }).filter((row) => row.name || row.email || row.phone || row.business);
}

export default function LeadImportPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [manualRows, setManualRows] = useState<LeadRow[]>([]);
  const [clients, setClients] = useState<{ id: string; name: string; email: string }[]>([]);
  const [clientId, setClientId] = useState("");
  const [importing, setImporting] = useState(false);
  const [importSummary, setImportSummary] = useState("");

  useEffect(() => {
    if (!isAdmin) return;
    pb.collection("users")
      .getFullList<{ id: string; name: string; email: string }>({ filter: 'role = "client"', sort: "-created", requestKey: null })
      .then(setClients)
      .catch(() => {});
  }, [isAdmin]);
  const [csvPreview, setCsvPreview] = useState("name,email,phone,business\nAsha,asha@brand.com,+91 90000 00001,Brand Co");
  const [uploadName, setUploadName] = useState("");
  const [status, setStatus] = useState("");
  const [channel, setChannel] = useState<"WhatsApp" | "Email">("WhatsApp");
  const [messageSubject, setMessageSubject] = useState("New marketing update for your business");
  const [messageBody, setMessageBody] = useState(
    "Hi {{name}},\n\nWe reviewed your business {{business}} and prepared a quick personalized update.\n\nReply YES and we will send the next step."
  );
  const [templateKey, setTemplateKey] = useState<EmailTemplateKey>("new-lead-captured");
  const [sending, setSending] = useState(false);
  const [sendSummary, setSendSummary] = useState("");
  const [previewReady, setPreviewReady] = useState(false);

  const totalRows = useMemo(() => manualRows.length, [manualRows]);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadName(file.name);
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const firstSheet = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheet];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" });

    const normalized = rows.map((row) => ({
      name: String(row.name || row.full_name || row.Name || ""),
      email: String(row.email || row.Email || ""),
      phone: String(row.phone || row.number || row.Phone || ""),
      business: String(row.business || row.company || row.Business || row.Company || ""),
    })).filter((row) => row.name || row.email || row.phone || row.business);

    setManualRows(normalized);
    setStatus(`Loaded ${normalized.length} rows from ${file.name}`);
  }

  function addManualRow() {
    setManualRows((prev) => [...prev, { name: "", email: "", phone: "", business: "" }]);
  }

  function updateRow(index: number, key: keyof LeadRow, value: string) {
    setManualRows((prev) => prev.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row));
  }

  function loadCsvPreview() {
    const rows = parseCsv(csvPreview);
    if (rows.length) {
      setManualRows(rows);
      setStatus(`Parsed ${rows.length} CSV rows`);
    } else {
      setStatus("CSV preview did not contain valid lead rows.");
    }
  }

  async function importToDatabase() {
    const rows = manualRows.filter((r) => r.name || r.email || r.phone || r.business);
    if (rows.length === 0) {
      setImportSummary("Add at least one lead row first.");
      return;
    }
    setImporting(true);
    let created = 0;
    let errors = 0;
    try {
      for (const row of rows) {
        try {
          const [first_name, ...rest] = (row.name || "").trim().split(/\s+/);
          await pb.collection("leads").create({
            first_name: first_name || "",
            last_name: rest.join(" ") || "",
            email: row.email || "",
            phone: row.phone || "",
            company: row.business || "",
            status: "New",
            source: "CSV Import",
            score: 0,
            client_id: isAdmin ? clientId || null : user?.id || null,
          });
          created++;
        } catch {
          errors++;
        }
      }
      setImportSummary(`Imported ${created} lead${created === 1 ? "" : "s"} to the CRM${errors ? ` (${errors} failed)` : ""}.`);
    } finally {
      setImporting(false);
    }
  }

  function buildRecipientSummary() {
    const valid = manualRows.filter((row) => row.email || row.phone);
    if (valid.length === 0) return "No valid recipients selected.";
    return `${valid.length} recipient${valid.length === 1 ? "" : "s"} ready for ${channel}`;
  }

  async function generateTemplate() {
    const selectedTemplate = getEmailTemplate(templateKey);
    const leadList = manualRows
      .filter((row) => row.name || row.email || row.phone || row.business)
      .slice(0, 5)
      .map((row) => `- ${row.name} | ${row.email} | ${row.phone} | ${row.business}`)
      .join("\n");

    const prompt = [
      `Write a short ${channel} message for imported leads.`,
      `Subject: ${messageSubject}`,
      `Audience sample:`,
      leadList || "- no sample leads yet",
      `Current draft: ${messageBody}`,
      `Base template: ${selectedTemplate.title}`,
      "Return a clean, persuasive message with placeholders for name and business.",
    ].join("\n\n");

    try {
      setSending(true);
      const response = await fetch("/api/ai/free-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module: channel === "WhatsApp" ? "whatsapp-ai" : "email-automation",
          business: "MarketingPilot AI",
          audience: "imported leads",
          goal: `write a ${channel.toLowerCase()} campaign`,
          channel,
          tone: "professional and direct",
          prompt,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Template generation failed");
      setMessageSubject(renderEmailTemplate(selectedTemplate.subject, {
        "{{first_name}}": "Anita",
        "{{email}}": "anita@brightspace.com",
        "{{lead}}": "Anita Rao",
        "{{company}}": "BrightSpace",
      }));
      setMessageBody(data.content || renderEmailTemplate(selectedTemplate.body, {
        "{{first_name}}": "Anita",
        "{{name}}": "Anita",
        "{{business}}": "BrightSpace",
        "{{email}}": "anita@brightspace.com",
        "{{dashboard_link}}": "https://app.marketingpilot.ai/dashboard",
        "{{lead}}": "Anita Rao",
        "{{company}}": "BrightSpace",
      }));
      setSendSummary(`Generated a ${channel} draft with ${data.provider}. Review the preview, then approve to send.`);
      setPreviewReady(true);
    } catch (error) {
      setSendSummary(error instanceof Error ? error.message : "Could not generate template.");
    } finally {
      setSending(false);
    }
  }

  function buildProfessionalPreview() {
    const leadCount = manualRows.filter((row) => row.email || row.phone).length;
    const previewName = manualRows.find((row) => row.name)?.name || "Lead";
    const previewBusiness = manualRows.find((row) => row.business)?.business || "your business";
    const renderedBody = messageBody
      .replaceAll("{{name}}", previewName)
      .replaceAll("{{business}}", previewBusiness)
      .trim();

    return {
      subject: channel === "Email" ? messageSubject : `WhatsApp message for ${previewName}`,
      recipientLine: `${leadCount} recipient${leadCount === 1 ? "" : "s"} ready for ${channel}`,
      body: renderedBody,
      previewName,
      previewBusiness,
    };
  }

  async function sendSelectedLeads() {
    const recipients = manualRows.filter((row) => row.email || row.phone);
    if (recipients.length === 0) {
      setSendSummary("Add at least one lead with an email or phone number.");
      return;
    }
    setSending(true);
    try {
      const response = await fetch("/api/leads/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            channel,
            subject: messageSubject,
            message: messageBody,
            templateKey,
            leads: recipients,
          }),
        });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Send failed");

      if (channel === "Email") {
        setSendSummary(`Email sent successfully to ${data.sentCount} lead${data.sentCount === 1 ? "" : "s"} from SMTP sender.`);
      } else {
        setSendSummary(`WhatsApp preview prepared for ${data.sentCount} lead${data.sentCount === 1 ? "" : "s"}. Connect the WhatsApp API connector for live delivery.`);
      }
      setStatus(buildRecipientSummary());
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <Badge className="mb-3 gap-2 bg-primary/10 text-primary" variant="secondary">
          <FileUp className="h-3.5 w-3.5" />
          Lead import
        </Badge>
        <h1 className="font-outfit text-3xl font-bold tracking-tight">Import leads from CSV, Excel, or manual entry</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
          Add name, email, phone number, and business name, then use the list for CRM, WhatsApp, or email automation.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Rows loaded</p>
            <p className="mt-2 text-3xl font-bold">{totalRows}</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5 backdrop-blur-xl md:col-span-3">
          <CardContent className="p-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">File status</p>
              <p className="font-medium">{uploadName || "No file uploaded yet"}</p>
            </div>
            <Button variant="outline" className="gap-2 border-white/10 bg-white/5">
              <Download className="h-4 w-4" />
              Export template
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListPlus className="h-5 w-5 text-primary" />
              CSV / Excel upload
            </CardTitle>
            <CardDescription>Upload a spreadsheet with `name`, `email`, `phone`, and `business` columns.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-primary-foreground" />
            <div className="space-y-2">
              <Label>CSV preview</Label>
              <Textarea value={csvPreview} onChange={(e) => setCsvPreview(e.target.value)} rows={8} />
            </div>
            <Button onClick={loadCsvPreview} className="w-full">Parse CSV preview</Button>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Manual lead list
            </CardTitle>
            <CardDescription>Edit rows before pushing them into CRM and automation queues.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {manualRows.map((row, index) => (
                <div key={index} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-4">
                  <Input value={row.name} onChange={(e) => updateRow(index, "name", e.target.value)} placeholder="Name" />
                  <Input value={row.email} onChange={(e) => updateRow(index, "email", e.target.value)} placeholder="Email" type="email" />
                  <Input value={row.phone} onChange={(e) => updateRow(index, "phone", e.target.value)} placeholder="Phone" />
                  <Input value={row.business} onChange={(e) => updateRow(index, "business", e.target.value)} placeholder="Business" />
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={addManualRow} variant="outline" className="border-white/10 bg-white/5">Add another row</Button>
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground focus:outline-none"
                  >
                    <option value="">Unassigned client</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name || c.email}</option>
                    ))}
                  </select>
                </div>
              )}
              <Button onClick={importToDatabase} className="gap-2" disabled={importing || totalRows === 0}>
                <Database className="h-4 w-4" />
                {importing ? "Importing..." : `Import ${totalRows} lead${totalRows === 1 ? "" : "s"} to CRM`}
              </Button>
              <Button onClick={sendSelectedLeads} className="gap-2" disabled={sending}>
                <Send className="h-4 w-4" />
                Send selected leads
              </Button>
            </div>
            {importSummary && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                {importSummary}
              </div>
            )}
            {status && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                {status}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Send message setup
          </CardTitle>
          <CardDescription>Choose the channel and message before triggering the send button.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[220px_240px_1fr]">
          <div className="space-y-2 lg:col-span-3">
            <Label>Template</Label>
            <Select value={templateKey} onValueChange={(value) => setTemplateKey(value as EmailTemplateKey)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {emailTemplates.map((template) => (
                  <SelectItem key={template.key} value={template.key}>
                    {template.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Channel</Label>
            <Select value={channel} onValueChange={(value) => setChannel(value as "WhatsApp" | "Email")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                <SelectItem value="Email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{channel === "Email" ? "Email subject" : "Message title"}</Label>
            <Input value={messageSubject} onChange={(e) => setMessageSubject(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Message body</Label>
            <Textarea value={messageBody} onChange={(e) => setMessageBody(e.target.value)} rows={6} />
          </div>
          <div className="flex flex-wrap gap-3 lg:col-span-3">
            <Button onClick={generateTemplate} variant="outline" className="gap-2 border-white/10 bg-white/5" disabled={sending}>
              <Sparkles className="h-4 w-4" />
              Create professional preview
            </Button>
            <Button onClick={sendSelectedLeads} className="gap-2" disabled={sending || !previewReady}>
              <CheckCircle2 className="h-4 w-4" />
              Approve and send
            </Button>
          </div>
          {sendSummary && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 lg:col-span-3">
              {sendSummary}
            </div>
          )}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] lg:col-span-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">Professional preview</p>
                <p className="text-xs text-muted-foreground">{buildProfessionalPreview().recipientLine}</p>
              </div>
              <Badge variant="outline" className="border-white/10 bg-white/5">
                <FileText className="mr-2 h-3.5 w-3.5" />
                Ready for approval
              </Badge>
            </div>
            <div className="mt-4 rounded-xl border border-white/10 bg-[#111318] p-5">
              <div className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-white">
                <p className="text-[11px] uppercase tracking-[0.18em] opacity-80">MarketingPilot AI</p>
                <p className="mt-1 text-lg font-semibold">{buildProfessionalPreview().subject}</p>
              </div>
              <div className="mt-4 space-y-4 text-sm leading-7 text-slate-200">
                <p>Hi {buildProfessionalPreview().previewName},</p>
                <div className="whitespace-pre-wrap text-slate-300">{buildProfessionalPreview().body}</div>
                <div className="border-t border-white/10 pt-4 text-slate-400">
                  <p>Best regards,</p>
                  <p>MarketingPilot AI</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            Automation ready
          </CardTitle>
          <CardDescription>Once imported, these leads can be passed to CRM, email, WhatsApp, and ad audiences.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {["Validate email", "Score lead quality", "Trigger follow-up workflow"].map((step) => (
            <div key={step} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              {step}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
