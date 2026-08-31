'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { pb } from "@/lib/pocketbase";
import { Loader2, Send, Settings, Play } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";

export default function AIPlayground() {
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [temperature, setTemperature] = useState<number[]>([0.7]);
  const [maxTokens, setMaxTokens] = useState<number[]>([1024]);
  const [systemPrompt, setSystemPrompt] = useState<string>('You are a helpful AI assistant.');
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadModels() {
      try {
        const records = await pb.collection('ai_models').getFullList({
          sort: '-created',
        });
        setModels(records);
        if (records.length > 0) {
          setSelectedModel(records[0].id);
        }
      } catch (error) {
        console.error("Failed to load models:", error);
      }
    }
    loadModels();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!userPrompt.trim()) return;

    const newMessages = [...messages, { role: 'user' as const, content: userPrompt }];
    setMessages(newMessages);
    setUserPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemPrompt,
          userPrompt: newMessages[newMessages.length - 1].content,
          temperature: temperature[0],
          maxTokens: maxTokens[0],
          taskType: "Chat",
          modelId: selectedModel
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      const reader = response.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let done = false;
      let assistantText = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.substring(6).trim();
              if (data === '[DONE]') {
                done = true;
                break;
              }
              if (data) {
                // Try to parse if it's JSON format, else append raw data
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.choices && parsed.choices[0]?.delta?.content) {
                    assistantText += parsed.choices[0].delta.content;
                  } else if (parsed.text) {
                    assistantText += parsed.text;
                  } else {
                    assistantText += data; // fallback
                  }
                } catch (e) {
                  // Not JSON, assume it's raw text chunk
                  // handle literal newlines if needed, but usually raw SSE might just send characters
                  // If literal `\n` in text:
                  let unescaped = data.replace(/\\n/g, '\n');
                  // For safety let's just append
                  if (unescaped !== 'null' && unescaped !== 'undefined') {
                    assistantText += unescaped;
                  }
                }

                setMessages(prev => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last.role === 'assistant') {
                    last.content = assistantText;
                  }
                  return updated;
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error generating response. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 p-6">
      {/* Left Pane: Configuration */}
      <Card className="w-full md:w-1/3 flex flex-col h-full border-border bg-card text-card-foreground shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Settings className="w-5 h-5 text-primary" />
            Configuration
          </CardTitle>
          <CardDescription>Adjust the AI model parameters.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 space-y-6 overflow-y-auto">
          <div className="space-y-3">
            <Label>Model</Label>
            <Select value={selectedModel} onValueChange={(val) => val && setSelectedModel(val as string)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {models.map(model => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name || model.title || model.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Temperature</Label>
              <span className="text-sm text-muted-foreground">{temperature[0]}</span>
            </div>
            <Slider
              value={temperature}
              onValueChange={(val) => setTemperature(val as number[])}
              max={2}
              step={0.1}
              className="py-2"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Max Tokens</Label>
              <span className="text-sm text-muted-foreground">{maxTokens[0]}</span>
            </div>
            <Slider
              value={maxTokens}
              onValueChange={(val) => setMaxTokens(val as number[])}
              max={4096}
              step={64}
              className="py-2"
            />
          </div>

          <div className="space-y-3">
            <Label>System Prompt</Label>
            <Textarea
              className="min-h-[150px] resize-none"
              placeholder="Enter system instructions..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Right Pane: Chat / Execution */}
      <Card className="w-full md:w-2/3 flex flex-col h-[calc(100vh-100px)] md:h-full border-border bg-card shadow-sm">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Play className="w-5 h-5 text-primary" />
            Playground
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden relative">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4 pb-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground italic min-h-[200px]">
                  Send a message to start interacting with the AI...
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-muted/60 text-foreground border border-border/50'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                 <div className="flex justify-start">
                   <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-muted/60 text-foreground border border-border/50 flex items-center gap-2">
                     <Loader2 className="w-4 h-4 animate-spin text-primary" />
                     Thinking...
                   </div>
                 </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-card mt-auto">
            <div className="flex gap-2 items-end">
              <Textarea
                className="min-h-[60px] max-h-[150px] resize-none flex-1 rounded-xl"
                placeholder="Type your message..."
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button 
                onClick={handleSend} 
                disabled={isLoading || !userPrompt.trim()}
                className="h-[60px] px-6 rounded-xl shrink-0"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
