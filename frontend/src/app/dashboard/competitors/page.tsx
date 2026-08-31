"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Users, Loader2, Plus, Globe, Search, Trash2, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { pb } from "@/lib/pocketbase"

const COLLECTION = "competitors_workspace"

const fetchCompetitors = async () => {
  const result = await pb.collection(COLLECTION).getFullList({ sort: "-created" }).catch(() => [])
  return result
}

const addCompetitor = async (data: any) => {
  return pb.collection(COLLECTION).create(data)
}

export default function CompetitorsPage() {
  const queryClient = useQueryClient()
  const { data: competitors = [], isLoading } = useQuery({
    queryKey: ["competitors"],
    queryFn: fetchCompetitors,
    retry: false,
  })

  const { mutate: addMutate, isPending } = useMutation({
    mutationFn: addCompetitor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitors"] })
      setNewCompetitor("")
      toast.success("Competitor added for tracking.")
    },
    onError: () => {
      toast.error("Failed to add competitor.")
    }
  })

  const [newCompetitor, setNewCompetitor] = React.useState("")
  const [search, setSearch] = React.useState("")

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCompetitor.trim()) return
    addMutate({ url: newCompetitor })
  }

  const filteredCompetitors = competitors.filter((c: any) => 
    c.url?.toLowerCase().includes(search.toLowerCase()) ||
    c.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-outfit tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" /> Competitor Tracking
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor your top competitors to generate insights and better AI strategies.
          </p>
        </div>
        
        <form onSubmit={handleAdd} className="flex gap-2 w-full md:w-auto">
          <Input 
            placeholder="Competitor URL (e.g. apple.com)" 
            value={newCompetitor}
            onChange={(e) => setNewCompetitor(e.target.value)}
            className="w-full md:w-64 border-slate-200 bg-slate-50"
          />
          <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90 shrink-0">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            Track
          </Button>
        </form>
      </div>

      <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div>
            <CardTitle>Tracked Competitors</CardTitle>
            <CardDescription>AI periodically analyzes these websites.</CardDescription>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search competitors..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64 pl-9 border-slate-200 bg-slate-50 h-8 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="border-slate-100 hover:bg-transparent">
                <TableHead>Company</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>AI Status</TableHead>
                <TableHead>Last Scanned</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : filteredCompetitors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No competitors tracked yet. Add one above!
                  </TableCell>
                </TableRow>
              ) : (
                filteredCompetitors.map((comp: any) => (
                  <TableRow key={comp.id} className="border-slate-100 hover:bg-white/5 transition-colors">
                    <TableCell className="font-medium flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      </div>
                      {comp.name || "Unknown"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{comp.url}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-500">
                        Analyzed
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {comp.last_scanned ? new Date(comp.last_scanned).toLocaleDateString() : "Just now"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
