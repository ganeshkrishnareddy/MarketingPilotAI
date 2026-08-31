"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Target, Save, Loader2, UploadCloud, Paintbrush, Type, Mic, ThumbsUp, ThumbsDown, BookOpen } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { pb } from "@/lib/pocketbase"

const COLLECTION = "buyer_personas"

const fetchBrandKit = async () => {
  const result = await pb.collection(COLLECTION).getList(1, 1).catch(() => ({ items: [] }))
  return result.items?.[0] || null
}

const saveBrandKit = async (data: any) => {
  const existing = await pb.collection(COLLECTION).getList(1, 1).catch(() => ({ items: [] }))
  if (existing.items?.[0]) {
    return pb.collection(COLLECTION).update(existing.items[0].id, data)
  }
  return pb.collection(COLLECTION).create(data)
}

export default function BrandKitPage() {
  const queryClient = useQueryClient()
  const { data: brandKit, isLoading } = useQuery({
    queryKey: ["brandKit"],
    queryFn: fetchBrandKit,
    retry: false,
  })

  const { mutate, isPending } = useMutation({
    mutationFn: saveBrandKit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brandKit"] })
      toast.success("Brand Kit setup complete!")
    },
    onError: () => {
      toast.error("Failed to save Brand Kit.")
    }
  })

  const [formData, setFormData] = React.useState({
    primary_color: "#7C3AED",
    secondary_color: "#10B981",
    typography: "Inter",
    toneSlider: 50,
    doRules: "Use active voice\nBe concise and clear\nHighlight benefits over features",
    dontRules: "Don't use jargon\nAvoid aggressive sales pitches\nNo long paragraphs",
    writingSample: "Welcome to our platform! We're thrilled to have you onboard. Our tools are designed to simplify your workflow so you can focus on what matters most—growing your business."
  })

  React.useEffect(() => {
    if (brandKit) {
      setFormData({
        primary_color: brandKit.primary_color || "#7C3AED",
        secondary_color: brandKit.secondary_color || "#10B981",
        typography: brandKit.typography || "Inter",
        toneSlider: brandKit.toneSlider ?? 50,
        doRules: brandKit.doRules || "Use active voice\nBe concise and clear\nHighlight benefits over features",
        dontRules: brandKit.dontRules || "Don't use jargon\nAvoid aggressive sales pitches\nNo long paragraphs",
        writingSample: brandKit.writingSample || "Welcome to our platform! We're thrilled to have you onboard."
      })
    }
  }, [brandKit])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutate(formData)
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-bold font-outfit tracking-tight flex items-center gap-3">
            <Target className="h-10 w-10 text-primary" /> 
            Brand Identity Setup
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Train your AI marketing team on how your brand looks, feels, and sounds.
          </p>
        </div>
        <Button onClick={handleSubmit} disabled={isPending} className="bg-primary hover:bg-primary/90 text-md px-8 py-6 rounded-full shadow-lg shadow-primary/20">
          {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
          Save Brand Kit
        </Button>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        <div className="grid gap-8 md:grid-cols-2">
          
          {/* Visual Identity Column */}
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <Card className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)] relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Paintbrush className="h-5 w-5 text-primary"/> Visuals</CardTitle>
                  <CardDescription>Colors and logos to style your generated content.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Logo Upload */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Brand Logo</Label>
                    <div className="rounded-xl border-2 border-dashed border-slate-300 p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                      <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                         <UploadCloud className="h-7 w-7 text-primary" />
                      </div>
                      <p className="font-medium">Drag & drop or click to upload</p>
                      <p className="text-xs text-muted-foreground mt-1">High-res SVG or PNG recommended</p>
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primary_color" className="text-xs text-muted-foreground">Primary Color</Label>
                      <div className="flex items-center gap-3 p-2 rounded-lg border border-slate-200 bg-slate-50">
                        <Input 
                          type="color" 
                          id="primary_color" 
                          value={formData.primary_color}
                          onChange={handleChange}
                          className="w-10 h-10 p-0 border-0 rounded cursor-pointer"
                        />
                        <span className="text-sm font-mono font-medium">{formData.primary_color}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondary_color" className="text-xs text-muted-foreground">Secondary Color</Label>
                      <div className="flex items-center gap-3 p-2 rounded-lg border border-slate-200 bg-slate-50">
                        <Input 
                          type="color" 
                          id="secondary_color" 
                          value={formData.secondary_color}
                          onChange={handleChange}
                          className="w-10 h-10 p-0 border-0 rounded cursor-pointer"
                        />
                        <span className="text-sm font-mono font-medium">{formData.secondary_color}</span>
                      </div>
                    </div>
                  </div>

                  {/* Typography */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <Label htmlFor="typography" className="flex items-center gap-2"><Type className="h-4 w-4"/> Typography Family</Label>
                    <Input 
                      id="typography" 
                      placeholder="e.g. Inter, Outfit, Roboto" 
                      className="border-slate-200 bg-slate-50 h-12 text-lg text-slate-700"
                      value={formData.typography}
                      onChange={handleChange}
                    />
                  </div>

                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* AI Voice & Tone Column */}
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
              <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)] relative">
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Mic className="h-5 w-5 text-purple-400"/> Brand Voice</CardTitle>
                  <CardDescription>Train the AI on how to speak on your behalf.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  
                  {/* Tone Slider */}
                  <div className="space-y-5">
                    <div className="flex justify-between items-end">
                      <Label className="text-sm font-semibold">Tone Spectrum</Label>
                      <span className="text-xs text-muted-foreground font-medium bg-white/5 px-2 py-1 rounded">
                        {formData.toneSlider < 33 ? 'Professional & Corporate' : formData.toneSlider > 66 ? 'Casual & Witty' : 'Balanced & Friendly'}
                      </span>
                    </div>
                    <Slider 
                      defaultValue={[formData.toneSlider]} 
                      max={100} step={1}
                      onValueChange={(val: any) => setFormData(prev => ({...prev, toneSlider: Array.isArray(val) ? val[0] : val}))}
                      className="py-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground font-medium">
                      <span>Professional</span>
                      <span>Balanced</span>
                      <span>Casual</span>
                    </div>
                  </div>

                  {/* Do's and Don'ts */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-emerald-400"><ThumbsUp className="h-4 w-4"/> Always Do</Label>
                      <Textarea 
                        id="doRules"
                        value={formData.doRules}
                        onChange={handleChange}
                        className="bg-emerald-500/5 border-emerald-500/20 min-h-[100px] resize-none text-sm placeholder:text-emerald-500/30"
                        placeholder="e.g. Use emojis, Keep it short"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-rose-400"><ThumbsDown className="h-4 w-4"/> Never Do</Label>
                      <Textarea 
                        id="dontRules"
                        value={formData.dontRules}
                        onChange={handleChange}
                        className="bg-rose-500/5 border-rose-500/20 min-h-[100px] resize-none text-sm placeholder:text-rose-500/30"
                        placeholder="e.g. Avoid slang, Don't overpromise"
                      />
                    </div>
                  </div>

                  {/* AI Writing Sample */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <Label htmlFor="writingSample" className="flex items-center gap-2"><BookOpen className="h-4 w-4"/> Perfect Writing Sample</Label>
                    <p className="text-xs text-muted-foreground mb-2">Provide a paragraph that perfectly captures your brand voice. The AI will mimic this style.</p>
                    <Textarea 
                      id="writingSample"
                      value={formData.writingSample}
                      onChange={handleChange}
                      className="border-slate-200 bg-slate-50 min-h-[120px] text-sm leading-relaxed text-slate-700 focus-visible:ring-blue-400/40"
                      placeholder="Paste a successful email, post, or snippet here..."
                    />
                  </div>

                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </form>

    </div>
  )
}
