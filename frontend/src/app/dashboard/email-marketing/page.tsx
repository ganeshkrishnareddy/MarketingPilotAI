"use client"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Mail, Plus, Sparkles } from "lucide-react"

const campaigns = [
  { name: "Welcome Series - Email 1", sent: "1,245", openRate: "68.2%", clickRate: "14.5%", status: "Active" },
  { name: "Monthly Newsletter - July", sent: "45,200", openRate: "42.1%", clickRate: "5.2%", status: "Completed" },
  { name: "Abandoned Cart Reminder", sent: "3,100", openRate: "55.5%", clickRate: "22.4%", status: "Active" },
]

export default function EmailMarketingPage() {
  return (
    <div className="space-y-6 w-full min-w-0">
      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
        <div>
          <h1 className="text-3xl font-bold font-outfit tracking-tight flex items-center gap-2">
            <Mail className="h-8 w-8 text-primary" /> Email Marketing
          </h1>
          <p className="text-muted-foreground mt-2">Manage newsletters and automated email sequences.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/email-templates" className="inline-flex h-10 items-center justify-center rounded-md border border-white/10 bg-white/5 px-4 text-sm font-medium text-foreground transition-colors hover:bg-white/10">
            <Sparkles className="mr-2 h-4 w-4" />
            Template library
          </Link>
          <Link href="/dashboard/email-marketing/create">
            <Button className="bg-primary hover:bg-primary/90"><Plus className="mr-2 h-4 w-4" /> New Campaign</Button>
          </Link>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-card"><CardContent className="p-6"><p className="text-sm text-muted-foreground">Emails Sent</p><h3 className="text-2xl font-bold font-outfit mt-1">49.5K</h3></CardContent></Card>
        <Card className="glass-card"><CardContent className="p-6"><p className="text-sm text-muted-foreground">Avg. Open Rate</p><h3 className="text-2xl font-bold font-outfit mt-1">45.2%</h3></CardContent></Card>
        <Card className="glass-card"><CardContent className="p-6"><p className="text-sm text-muted-foreground">Avg. Click Rate</p><h3 className="text-2xl font-bold font-outfit mt-1">12.1%</h3></CardContent></Card>
        <Card className="glass-card"><CardContent className="p-6"><p className="text-sm text-muted-foreground">Unsubscribes</p><h3 className="text-2xl font-bold font-outfit mt-1">0.8%</h3></CardContent></Card>
      </div>

      <Card className="glass-panel">
        <CardHeader><CardTitle>Recent Campaigns</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent To</TableHead>
                <TableHead>Open Rate</TableHead>
                <TableHead>Click Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((c) => (
                <TableRow key={c.name}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell><span className={`text-xs font-medium px-2 py-1 rounded-full ${c.status === 'Active' ? 'text-emerald-500 bg-emerald-500/10' : 'text-blue-500 bg-blue-500/10'}`}>{c.status}</span></TableCell>
                  <TableCell>{c.sent}</TableCell>
                  <TableCell>{c.openRate}</TableCell>
                  <TableCell>{c.clickRate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
