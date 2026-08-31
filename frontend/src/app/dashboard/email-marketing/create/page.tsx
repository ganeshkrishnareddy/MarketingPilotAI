"use client"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Sparkles, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"

export default function CreateEmailCampaignPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [campaignName, setCampaignName] = useState("")
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [result, setResult] = useState("")

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSending(true)
    setResult("")
    try {
      const html = content
        .split(/\n{2,}/)
        .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
        .join("")
      const res = await fetch("/api/email/send-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          html,
          audience: user?.role === "admin" ? "all" : "client",
          clientId: user?.role === "client" ? user.id : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Send failed")
      setResult(`✅ Campaign "${campaignName}" sent to ${data.sentCount} lead${data.sentCount === 1 ? "" : "s"} from ${data.sender}.`)
      setTimeout(() => router.push("/dashboard/email-marketing"), 2000)
    } catch (err: any) {
      setResult(`❌ ${err.message || "Failed to send campaign"}`)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto min-h-screen pb-10">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/email-marketing">
          <Button variant="ghost" size="icon" className="h-10 w-10 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-outfit tracking-tight text-slate-900">Create New Campaign</h1>
          <p className="mt-1 text-sm text-slate-500">Design and send a real email broadcast to your leads via Zoho SMTP.</p>
        </div>
      </div>

      <form onSubmit={handleSend}>
        <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <CardHeader>
            <CardTitle className="text-slate-900">Campaign Details</CardTitle>
            <CardDescription className="text-slate-500">
              Emails go to {user?.role === "admin" ? "all leads" : "your leads"} using the platform sender ({process.env.NEXT_PUBLIC_EMAIL_FROM || "configured SMTP"}).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="campaignName">Campaign Name</Label>
              <Input id="campaignName" placeholder="e.g. Summer Sale Announcement" required value={campaignName} onChange={(e) => setCampaignName(e.target.value)} className="border-slate-200 bg-slate-50 text-slate-700" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject Line</Label>
              <Input id="subject" placeholder="Write a catchy subject..." required value={subject} onChange={(e) => setSubject(e.target.value)} className="border-slate-200 bg-slate-50 text-slate-700" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="content">Email Content</Label>
                <span className="text-[11px] text-slate-400">
                  Use {"{{first_name}}"} and {"{{company}}"} placeholders — they auto-fill per lead.
                </span>
              </div>
              <Textarea
                id="content"
                placeholder="Hi {{first_name}},&#10;&#10;We have a special offer for {{company}}..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[250px] border-slate-200 bg-slate-50 font-mono text-sm text-slate-700"
                required
              />
            </div>

            {result && (
              <div className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${result.startsWith("❌") ? "border-red-200 bg-red-50 text-red-600" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
                {result.startsWith("❌") ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
                {result}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button type="submit" disabled={isSending} className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Launch Campaign
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
