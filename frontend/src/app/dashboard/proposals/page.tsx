"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, IndianRupee, Sparkles, ShieldCheck } from "lucide-react";

const budgetLines = [
  {
    title: "Branding and visual identity",
    amount: "INR 2,000 - INR 3,000",
    why: "Logo placement, header styling, colors, and a premium first impression.",
  },
  {
    title: "Proposal layout and copy",
    amount: "INR 2,000 - INR 3,000",
    why: "Clear quotation structure, budget explanation, and launch justification.",
  },
  {
    title: "Starter product scope",
    amount: "INR 3,000 - INR 5,000",
    why: "Landing page direction, login shell, template view, and lead/import flow.",
  },
  {
    title: "Polish and review",
    amount: "INR 3,000 - INR 4,000",
    why: "Layout cleanup, consistency checks, and presentation-ready finishing.",
  },
];

export default function DashboardProposalsPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-inner backdrop-blur-md">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                Official quotation
              </Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                Lean starter budget
              </Badge>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              ProgVision quotation note
            </h1>
            <p className="text-muted-foreground text-lg max-w-3xl">
              This version explains why the logo appears in the header, how the budget is being used, and why the
              proposal stays below INR 15,000 for a focused launch starter package.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-sm font-semibold border border-amber-500/20 w-fit">
          <Clock className="w-4 h-4" /> Budget set to INR 10,000 - INR 15,000
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <IndianRupee className="w-5 h-5 text-primary" /> How we are spending this budget
            </CardTitle>
            <CardDescription>The quote is split across the parts that make the offer feel real and professional.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgetLines.map((line) => (
              <div key={line.title} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <h3 className="font-semibold text-base">{line.title}</h3>
                  <span className="text-sm font-semibold text-primary">{line.amount}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{line.why}</p>
              </div>
            ))}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm font-semibold text-primary">Total expected budget</p>
              <p className="mt-1 text-2xl font-bold">INR 10,000 - INR 15,000</p>
              <p className="mt-2 text-sm text-muted-foreground">
                This is the right range for a polished starter proposal, not the full production SaaS build.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <ShieldCheck className="w-5 h-5 text-primary" /> Why this is a smaller quote
              </CardTitle>
              <CardDescription>Focused launch, not full enterprise scope.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                The budget is intentionally lower because we are packaging the most visible launch pieces first:
                brand, proposal, and starter workflow structure.
              </p>
              <p>
                A bigger quote would be needed later for the full production SaaS with deeper CRM, automation,
                WhatsApp, email, ads, and API integrations.
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <CheckCircle2 className="w-5 h-5 text-primary" /> What this starter scope delivers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>- Professional proposal and pricing story</p>
              <p>- Brand-safe header and logo use</p>
              <p>- Clear launch budget for early approval</p>
              <p>- A base you can expand into the full product later</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
