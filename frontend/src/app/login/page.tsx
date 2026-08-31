"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, KeyRound, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/auth";

const benefits = [
  "Connect brand data once and let AI keep working.",
  "Admins onboard clients; clients manage their own leads and marketing.",
  "Keep approvals, drafts, and automations in one workspace.",
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.status === "inactive") {
        throw new Error("This account has been deactivated. Contact your admin.");
      }
      router.push(user.role === "admin" ? "/dashboard/clients" : "/dashboard");
    } catch (err: any) {
      setError(err?.message?.includes("Failed to authenticate") ? "Invalid email or password." : err?.message || "Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.16),_transparent_30%),linear-gradient(180deg,_#070b17_0%,_#0b1020_100%)] px-6 py-10 text-white">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 backdrop-blur">
            <KeyRound className="h-4 w-4 text-cyan-300" />
            Secure access to Vision 360
          </div>
          <div className="space-y-4">
            <h1 className="max-w-xl text-5xl font-bold tracking-tight md:text-6xl">Sign in to your marketing command center.</h1>
            <p className="max-w-xl text-base leading-7 text-white/70 md:text-lg">
              Admins onboard clients. Clients upload leads and run email, WhatsApp, and AI voice campaigns — all in one workspace.
            </p>
          </div>

          <div className="space-y-3">
            {benefits.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />
                <p className="text-sm leading-6 text-white/75">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <Card className="border-white/10 bg-slate-950/70 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2">
              <img
                src="/brand/vision360-logo.png"
                alt="Vision 360 AI"
                className="h-9 w-auto rounded-lg object-contain"
              />
            </div>
            <CardTitle className="text-3xl">Welcome back</CardTitle>
            <CardDescription className="text-white/60">Sign in with your account to continue.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="h-11 border-white/10 bg-white/5 text-white placeholder:text-white/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="h-11 border-white/10 bg-white/5 text-white placeholder:text-white/30"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-cyan-400 text-sm font-medium text-slate-950 transition-colors hover:bg-cyan-300"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/65">
              Free AI options enabled: OpenRouter free models and OpenCode free models.
            </div>

            <p className="text-center text-sm text-white/55">
              New here? <Link href="/" className="text-cyan-300 hover:text-cyan-200">Return to landing page</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
