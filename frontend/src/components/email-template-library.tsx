"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getEmailTemplate, type EmailTemplate, emailTemplates, renderEmailTemplate } from "@/lib/email-templates";
import { Check, Copy, FileText, Sparkles } from "lucide-react";

function TemplatePreview({ template, values }: { template: EmailTemplate; values: Record<string, string> }) {
  const subject = renderEmailTemplate(template.subject, values);
  const body = renderEmailTemplate(template.body, values);
  const previewTitle = renderEmailTemplate(template.previewTitle, values);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111318]">
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-5 text-white">
        <p className="text-[11px] uppercase tracking-[0.18em] opacity-80">MarketingPilot AI</p>
        <h3 className="mt-1 text-2xl font-semibold">{previewTitle}</h3>
        <p className="mt-2 text-sm text-white/80">{subject}</p>
      </div>
      <div className="space-y-5 p-6 text-sm leading-7 text-slate-200">
        <p>Hi {values["{{first_name}}"] || "there"},</p>
        <pre className="whitespace-pre-wrap font-sans text-slate-300">{body}</pre>
        <div className="border-t border-white/10 pt-4 text-slate-400">
          <p className="font-medium text-slate-100">MarketingPilot AI Team</p>
          <p>support@marketingpilot.ai</p>
          <p className="mt-3 text-xs">This email was sent to {values["{{email}}"] || "{{email}}"}</p>
        </div>
      </div>
    </div>
  );
}

export function EmailTemplateLibrary() {
  const [selectedKey, setSelectedKey] = useState(emailTemplates[0].key);
  const [copied, setCopied] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({
    "{{first_name}}": "Anita",
    "{{workspace_name}}": "Acme Corp",
    "{{email}}": "anita@brightspace.com",
    "{{temporary_password}}": "MP-7X2K9Q1A",
    "{{dashboard_link}}": "https://app.marketingpilot.ai/dashboard",
    "{{verification_link}}": "https://app.marketingpilot.ai/verify",
    "{{setup_link}}": "https://app.marketingpilot.ai/dashboard/workspace",
    "{{login_url}}": "https://app.marketingpilot.ai/login",
    "{{password}}": "MP-7X2K9Q1A",
    "{{trial_days}}": "7",
    "{{report}}": "Weekly Business Summary",
    "{{score}}": "92/100",
    "{{issues}}": "3 critical, 7 medium",
    "{{lead}}": "Anita Rao",
    "{{company}}": "BrightSpace",
    "{{leads}}": "24",
    "{{campaigns}}": "6",
    "{{revenue}}": "₹5,40,000",
    "{{tasks}}": "18",
  });

  const template = useMemo(() => getEmailTemplate(selectedKey), [selectedKey]);

  const renderedSubject = renderEmailTemplate(template.subject, values);
  const renderedBody = renderEmailTemplate(template.body, values);

  async function copyTemplate() {
    await navigator.clipboard.writeText(`Subject: ${renderedSubject}\n\n${renderedBody}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <Badge className="mb-3 gap-2 bg-primary/10 text-primary" variant="secondary">
          <Sparkles className="h-3.5 w-3.5" />
          Email template library
        </Badge>
        <h1 className="font-outfit text-3xl font-bold tracking-tight">Premium email templates</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
          Use these reusable SaaS templates for onboarding, login details, reports, leads, billing, and product updates.
          Every email follows the same branded structure.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {emailTemplates.map((item) => (
          <button
            key={item.key}
            onClick={() => setSelectedKey(item.key)}
            className={`rounded-2xl border p-4 text-left transition-colors ${
              selectedKey === item.key
                ? "border-primary/40 bg-primary/10"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
          >
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.category}</p>
            <p className="mt-2 font-semibold">{item.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Template details
            </CardTitle>
            <CardDescription>{template.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Subject</p>
              <p className="mt-1 text-sm font-medium">{renderedSubject}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">CTA</p>
              <p className="mt-1 text-sm font-medium">{template.ctaLabel}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Variables</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {template.variables.map((token) => (
                  <Badge key={token} variant="outline" className="border-white/10 bg-white/5">
                    {token}
                  </Badge>
                ))}
              </div>
            </div>

            <Button onClick={copyTemplate} className="w-full gap-2">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy template"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Premium preview</CardTitle>
            <CardDescription>Stripe / Notion style email structure with brand header, CTA, support, and footer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TemplatePreview template={template} values={values} />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {Object.entries(values).slice(0, 9).map(([token, value]) => (
                <div key={token} className="space-y-2">
                  <p className="text-xs text-muted-foreground">{token}</p>
                  <Input value={value} onChange={(e) => setValues((prev) => ({ ...prev, [token]: e.target.value }))} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

