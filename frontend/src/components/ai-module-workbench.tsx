"use client";

import { useState } from "react";
import { Check, Copy, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AiModuleWorkbenchProps = {
  moduleKey: string;
  title: string;
  description: string;
  badge?: string;
  defaultChannel?: string;
  defaultPrompt?: string;
  quickActions: string[];
  /** Quick actions rendered faded/locked (coming soon), matched by label. */
  disabledActions?: string[];
};

const pillInputCls =
  "h-9 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-violet-300 focus:bg-white focus:outline-none";

function PillInput({
  value,
  onChange,
  full,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  full?: boolean;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(pillInputCls, full ? "w-full" : "min-w-0 flex-1")}
    />
  );
}

export function AiModuleWorkbench({
  moduleKey,
  title,
  description,
  badge = "AI Automation",
  defaultChannel = "Marketing",
  defaultPrompt = "",
  quickActions,
  disabledActions = [],
}: AiModuleWorkbenchProps) {
  const [business, setBusiness] = useState("ProgVision");
  const [audience, setAudience] = useState("small business owners");
  const [goal, setGoal] = useState("generate qualified leads");
  const [channel, setChannel] = useState(defaultChannel);
  const [tone, setTone] = useState("premium and direct");
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [output, setOutput] = useState("");
  const [provider, setProvider] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [enabled, setEnabled] = useState(true);

  async function generate(action = prompt) {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/free-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module: moduleKey, business, audience, goal, channel, tone, prompt: action }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generation failed");
      setOutput(data.content);
      setProvider(data.provider || "");
    } catch (e: any) {
      setOutput(`**Generation failed:** ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function copyOutput() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
            <Sparkles className="h-3.5 w-3.5" />
            {badge}
          </span>
          <h2 className="mt-3 font-outfit text-xl font-bold tracking-tight text-slate-900">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
        {/* Automation toggle */}
        <button
          onClick={() => setEnabled((v) => !v)}
          role="switch"
          aria-checked={enabled}
          aria-label={`${badge} ${enabled ? "enabled" : "disabled"}`}
          className={cn(
            "relative h-6 w-11 shrink-0 rounded-full border transition-colors",
            enabled ? "border-transparent bg-blue-600" : "border-slate-300 bg-slate-100"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
              enabled ? "left-[22px]" : "left-0.5"
            )}
          />
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[400px_1fr]">
        {/* Left: one-line brief */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <p className="text-xs font-medium text-slate-500">
            One brief powers content, ads, SEO, CRM, and automation output.
          </p>

          <div className="mt-4 space-y-2">
            <div className="flex flex-wrap gap-2">
              <PillInput value={business} onChange={setBusiness} placeholder="Business" />
              <PillInput value={audience} onChange={setAudience} placeholder="Audience" />
            </div>
            <PillInput value={goal} onChange={setGoal} full placeholder="Goal" />
            <div className="flex flex-wrap gap-2">
              <PillInput value={channel} onChange={setChannel} placeholder="Channel" />
              <Select value={tone} onValueChange={(value) => value && setTone(value)}>
                <SelectTrigger className="h-9 w-auto rounded-full border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 hover:bg-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="premium and direct">Premium &amp; direct</SelectItem>
                  <SelectItem value="friendly and simple">Friendly &amp; simple</SelectItem>
                  <SelectItem value="bold and urgent">Bold &amp; urgent</SelectItem>
                  <SelectItem value="professional and analytical">Professional &amp; analytical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={6}
            placeholder="Write your instruction here — e.g. 'Draft a broadcast announcing our Diwali offer to warm leads'…"
            className="mt-4 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 placeholder:text-slate-400 focus:border-violet-300 focus:bg-white focus:outline-none"
          />

          <button
            onClick={() => generate()}
            disabled={loading || !enabled}
            className={cn(
              "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Generating…" : "Generate"}
          </button>
        </div>

        {/* Right: workflow checklist */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <p className="text-xs font-medium text-slate-500">Run common workflows from the Vision 360 checklist.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {quickActions.map((action) => {
              const disabled = disabledActions.includes(action);
              return (
                <button
                  key={action}
                  disabled={disabled || !enabled}
                  onClick={() => generate(action)}
                  className={cn(
                    "rounded-xl p-4 text-left text-sm font-medium leading-5 transition-colors",
                    disabled
                      ? "cursor-not-allowed bg-slate-100 text-slate-400"
                      : "bg-slate-800 text-white hover:bg-slate-700"
                  )}
                >
                  {action}
                  {disabled && <span className="mt-1 block text-[11px] font-normal text-slate-400">Coming soon</span>}
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-slate-400">Ready to copy into campaigns, CRM notes, or approvals.</p>
        </div>
      </div>

      {/* Output */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-[15px] font-semibold tracking-tight text-slate-900">Generated Output</h3>
          {output && (
            <button
              onClick={copyOutput}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
        <div className="px-5 py-6">
          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center text-slate-400">
              <Loader2 className="mb-4 h-8 w-8 animate-spin text-violet-500" />
              <p className="text-sm">Building execution-ready output…</p>
            </div>
          ) : output ? (
            <div>
              {provider && <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-slate-400">via {provider}</p>}
              <div className="max-h-[650px] overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/60 p-5 text-sm leading-7 text-slate-700">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="mb-4 text-2xl font-bold tracking-tight text-slate-900">{children}</h1>,
                    h2: ({ children }) => <h2 className="mb-3 mt-6 text-xl font-semibold tracking-tight text-slate-900">{children}</h2>,
                    h3: ({ children }) => <h3 className="mb-2 mt-5 text-lg font-semibold text-slate-900">{children}</h3>,
                    p: ({ children }) => <p className="mb-3 leading-7 text-slate-600">{children}</p>,
                    ul: ({ children }) => <ul className="mb-4 ml-5 list-disc space-y-2 text-slate-600">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-4 ml-5 list-decimal space-y-2 text-slate-600">{children}</ol>,
                    li: ({ children }) => <li className="leading-7">{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
                    hr: () => <hr className="my-6 border-slate-200" />,
                    code: ({ children }) => <code className="rounded bg-slate-200/60 px-1.5 py-0.5 font-mono text-[0.85em] text-violet-700">{children}</code>,
                    pre: ({ children }) => <pre className="mb-4 overflow-x-auto rounded-xl border border-slate-200 bg-slate-900 p-4 font-mono text-sm leading-6 text-slate-100">{children}</pre>,
                  }}
                >
                  {output}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <Sparkles className="mb-4 h-10 w-10 text-violet-400" />
              <p className="text-sm text-slate-500">Choose a quick action or write your own instruction.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
