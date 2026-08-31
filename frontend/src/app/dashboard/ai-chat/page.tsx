"use client"

import * as React from "react"
import { useMutation } from "@tanstack/react-query"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, User, Send, Loader2, MessageSquare } from "lucide-react"
import { toast } from "sonner"

const sendChatMessage = async (messages: any[]) => {
  const res = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  })
  if (!res.ok) throw new Error("Failed to send message")
  return res.json()
}

export default function AiChatPage() {
  const [messages, setMessages] = React.useState<{role: string, content: string}[]>([
    { role: "assistant", content: "Hello! I am MarketingPilot AI. How can I help you optimize your marketing strategy today?" }
  ])
  const [input, setInput] = React.useState("")
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const { mutate, isPending } = useMutation({
    mutationFn: sendChatMessage,
    onSuccess: (res) => {
      setMessages(prev => [...prev, { role: "assistant", content: res.content }])
    },
    onError: () => {
      toast.error("Failed to communicate with AI.")
      // Remove the optimistic user message if it failed
      setMessages(prev => prev.slice(0, -1))
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isPending) return

    const newMessages = [...messages, { role: "user", content: input }]
    setMessages(newMessages)
    setInput("")
    
    // Send to backend (only send the history without the first greeting if we want to save tokens, 
    // but sending all is fine for context)
    mutate(newMessages)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold font-outfit tracking-tight flex items-center gap-2">
          <MessageSquare className="h-8 w-8 text-primary" /> AI Marketing Assistant
        </h1>
        <p className="text-muted-foreground mt-2">
          Chat with your dedicated AI copilot to brainstorm ideas, analyze metrics, and generate strategies.
        </p>
      </div>

      <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex-1 flex flex-col overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            AI Assistant is Online
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 overflow-y-auto" ref={scrollRef}>
          <div className="flex flex-col gap-4 p-6">
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                <div className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center ${
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-white/10"
                }`}>
                  {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
                </div>
                <div className={`rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${
                  msg.role === "user" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-white/5 border border-slate-100 text-foreground"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isPending && (
              <div className="flex gap-3 max-w-[85%] mr-auto">
                <div className="h-8 w-8 shrink-0 rounded-full bg-white/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="rounded-2xl px-4 py-3 bg-white/5 border border-slate-100 flex items-center gap-2">
                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }}/>
                    <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }}/>
                    <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }}/>
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="bg-black/20 border-t border-slate-100 p-4">
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <Input 
              placeholder="Ask me anything about marketing..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="bg-white/5 border-white/10 flex-1 focus-visible:ring-primary/50"
              disabled={isPending}
            />
            <Button type="submit" disabled={isPending || !input.trim()} className="bg-primary hover:bg-primary/90 shrink-0 h-10 w-10 p-0 rounded-full">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
