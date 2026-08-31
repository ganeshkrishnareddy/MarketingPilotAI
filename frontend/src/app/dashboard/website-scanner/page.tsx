"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Download,
  Gauge,
  Globe2,
  History,
  Loader2,
  Lock,
  Radar,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Check = {
  label: string;
  status: "pass" | "warn" | "fail";
  detail: string;
};

type ScanResult = {
  scannedAt: string;
  url: string;
  finalUrl: string;
  statusCode: number;
  healthScore: number;
  opportunityScore: number;
  scores: Record<"seo" | "performance" | "security" | "accessibility", number>;
  summary: {
    title: string;
    description: string;
    technologies: string[];
    loadMs: number;
    sizeKb: number;
    internalLinks: number;
    externalLinks: number;
    images: number;
    forms: number;
  };
  checks: Record<"seo" | "performance" | "security" | "accessibility", Check[]>;
  aiReport: {
    executiveSummary: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
};

const scanStages = [
  "Connecting to website",
  "Reading HTML and headers",
  "Auditing SEO structure",
  "Checking security and accessibility",
  "Generating AI recommendations",
];

const scoreCards = [
  { key: "seo", label: "SEO", icon: Search, accent: "text-sky-400" },
  { key: "performance", label: "Performance", icon: Zap, accent: "text-amber-400" },
  { key: "security", label: "Security", icon: ShieldCheck, accent: "text-emerald-400" },
  { key: "accessibility", label: "Accessibility", icon: Gauge, accent: "text-violet-400" },
] as const;

function statusStyles(status: Check["status"]) {
  if (status === "pass") return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
  if (status === "warn") return "border-amber-500/20 bg-amber-500/10 text-amber-400";
  return "border-red-500/20 bg-red-500/10 text-red-400";
}

function CheckIcon({ status }: { status: Check["status"] }) {
  if (status === "pass") return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
  if (status === "warn") return <AlertTriangle className="h-4 w-4 text-amber-400" />;
  return <AlertTriangle className="h-4 w-4 text-red-400" />;
}

function ScoreRing({ value, label }: { value: number; label: string }) {
  const color = value >= 80 ? "text-emerald-400" : value >= 60 ? "text-amber-400" : "text-red-400";
  return (
    <div className="rounded-lg border border-white/10 bg-white/50 p-5 shadow-sm backdrop-blur-xl dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <Badge variant="outline" className={statusStyles(value >= 80 ? "pass" : value >= 60 ? "warn" : "fail")}>
          {value >= 80 ? "Strong" : value >= 60 ? "Improve" : "Critical"}
        </Badge>
      </div>
      <div className={`mt-4 text-5xl font-bold tracking-tight ${color}`}>{value}</div>
      <Progress value={value} className="mt-4" />
    </div>
  );
}

export default function WebsiteScannerPage() {
  const [url, setUrl] = useState("https://progvision.com");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(scanStages[0]);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("marketingpilot.websiteScans");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (!isScanning) return;
    let index = 0;
    const timer = window.setInterval(() => {
      index = Math.min(index + 1, scanStages.length - 1);
      setStage(scanStages[index]);
      setProgress((current) => Math.min(current + 18, 92));
    }, 700);
    return () => window.clearInterval(timer);
  }, [isScanning]);

  const scanStats = useMemo(() => {
    if (!result) return [];
    return [
      { label: "Load Time", value: `${result.summary.loadMs}ms` },
      { label: "HTML Size", value: `${result.summary.sizeKb}KB` },
      { label: "Internal Links", value: result.summary.internalLinks.toString() },
      { label: "Images", value: result.summary.images.toString() },
    ];
  }, [result]);

  async function runScan(targetUrl = url) {
    setIsScanning(true);
    setError("");
    setProgress(8);
    setStage(scanStages[0]);

    try {
      const response = await fetch("/api/website-scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Scan failed.");

      setProgress(100);
      setStage("Scan complete");
      setResult(payload);
      const nextHistory = [payload, ...history.filter((item) => item.url !== payload.url)].slice(0, 8);
      setHistory(nextHistory);
      window.localStorage.setItem("marketingpilot.websiteScans", JSON.stringify(nextHistory));
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "Unable to scan this website.");
    } finally {
      setIsScanning(false);
    }
  }

  function exportReport() {
    if (!result) return;
    const report = [
      `MarketingPilot AI Website Intelligence Report`,
      `URL: ${result.url}`,
      `Scanned: ${new Date(result.scannedAt).toLocaleString()}`,
      `Health Score: ${result.healthScore}/100`,
      `Opportunity Score: ${result.opportunityScore}/100`,
      "",
      result.aiReport.executiveSummary,
      "",
      "Recommendations:",
      ...result.aiReport.recommendations.map((item, index) => `${index + 1}. ${item}`),
    ].join("\n");
    const blob = new Blob([report], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `website-audit-${new URL(result.url).hostname}.txt`;
    link.click();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-white/10 bg-gradient-to-br from-sky-500/10 via-background to-violet-500/10 p-6 shadow-2xl shadow-black/5">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <Badge className="mb-4 gap-2 bg-primary/10 text-primary hover:bg-primary/15" variant="secondary">
              <Radar className="h-3.5 w-3.5" />
              Website Intelligence Engine
            </Badge>
            <h1 className="font-outfit text-3xl font-bold tracking-tight md:text-4xl">Scan any business website and turn gaps into revenue opportunities.</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
              Uses free built-in analysis: crawler, technology detection, SEO audit, security headers, accessibility checks, performance signals, and AI-style growth recommendations.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 lg:max-w-xl">
            <div className="flex gap-2">
              <Input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com" className="h-11 bg-background/70" />
              <Button onClick={() => runScan()} disabled={isScanning} className="h-11 gap-2 whitespace-nowrap">
                {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Run Scan
              </Button>
            </div>
            {isScanning && (
              <div className="rounded-md border border-white/10 bg-background/70 p-3">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{stage}</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}
            {error && <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {result ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <ScoreRing label="Health Score" value={result.healthScore} />
                <ScoreRing label="Opportunity Score" value={result.opportunityScore} />
                {scoreCards.slice(0, 2).map((card) => (
                  <Card key={card.key} className="border-white/10 bg-white/50 backdrop-blur-xl dark:bg-white/[0.03]">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                        <card.icon className={`h-4 w-4 ${card.accent}`} />
                        {card.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold">{result.scores[card.key]}</div>
                      <Progress value={result.scores[card.key]} className="mt-4" />
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                {scanStats.map((stat) => (
                  <Card key={stat.label} className="border-white/10 bg-background/70">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="mt-1 text-2xl font-semibold">{stat.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="border-white/10 bg-white/50 backdrop-blur-xl dark:bg-white/[0.03]">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Sparkles className="h-5 w-5 text-primary" />
                      AI Business Report
                    </CardTitle>
                    <p className="mt-2 text-sm text-muted-foreground">{result.aiReport.executiveSummary}</p>
                  </div>
                  <Button variant="outline" onClick={exportReport} className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent className="grid gap-4 lg:grid-cols-3">
                  <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/5 p-4">
                    <h3 className="mb-3 text-sm font-semibold text-emerald-300">Strengths</h3>
                    <div className="space-y-3">
                      {result.aiReport.strengths.length ? result.aiReport.strengths.map((item) => <p key={item} className="text-sm text-muted-foreground">{item}</p>) : <p className="text-sm text-muted-foreground">No strong signals found yet.</p>}
                    </div>
                  </div>
                  <div className="rounded-lg border border-red-500/15 bg-red-500/5 p-4">
                    <h3 className="mb-3 text-sm font-semibold text-red-300">Weaknesses</h3>
                    <div className="space-y-3">
                      {result.aiReport.weaknesses.length ? result.aiReport.weaknesses.map((item) => <p key={item} className="text-sm text-muted-foreground">{item}</p>) : <p className="text-sm text-muted-foreground">No critical failures found.</p>}
                    </div>
                  </div>
                  <div className="rounded-lg border border-sky-500/15 bg-sky-500/5 p-4">
                    <h3 className="mb-3 text-sm font-semibold text-sky-300">Next Actions</h3>
                    <div className="space-y-3">
                      {result.aiReport.recommendations.slice(0, 5).map((item) => <p key={item} className="text-sm text-muted-foreground">{item}</p>)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="seo" className="rounded-lg border border-white/10 bg-background/60 p-4">
                <TabsList className="mb-4 flex-wrap">
                  {scoreCards.map((card) => (
                    <TabsTrigger key={card.key} value={card.key} className="gap-2 px-3">
                      <card.icon className={`h-4 w-4 ${card.accent}`} />
                      {card.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {scoreCards.map((card) => (
                  <TabsContent key={card.key} value={card.key}>
                    <div className="grid gap-3 md:grid-cols-2">
                      {result.checks[card.key].map((check) => (
                        <div key={check.label} className="rounded-lg border border-white/10 bg-white/40 p-4 dark:bg-white/[0.03]">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <CheckIcon status={check.status} />
                              <h3 className="font-medium">{check.label}</h3>
                            </div>
                            <Badge variant="outline" className={statusStyles(check.status)}>{check.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{check.detail}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </>
          ) : (
            <Card className="border-white/10 bg-white/50 p-8 text-center backdrop-blur-xl dark:bg-white/[0.03]">
              <Globe2 className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h2 className="font-outfit text-2xl font-semibold">Ready for your first website scan</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                Enter a client, competitor, or prospect website. MarketingPilot AI will generate a practical audit that can become a CRM opportunity, outreach email, or proposal.
              </p>
              <Button onClick={() => runScan()} className="mt-6 gap-2">
                Start with sample URL
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Card>
          )}
        </div>

        <aside className="space-y-6">
          <Card className="border-white/10 bg-white/50 backdrop-blur-xl dark:bg-white/[0.03]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-primary" />
                Scan Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {scanStages.map((item, index) => (
                <div key={item} className="flex items-center gap-3 rounded-md border border-white/10 bg-background/50 p-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">{index + 1}</div>
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {result && (
            <Card className="border-white/10 bg-white/50 backdrop-blur-xl dark:bg-white/[0.03]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lock className="h-5 w-5 text-emerald-400" />
                  Tech Signals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.summary.technologies.length ? result.summary.technologies.map((tech) => <Badge key={tech} variant="secondary">{tech}</Badge>) : <Badge variant="outline">No framework signal detected</Badge>}
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{result.summary.title || "No page title found."}</p>
              </CardContent>
            </Card>
          )}

          <Card className="border-white/10 bg-white/50 backdrop-blur-xl dark:bg-white/[0.03]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="h-5 w-5 text-muted-foreground" />
                Recent Scans
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {history.length ? history.map((item) => (
                <button key={`${item.url}-${item.scannedAt}`} onClick={() => setResult(item)} className="w-full rounded-md border border-white/10 bg-background/50 p-3 text-left transition-colors hover:bg-background">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-medium">{new URL(item.url).hostname}</span>
                    <Badge variant="outline">{item.healthScore}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(item.scannedAt).toLocaleString()}</p>
                </button>
              )) : <p className="text-sm text-muted-foreground">No scan history yet.</p>}
              {result && (
                <Button variant="outline" onClick={() => runScan(result.url)} disabled={isScanning} className="w-full gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Rescan Current Site
                </Button>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
