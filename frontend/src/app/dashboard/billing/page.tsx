"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CreditCard, Download, CheckCircle2, Zap, BarChart3,
  Users, Shield, RefreshCcw, Star,
} from "lucide-react";

interface Invoice {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: "Paid" | "Pending";
}

const invoices: Invoice[] = [
  { id: "INV-2024-018", date: "Jun 1, 2024",  description: "Enterprise Plan – June 2024",  amount: "$299.00", status: "Paid"    },
  { id: "INV-2024-017", date: "May 1, 2024",  description: "Enterprise Plan – May 2024",   amount: "$299.00", status: "Paid"    },
  { id: "INV-2024-016", date: "Apr 1, 2024",  description: "Enterprise Plan – April 2024", amount: "$299.00", status: "Paid"    },
  { id: "INV-2024-015", date: "Mar 1, 2024",  description: "Enterprise Plan – March 2024", amount: "$299.00", status: "Paid"    },
  { id: "INV-2024-014", date: "Feb 1, 2024",  description: "Enterprise Plan – Feb 2024",   amount: "$299.00", status: "Paid"    },
  { id: "INV-2024-013", date: "Jan 1, 2024",  description: "Enterprise Plan – Jan 2024",   amount: "$299.00", status: "Pending" },
];

const planFeatures = [
  { icon: <Users className="h-4 w-4" />,     text: "Up to 25 team members" },
  { icon: <Zap className="h-4 w-4" />,       text: "Unlimited AI content generation" },
  { icon: <BarChart3 className="h-4 w-4" />, text: "Advanced analytics & reporting" },
  { icon: <RefreshCcw className="h-4 w-4" />,text: "All integrations included" },
  { icon: <Shield className="h-4 w-4" />,    text: "Priority support & SLA" },
  { icon: <Star className="h-4 w-4" />,      text: "Custom brand kit & white-labelling" },
];

export default function BillingPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = (id: string) => {
    setDownloading(id);
    setTimeout(() => setDownloading(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5">
          <CreditCard className="h-6 w-6 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Billing & Subscription</h1>
          <p className="text-sm text-slate-500">Manage your plan, payment method and invoices</p>
        </div>
      </div>

      {/* Current Plan Card */}
      <Card className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5" />
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            {/* Plan Info */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Current Plan
                </span>
                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  Annual billing
                </span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Enterprise Plan</h2>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-emerald-600">$299</span>
                  <span className="text-slate-500">/month</span>
                  <span className="ml-2 text-sm text-slate-400">· billed annually ($3,588/yr)</span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {planFeatures.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="text-emerald-600">{f.icon}</span>
                    {f.text}
                  </div>
                ))}
              </div>
              <div className="pt-1">
                <p className="text-xs text-slate-400">
                  Next billing date: <span className="font-medium text-slate-700">July 1, 2024</span>
                  &nbsp;·&nbsp; Renews automatically
                </p>
              </div>
            </div>
            {/* Actions */}
            <div className="flex flex-col gap-3 lg:min-w-48">
              <Button className="w-full gap-2 bg-emerald-600 text-white shadow-sm hover:bg-emerald-500">
                <Zap className="h-4 w-4" /> Upgrade Plan
              </Button>
              <Button variant="outline"
                className="w-full gap-2 border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
                <CreditCard className="h-4 w-4" /> Manage Payment
              </Button>
              <Button variant="ghost"
                className="w-full text-sm text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                Cancel Subscription
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "AI Generations Used", value: "8,241",   max: "Unlimited", color: "text-violet-600" },
          { label: "Team Members",         value: "6",       max: "25 seats",  color: "text-blue-600"   },
          { label: "Campaigns Active",     value: "14",      max: "Unlimited", color: "text-emerald-600"},
          { label: "API Calls This Month", value: "42,890",  max: "500,000",   color: "text-amber-600"  },
        ].map((s) => (
          <Card key={s.label} className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className={`mt-1 text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="mt-0.5 text-xs text-slate-400">of {s.max}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Invoices Table */}
      <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <CardHeader className="border-b border-slate-100 pb-3">
          <CardTitle className="text-base text-slate-900">Invoice History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-3 text-left font-medium text-slate-500">Invoice</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Description</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
                  <th className="px-6 py-3 text-right font-medium text-slate-500">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/60">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{inv.id}</td>
                    <td className="px-4 py-4 text-slate-400">{inv.date}</td>
                    <td className="px-4 py-4 text-slate-600">{inv.description}</td>
                    <td className="px-4 py-4 font-semibold text-slate-800">{inv.amount}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${inv.status === "Paid" ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "border border-amber-200 bg-amber-50 text-amber-700"}`}>
                        {inv.status === "Paid" && <CheckCircle2 className="h-3 w-3" />}
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm"
                        onClick={() => handleDownload(inv.id)}
                        className="gap-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700">
                        <Download className="h-3.5 w-3.5" />
                        {downloading === inv.id ? "Downloading…" : "Download"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
