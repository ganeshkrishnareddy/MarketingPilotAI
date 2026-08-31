"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bot, ArrowRight, Sparkles } from "lucide-react"

export default function BusinessOnboarding() {
  const [step, setStep] = React.useState(1)
  const totalSteps = 3

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps))
  const prevStep = () => setStep((s) => Math.max(s - 1, 1))

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold font-outfit tracking-tight">Business Profile</h1>
        <div className="text-sm text-muted-foreground">Step {step} of {totalSteps}</div>
      </div>

      <div className="relative h-2 w-full bg-muted rounded-full mb-8 overflow-hidden">
        <motion.div 
          className="absolute top-0 left-0 h-full bg-primary"
          initial={{ width: "33%" }}
          animate={{ width: `${(step / totalSteps) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <Card className="border-border/50 shadow-xl shadow-primary/5">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {step === 1 && (
              <>
                <CardHeader>
                  <CardTitle>The Basics</CardTitle>
                  <CardDescription>Tell us about your brand so our AI can understand your voice.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Business Name</Label>
                    <Input id="name" placeholder="e.g. Acme Corp" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input id="industry" placeholder="e.g. E-commerce, SaaS, Local Service" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website URL</Label>
                    <Input id="website" placeholder="https://..." />
                  </div>
                </CardContent>
              </>
            )}

            {step === 2 && (
              <>
                <CardHeader>
                  <CardTitle>Audience & Goals</CardTitle>
                  <CardDescription>Who are we talking to and what do you want to achieve?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="audience">Target Audience</Label>
                    <Input id="audience" placeholder="e.g. Millennials interested in fitness" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal">Primary Marketing Goal</Label>
                    <Input id="goal" placeholder="e.g. Increase brand awareness, drive sales" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="competitors">Top Competitors (Comma separated)</Label>
                    <Input id="competitors" placeholder="Competitor 1, Competitor 2" />
                  </div>
                </CardContent>
              </>
            )}

            {step === 3 && (
              <>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Let AI Take the Wheel</CardTitle>
                      <CardDescription>We have enough info to generate your entire strategy.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-6">
                  <p className="text-muted-foreground text-center mb-6">
                    Clicking "Analyze" will trigger our AI to deeply analyze your website, generate a SWOT analysis, map out buyer personas, and create your initial 30-day content calendar.
                  </p>
                </CardContent>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <CardFooter className="flex justify-between border-t border-border/50 pt-6">
          <Button variant="ghost" onClick={prevStep} disabled={step === 1}>
            Back
          </Button>
          {step < totalSteps ? (
            <Button onClick={nextStep} className="gap-2">
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button className="gap-2 group">
              <Bot className="h-4 w-4 group-hover:animate-bounce" />
              Analyze Business
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
