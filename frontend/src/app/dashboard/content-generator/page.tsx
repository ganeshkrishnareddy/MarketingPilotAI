"use client"

import * as React from "react"
import { useMutation } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Loader2, Sparkles, Copy, Check } from "lucide-react"
import { toast } from "sonner"

const generateContent = async (data: any) => {
  const res = await fetch("/api/ai/free-tools", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      module: "content-creation",
      business: "ProgVision",
      audience: data.audience,
      goal: data.topic,
      channel: data.content_type,
      tone: data.tone,
      prompt: `Generate ${data.content_type} about ${data.topic}`,
    }),
  })
  if (!res.ok) throw new Error("Failed to generate content")
  return res.json()
}

export default function ContentGeneratorPage() {
  const [formData, setFormData] = React.useState({
    topic: "",
    content_type: "Blog Post",
    tone: "Professional",
    audience: "General Audience",
  })

  const [generatedText, setGeneratedText] = React.useState("")
  const [copied, setCopied] = React.useState(false)

  const { mutate, isPending } = useMutation({
    mutationFn: generateContent,
    onSuccess: (res) => {
      setGeneratedText(res.content)
      toast.success("Content generated successfully!")
    },
    onError: () => {
      toast.error("Failed to generate content. Please try again.")
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.topic) return toast.error("Please enter a topic.")
    mutate(formData)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success("Copied to clipboard")
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-outfit tracking-tight flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" /> Content Generator
        </h1>
        <p className="text-muted-foreground mt-2">
          Leverage AI to instantly generate high-quality marketing copy, blogs, and social media posts.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <form onSubmit={handleSubmit}>
            <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              <CardHeader>
                <CardTitle>Generation Settings</CardTitle>
                <CardDescription>Configure the AI parameters for your content.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="space-y-2">
                  <Label>Content Type</Label>
                  <Select 
                    value={formData.content_type} 
                    onValueChange={(val) => setFormData({...formData, content_type: val as string})}
                  >
                    <SelectTrigger className="border-slate-200 bg-slate-50">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Blog Post">Blog Post</SelectItem>
                      <SelectItem value="Social Media Caption">Social Media Caption</SelectItem>
                      <SelectItem value="Email Newsletter">Email Newsletter</SelectItem>
                      <SelectItem value="Ad Copy">Ad Copy</SelectItem>
                      <SelectItem value="Website Landing Page">Website Landing Page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Topic or Prompt</Label>
                  <Input 
                    placeholder="e.g. 5 ways AI is changing digital marketing" 
                    className="border-slate-200 bg-slate-50"
                    value={formData.topic}
                    onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tone of Voice</Label>
                    <Select 
                      value={formData.tone} 
                      onValueChange={(val) => setFormData({...formData, tone: val as string})}
                    >
                      <SelectTrigger className="border-slate-200 bg-slate-50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Professional">Professional</SelectItem>
                        <SelectItem value="Casual">Casual</SelectItem>
                        <SelectItem value="Witty">Witty</SelectItem>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Target Audience</Label>
                    <Input 
                      placeholder="e.g. Small business owners" 
                      className="border-slate-200 bg-slate-50"
                      value={formData.audience}
                      onChange={(e) => setFormData({...formData, audience: e.target.value})}
                    />
                  </div>
                </div>

              </CardContent>
              <CardFooter className="bg-white/5 border-t border-slate-100 px-6 py-4">
                <Button type="submit" disabled={isPending} className="w-full bg-primary hover:bg-primary/90">
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Generate Content
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>

        <div className="lg:col-span-7">
           <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)] h-full flex flex-col min-h-[500px]">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" /> Output Editor
                  </CardTitle>
                </div>
                {generatedText && (
                  <Button variant="ghost" size="sm" onClick={handleCopy} className="text-muted-foreground">
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    <span className="ml-2">{copied ? "Copied" : "Copy"}</span>
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-0 flex-1 relative">
                 {isPending ? (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/5 backdrop-blur-sm z-10">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                      <p className="text-sm text-muted-foreground animate-pulse">Generating your masterpiece...</p>
                   </div>
                 ) : !generatedText ? (
                   <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 p-8 text-center">
                     <FileText className="h-16 w-16 mb-4 opacity-50" />
                     <p>Your generated content will appear here.</p>
                   </div>
                 ) : (
                   <div className="p-6 h-full overflow-y-auto max-h-[600px] whitespace-pre-wrap font-inter text-sm leading-relaxed">
                     {generatedText}
                   </div>
                 )}
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
