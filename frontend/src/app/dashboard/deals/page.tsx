"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Box, Sparkles, CheckCircle2, Clock } from "lucide-react";

export default function DealsPipelinePage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 shadow-inner backdrop-blur-md">
            <Box className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Deals Pipeline
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">This module is coming soon.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-sm font-semibold border border-amber-500/20">
             <Clock className="w-4 h-4" /> Coming Soon
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="col-span-1 md:col-span-2 border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="w-5 h-5 text-primary" /> Feature Overview
            </CardTitle>
            <CardDescription>What to expect when this module launches.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              This module is currently in active development. When completed, it will seamlessly integrate with your existing AI workflows and provide autonomous capabilities to enhance your business operations.
            </p>
            <div className="space-y-3 mt-6">
              {[
                "Deep Integration with AI Employees",
                "Automated Background Processing",
                "Real-time Analytics and Insights",
                "Full Customization and Controls"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                  <span className="text-foreground/90">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 border-white/10 bg-primary/5 shadow-xl backdrop-blur-xl border-primary/20">
          <CardHeader>
            <CardTitle>Join the Waitlist</CardTitle>
            <CardDescription>Get notified when this launches.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We are rolling out early access to our most active users. Click below to prioritize your account for the beta.
            </p>
            <Button className="w-full shadow-lg shadow-primary/20">Request Early Access</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
