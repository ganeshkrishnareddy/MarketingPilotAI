"use client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Key, Plus, AlertTriangle } from "lucide-react"

const keys: { name: string; key: string; created: string; lastUsed: string }[] = [];

export default function ApiKeysPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-outfit tracking-tight flex items-center gap-2">
            <Key className="h-8 w-8 text-primary" /> API Keys
          </h1>
          <p className="text-muted-foreground mt-2">Manage programmatic access to your account.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90"><Plus className="mr-2 h-4 w-4" /> Generate New Key</Button>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500/90 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold">Keep your keys secure</p>
          <p>Never share your API keys in client-side code or public repositories. If a key is compromised, revoke it immediately.</p>
        </div>
      </div>

      <Card className="glass-panel">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key Name</TableHead>
                <TableHead>Secret Key</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((k) => (
                <TableRow key={k.key}>
                  <TableCell className="font-medium">{k.name}</TableCell>
                  <TableCell className="font-mono text-muted-foreground">{k.key}</TableCell>
                  <TableCell>{k.created}</TableCell>
                  <TableCell>{k.lastUsed}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">Revoke</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
