"use client"
import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart3, TrendingUp, Users, MousePointerClick, DollarSign, ArrowUpRight, Box } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { pb } from "@/lib/pocketbase"

const data = [
  { month: "Jan", reach: 12000, leads: 240, revenue: 3200 },
  { month: "Feb", reach: 19000, leads: 380, revenue: 5100 },
  { month: "Mar", reach: 15000, leads: 290, revenue: 4000 },
  { month: "Apr", reach: 24000, leads: 510, revenue: 7200 },
  { month: "May", reach: 21000, leads: 440, revenue: 6100 },
  { month: "Jun", reach: 29000, leads: 620, revenue: 8900 },
]

export default function AnalyticsPage() {
  const [counts, setCounts] = React.useState({ leads: 0, companies: 0, dealsValue: 0 })

  React.useEffect(() => {
    async function fetchCounts() {
      try {
        const [leadsRes, companiesRes, dealsRes] = await Promise.all([
          pb.collection('leads').getList(1, 1, { requestKey: null }).catch(() => ({ totalItems: 0 })),
          pb.collection('companies').getList(1, 1, { requestKey: null }).catch(() => ({ totalItems: 0 })),
          pb.collection('deals').getFullList({ requestKey: null }).catch(() => ([]))
        ])
        
        let totalValue = 0;
        if (Array.isArray(dealsRes)) {
            totalValue = dealsRes.reduce((acc, deal) => acc + (Number(deal.amount) || Number(deal.value) || 0), 0)
        }

        setCounts({
          leads: leadsRes.totalItems || 0,
          companies: companiesRes.totalItems || 0,
          dealsValue: totalValue
        })
      } catch (err) {
        console.error("Error fetching analytics data", err)
      }
    }
    fetchCounts()
  }, [])

  const kpis = [
    { title: "Total Leads", value: counts.leads.toLocaleString(), change: "—", icon: MousePointerClick, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Total Companies", value: counts.companies.toLocaleString(), change: "—", icon: Box, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Total Deals Value", value: `$${counts.dealsValue.toLocaleString()}`, change: "—", icon: DollarSign, color: "text-amber-500", bg: "bg-amber-500/10" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-outfit tracking-tight flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-primary" /> Analytics Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">Real-time performance across all your marketing channels.</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`h-10 w-10 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" />{kpi.change}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{kpi.title}</p>
              <h3 className="text-2xl font-bold font-outfit mt-1">{kpi.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Campaign Performance Over Time</CardTitle>
          <CardDescription>6-month trend of reach, leads, and estimated revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="reach" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#6b7280" tick={{ fill: "#6b7280", fontSize: 12 }} />
              <YAxis stroke="#6b7280" tick={{ fill: "#6b7280", fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "#0f0f14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
              <Area type="monotone" dataKey="reach" stroke="#7C3AED" strokeWidth={2} fill="url(#reach)" name="Reach" />
              <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} fill="url(#revenue)" name="Revenue ($)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
