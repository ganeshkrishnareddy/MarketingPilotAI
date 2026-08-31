"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { MousePointer2, Plus, ArrowUpRight } from "lucide-react"

const campaigns = [
  { name: "Search - Summer Sale", status: "Active", budget: "$150/day", impressions: "12,450", ctr: "8.2%", conversions: 45 },
  { name: "Display - Retargeting", status: "Active", budget: "$50/day", impressions: "45,200", ctr: "1.1%", conversions: 12 },
  { name: "Search - Brand Terms", status: "Active", budget: "$25/day", impressions: "3,100", ctr: "14.5%", conversions: 89 },
]

export default function GoogleAdsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-outfit tracking-tight flex items-center gap-2">
            <MousePointer2 className="h-8 w-8 text-primary" /> Google Ads Manager
          </h1>
          <p className="text-muted-foreground mt-2">Manage your search and display campaigns.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90"><Plus className="mr-2 h-4 w-4" /> New Campaign</Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-card"><CardContent className="p-6"><p className="text-sm text-muted-foreground">Avg. Quality Score</p><h3 className="text-2xl font-bold font-outfit mt-1">8.4/10</h3></CardContent></Card>
        <Card className="glass-card"><CardContent className="p-6"><p className="text-sm text-muted-foreground">Avg. CPC</p><h3 className="text-2xl font-bold font-outfit mt-1">$1.24</h3></CardContent></Card>
        <Card className="glass-card"><CardContent className="p-6"><p className="text-sm text-muted-foreground">Total Conversions</p><h3 className="text-2xl font-bold font-outfit mt-1">146</h3></CardContent></Card>
      </div>

      <Card className="glass-panel">
        <CardHeader><CardTitle>Active Ad Groups</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Impressions</TableHead>
                <TableHead>CTR</TableHead>
                <TableHead>Conversions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((c) => (
                <TableRow key={c.name}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell><span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">{c.status}</span></TableCell>
                  <TableCell>{c.budget}</TableCell>
                  <TableCell>{c.impressions}</TableCell>
                  <TableCell>{c.ctr}</TableCell>
                  <TableCell>{c.conversions}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
