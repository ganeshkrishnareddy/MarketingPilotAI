"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion"
import {
  ArrowRight,
  ChevronRight,
  Play,
  Zap,
  Globe,
  BarChart3,
  Users,
  Mail,
  Share2,
  Search,
  Workflow,
  Shield,
  Check,
  Menu,
  X,
  Sparkles,
  Bot,
  Target,
  TrendingUp,
  MessageSquare,
  Calendar,
  FileText,
  Eye,
  Brain,
  Cpu,
  Activity,
  Database,
  Settings,
  Lock,
  Clock,
  ArrowUpRight,
} from "lucide-react"
import { ParticleField } from "@/components/landing/particle-field"
import { OrbitalCore } from "@/components/landing/orbital-core"
import { GlassCard3D } from "@/components/landing/glass-card-3d"

/* ─── DATA ─────────────────────────────────────────────── */

const features = [
  {
    icon: FileText,
    title: "AI Content",
    desc: "Generate campaigns, social posts, blogs, emails and creative briefs instantly.",
    gradient: "from-cyan-400 to-blue-500",
  },
  {
    icon: Search,
    title: "AI SEO",
    desc: "Analyze websites, identify opportunities and create actionable SEO strategies.",
    gradient: "from-violet-400 to-purple-500",
  },
  {
    icon: Target,
    title: "AI Advertising",
    desc: "Plan, create and optimize Meta and Google advertising workflows.",
    gradient: "from-blue-400 to-indigo-500",
  },
  {
    icon: Share2,
    title: "Social Media",
    desc: "Plan, generate, schedule and analyze social content across platforms.",
    gradient: "from-sky-400 to-cyan-500",
  },
  {
    icon: Users,
    title: "CRM & Leads",
    desc: "Capture, qualify, score and follow up with leads automatically.",
    gradient: "from-indigo-400 to-violet-500",
  },
  {
    icon: Workflow,
    title: "Business Automation",
    desc: "Connect workflows, triggers, AI employees and business processes.",
    gradient: "from-purple-400 to-pink-500",
  },
]

const aiEmployees = [
  { name: "CEO AI", role: "Executive Strategy", capabilities: "Business planning, goal setting, team coordination", status: "Ready" },
  { name: "Marketing Manager", role: "Campaign Strategy", capabilities: "Plans campaigns, analyzes performance, coordinates content", status: "Working" },
  { name: "Content Strategist", role: "Content Planning", capabilities: "Creates content calendars, writes copy, optimizes messaging", status: "Ready" },
  { name: "SEO Specialist", role: "Search Optimization", capabilities: "Analyzes rankings, identifies keywords, builds strategies", status: "Analyzing" },
  { name: "Sales Manager", role: "Pipeline Management", capabilities: "Qualifies leads, manages deals, forecasts revenue", status: "Ready" },
  { name: "Social Media Manager", role: "Social Strategy", capabilities: "Schedules posts, manages engagement, tracks metrics", status: "Ready" },
  { name: "Performance Analyst", role: "Data Intelligence", capabilities: "Tracks KPIs, generates reports, identifies trends", status: "Ready" },
  { name: "Customer Success AI", role: "Client Relations", capabilities: "Manages onboarding, handles queries, improves retention", status: "Ready" },
]

const workflowSteps = [
  "Business Goal",
  "AI Planning",
  "Research",
  "Content",
  "SEO",
  "Campaign",
  "CRM",
  "Follow-up",
  "Analytics",
]

const automationFlows = [
  {
    title: "New Lead",
    steps: ["AI Qualification", "CRM Update", "Personalized Email", "Follow-up Task", "Analytics"],
  },
  {
    title: "Website Scan",
    steps: ["SEO Analysis", "Content Recommendations", "Campaign Ideas", "Priority Report"],
  },
  {
    title: "New Customer",
    steps: ["Welcome Email", "CRM Update", "Onboarding Workflow", "Success Check-in"],
  },
]

const pricingPlans = [
  { name: "Starter", price: "Free", desc: "For individuals exploring AI marketing", features: ["1 AI employee", "Basic content generation", "Email integration", "Community support"], cta: "Start Free", popular: false },
  { name: "Growth", price: "Coming Soon", desc: "For growing businesses", features: ["5 AI employees", "Full content suite", "CRM & automation", "WhatsApp & email", "Priority support"], cta: "Get Notified", popular: true },
  { name: "Agency", price: "Contact Sales", desc: "For agencies managing multiple clients", features: ["Unlimited AI employees", "Multi-client workspace", "White-label options", "API access", "Dedicated support"], cta: "Contact Sales", popular: false },
  { name: "Enterprise", price: "Custom", desc: "For larger teams with custom needs", features: ["Custom AI models", "On-premise deployment", "SLA guarantees", "Custom integrations", "Dedicated CSM"], cta: "Contact Us", popular: false },
]

const integrations = ["Meta", "Google", "Instagram", "WhatsApp", "Gmail", "Shopify", "WordPress"]

/* ─── MAIN PAGE ────────────────────────────────────────── */

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 })

  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95])

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleMouse = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 20)
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 20)
    }
    window.addEventListener("mousemove", handleMouse)
    return () => window.removeEventListener("mousemove", handleMouse)
  }, [mouseX, mouseY])

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#040810] text-white">
      {/* Background layers */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {/* Deep atmospheric glow */}
        <div className="absolute left-1/2 top-0 h-[800px] w-[1200px] -translate-x-1/2 bg-gradient-to-b from-cyan-500/[0.04] via-blue-600/[0.02] to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-[600px] w-[800px] -translate-x-1/2 bg-gradient-to-t from-violet-600/[0.03] to-transparent blur-3xl" />
        {/* Subtle grain */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {mounted && <ParticleField />}

      {/* ═══════ NAVBAR ═══════ */}
      <Navbar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      {/* ═══════ HERO ═══════ */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pt-24 pb-16"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8 text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-cyan-400">
              AI-Native Marketing Operating System
            </span>
          </div>

          <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl lg:text-8xl">
            Your entire marketing
            <br />
            engine.
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              Powered by AI.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-400 md:text-lg">
            Connect your brand once, then let AI plan, create, automate and optimize your marketing from one intelligent workspace.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(56,189,248,0.25)] transition-all hover:shadow-[0_0_40px_rgba(56,189,248,0.35)]"
            >
              Start Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white/80 transition-all hover:border-white/20 hover:bg-white/10"
            >
              Explore Platform
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[11px] text-slate-500">
            <span>No credit card required</span>
            <span className="h-1 w-1 rounded-full bg-slate-700" />
            <span>Free AI models available</span>
            <span className="h-1 w-1 rounded-full bg-slate-700" />
            <span>Setup in minutes</span>
          </div>
        </motion.div>

        {/* 3D Orbital Core */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="relative z-10"
        >
          <OrbitalCore mouseX={springX.get()} mouseY={springY.get()} />
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="h-5 w-3 rounded-full border border-white/20 p-1">
            <motion.div
              className="mx-auto h-1.5 w-1 rounded-full bg-white/40"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </motion.section>

      {/* ═══════ TRUST / INTEGRATIONS ═══════ */}
      <section className="relative z-10 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="mb-8 text-center text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            Connect the tools your business already uses
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {integrations.map((name, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4, scale: 1.05 }}
                className="flex h-16 w-28 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm md:h-18 md:w-32"
              >
                <span className="text-sm font-medium text-slate-400">{name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FEATURES ═══════ */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Platform
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
              One intelligence layer for
              <br className="hidden md:block" />
              every growth function.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <GlassCard3D key={f.title} delay={i * 0.1}>
                <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} shadow-lg`}>
                  <f.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">{f.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{f.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-xs text-cyan-400/80">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>AI Active</span>
                </div>
              </GlassCard3D>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ AI EMPLOYEES ═══════ */}
      <section className="relative z-10 py-24">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.03] blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
              AI Workforce
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
              Give your business a team of
              <br className="hidden md:block" />
              AI employees.
            </h2>
          </div>

          {/* Central hub + orbiting cards */}
          <div className="relative mx-auto mb-12 flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-600/20 blur-xl" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-cyan-400/20 bg-[#0a1020] shadow-[0_0_40px_rgba(56,189,248,0.15)]">
              <Brain className="h-8 w-8 text-cyan-400" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {aiEmployees.map((emp, i) => (
              <GlassCard3D key={emp.name} delay={i * 0.07} className="relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{emp.name}</h4>
                    <p className="mt-0.5 text-[11px] text-cyan-400/80">{emp.role}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        emp.status === "Working"
                          ? "bg-amber-400"
                          : emp.status === "Analyzing"
                            ? "bg-violet-400"
                            : "bg-emerald-400"
                      }`}
                    />
                    <span className="text-[10px] text-slate-500">{emp.status}</span>
                  </div>
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-slate-500">{emp.capabilities}</p>
                {/* Decorative line */}
                <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent" />
              </GlassCard3D>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/dashboard/ai-employees"
              className="inline-flex items-center gap-2 text-sm font-medium text-cyan-400 transition-colors hover:text-cyan-300"
            >
              Meet Your AI Team <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ WORKFLOW PIPELINE ═══════ */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
              Autonomous Workflow
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
              From idea to execution —
              <br className="hidden md:block" />
              automatically.
            </h2>
          </div>

          {/* Vertical pipeline on mobile, horizontal on desktop */}
          <div className="flex flex-col items-center gap-0 md:flex-row md:justify-center md:gap-0">
            {workflowSteps.map((step, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center"
              >
                <div className="group relative">
                  <motion.div
                    whileHover={{ scale: 1.08, y: -2 }}
                    className="flex h-16 w-24 flex-col items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md md:h-14 md:w-20"
                  >
                    <span className="px-1 text-center text-[10px] font-semibold text-white/90">
                      {step}
                    </span>
                  </motion.div>
                </div>
                {i < workflowSteps.length - 1 && (
                  <div className="flex h-8 w-8 items-center justify-center md:h-px md:w-6">
                    <ChevronRight className="h-4 w-4 rotate-90 text-cyan-500/40 md:rotate-0" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <p className="mt-10 text-center text-sm text-slate-500">
            Turn a business goal into an executable workflow. V360 AI coordinates specialized AI employees and tools while keeping you in control.
          </p>
        </div>
      </section>

      {/* ═══════ WEBSITE INTELLIGENCE ═══════ */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Website Intelligence
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
              Turn any website into
              <br className="hidden md:block" />
              a growth plan.
            </h2>
          </div>

          <GlassCard3D hover={false} className="mx-auto max-w-3xl">
            <div className="space-y-4">
              {/* URL input mockup */}
              <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                <Globe className="h-4 w-4 text-cyan-400" />
                <span className="text-sm text-slate-500">Enter website URL...</span>
                <ArrowRight className="ml-auto h-4 w-4 text-cyan-400" />
              </div>

              {/* Analysis steps */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                {["SEO", "Performance", "Content", "Technical", "Opportunities"].map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-2 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2"
                  >
                    <Check className="h-3 w-3 text-cyan-400" />
                    <span className="text-[11px] text-slate-400">{item}</span>
                  </motion.div>
                ))}
              </div>

              {/* Result */}
              <div className="rounded-xl border border-cyan-500/10 bg-cyan-500/[0.03] p-4">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-semibold text-white">AI Growth Plan Generated</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Comprehensive analysis with actionable recommendations for SEO, content, performance and growth.
                </p>
              </div>
            </div>
          </GlassCard3D>

          <div className="mt-8 text-center">
            <Link
              href="/dashboard/ai-tools"
              className="inline-flex items-center gap-2 text-sm font-medium text-cyan-400 transition-colors hover:text-cyan-300"
            >
              Analyze a Website <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ MARKETING COMMAND CENTER ═══════ */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
              Command Center
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
              Marketing Command Center
            </h2>
            <p className="mt-4 text-sm text-slate-400">Your marketing hub, powered by AI. Illustrative workspace.</p>
          </div>

          {/* Layered UI panels */}
          <div className="relative mx-auto max-w-4xl" style={{ perspective: "1200px" }}>
            {/* Background panel */}
            <motion.div
              initial={{ opacity: 0, rotateX: 5 }}
              whileInView={{ opacity: 1, rotateX: 2 }}
              viewport={{ once: true }}
              className="absolute inset-x-4 top-4 bottom-0 rounded-2xl border border-white/[0.04] bg-white/[0.01] backdrop-blur-sm md:inset-x-8 md:top-6"
            />

            {/* Main panel */}
            <GlassCard3D hover={false} className="relative z-10">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/60" />
                <div className="h-3 w-3 rounded-full bg-amber-500/60" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/60" />
                <span className="ml-2 text-xs text-slate-500">V360 AI — Marketing Overview</span>
              </div>

              <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
                {["Content", "SEO", "Social", "Ads", "CRM", "Automation", "Analytics", "Approvals"].map(
                  (m) => (
                    <div
                      key={m}
                      className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-3 text-center"
                    >
                      <p className="text-[10px] text-slate-500">{m}</p>
                      <p className="mt-1 text-sm font-bold text-white">—</p>
                    </div>
                  )
                )}
              </div>

              <div className="mt-4 rounded-lg border border-white/[0.05] bg-white/[0.02] p-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                  <span className="text-xs font-medium text-white">AI Recommendations</span>
                </div>
                <div className="mt-2 space-y-1.5">
                  {["Content strategy opportunity detected", "SEO keywords ready for targeting", "Automation workflow suggested"].map((r) => (
                    <div key={r} className="flex items-center gap-2 text-[11px] text-slate-400">
                      <div className="h-1 w-1 rounded-full bg-violet-400" />
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard3D>
          </div>
        </div>
      </section>

      {/* ═══════ AUTONOMOUS MARKETING ═══════ */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
              Always On
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
              Marketing that keeps moving
              <br className="hidden md:block" />
              while you sleep.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {automationFlows.map((flow, fi) => (
              <GlassCard3D key={flow.title} delay={fi * 0.1}>
                <h4 className="mb-4 text-sm font-bold text-white">{flow.title}</h4>
                <div className="space-y-2">
                  {flow.steps.map((step, si) => (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: fi * 0.1 + si * 0.08 }}
                      className="flex items-center gap-2"
                    >
                      <div className="flex h-5 w-5 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-[9px] text-slate-500">
                        {si + 1}
                      </div>
                      <span className="text-[11px] text-slate-400">{step}</span>
                    </motion.div>
                  ))}
                </div>
              </GlassCard3D>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ HUMAN CONTROL ═══════ */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
              Autonomous when you want.
              <br />
              <span className="text-slate-500">Controlled when you need.</span>
            </h2>
          </div>

          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center md:gap-0">
            {["AI Proposes", "Human Reviews", "Approve", "AI Executes", "Activity Logged"].map(
              (step, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className="flex items-center"
                >
                  <div className="flex h-16 w-28 flex-col items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md">
                    <span className="text-[11px] font-semibold text-white/90">{step}</span>
                  </div>
                  {i < 4 && (
                    <div className="hidden h-px w-6 bg-gradient-to-r from-cyan-500/30 to-transparent md:block" />
                  )}
                </motion.div>
              )
            )}
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {["Approval Center", "Activity Logs", "Audit Trail", "Permissions", "AI Controls"].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
              >
                <Shield className="h-3 w-3 text-cyan-400" />
                <span className="text-[11px] text-slate-400">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ ANALYTICS ═══════ */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Analytics
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
              Every metric. One view.
            </h2>
            <p className="mt-3 text-sm text-slate-500">Illustrative dashboard</p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { icon: Users, label: "Leads" },
              { icon: TrendingUp, label: "Conversions" },
              { icon: Target, label: "Campaigns" },
              { icon: FileText, label: "Content" },
              { icon: Search, label: "SEO Health" },
              { icon: Cpu, label: "AI Tasks" },
              { icon: Workflow, label: "Automations" },
              { icon: BarChart3, label: "Revenue" },
            ].map((m, i) => (
              <GlassCard3D key={m.label} delay={i * 0.06} className="text-center">
                <m.icon className="mx-auto mb-2 h-5 w-5 text-cyan-400/60" />
                <p className="text-[11px] text-slate-400">{m.label}</p>
                <p className="mt-1 text-lg font-bold text-white">—</p>
              </GlassCard3D>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ PRICING ═══════ */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
              Pricing
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
              Simple, transparent pricing.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {pricingPlans.map((plan, i) => (
              <GlassCard3D key={plan.name} delay={i * 0.08} className={`relative ${plan.popular ? "border-cyan-500/20 shadow-[0_0_30px_rgba(56,189,248,0.08)]" : ""}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-0.5 text-[10px] font-bold text-white">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <div className="mt-2 text-2xl font-bold text-white">{plan.price}</div>
                <p className="mt-1 text-xs text-slate-500">{plan.desc}</p>
                <div className="my-4 h-px bg-white/[0.06]" />
                <ul className="mb-6 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[11px] text-slate-400">
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-cyan-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`block w-full rounded-lg py-2.5 text-center text-xs font-semibold transition-all ${
                    plan.popular
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(56,189,248,0.2)]"
                      : "border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                  }`}
                >
                  {plan.cta}
                </Link>
              </GlassCard3D>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FINAL CTA ═══════ */}
      <section className="relative z-10 py-32">
        {/* Glow behind */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.04] blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
            Build a marketing system
            <br />
            that works for
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              {" "}you.
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base text-slate-400">
            Connect your business once. Let V360 AI plan, create, automate and optimize the work.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-sm font-semibold text-white shadow-[0_0_30px_rgba(56,189,248,0.25)] transition-all hover:shadow-[0_0_50px_rgba(56,189,248,0.35)]"
            >
              Start Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-white/80 transition-all hover:border-white/20 hover:bg-white/10"
            >
              Book a Demo
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="relative z-10 border-t border-white/[0.05] bg-[#040810]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 md:grid-cols-5">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2">
                <img src="/brand/vision360-logo.png" alt="V360 AI" className="h-8 w-auto object-contain" style={{ filter: "brightness(1.2) contrast(1.1)" }} />
              </Link>
              <p className="mt-3 max-w-xs text-xs leading-relaxed text-slate-500">
                AI-powered marketing and business automation.
              </p>
            </div>

            {/* Links */}
            {[
              {
                title: "Platform",
                links: ["AI Marketing", "AI Employees", "CRM", "Automation", "Analytics"],
              },
              {
                title: "Solutions",
                links: ["Startups", "SMBs", "Agencies", "Enterprise"],
              },
              {
                title: "Resources",
                links: ["Documentation", "Help Center", "Blog", "Guides"],
              },
              {
                title: "Company",
                links: ["About", "Contact", "Careers", "Security"],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {col.title}
                </h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <span className="text-xs text-slate-500 transition-colors hover:text-slate-300 cursor-pointer">
                        {link}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.05] pt-8 md:flex-row">
            <p className="text-[11px] text-slate-600">
              © 2026 V360 AI Agency. All rights reserved.
            </p>
            <div className="flex gap-6">
              {["Privacy", "Terms", "Cookies"].map((item) => (
                <span key={item} className="text-[11px] text-slate-600 hover:text-slate-400 cursor-pointer">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ─── NAVBAR ────────────────────────────────────────────── */

function Navbar({
  mobileMenuOpen,
  setMobileMenuOpen,
}: {
  mobileMenuOpen: boolean
  setMobileMenuOpen: (v: boolean) => void
}) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const links = [
    { label: "Platform", href: "#features" },
    { label: "Solutions", href: "#features" },
    { label: "AI Employees", href: "#ai-employees" },
    { label: "Automations", href: "#workflow" },
    { label: "Pricing", href: "#pricing" },
  ]

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/[0.05] bg-[#040810]/80 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src="/brand/vision360-logo.png"
            alt="V360 AI"
            className="h-8 w-auto object-contain"
            style={{ filter: "brightness(1.3) contrast(1.1)" }}
          />
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-[13px] text-slate-400 transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="text-[13px] text-slate-400 transition-colors hover:text-white"
          >
            Sign In
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-4 py-2 text-[13px] font-medium text-white transition-all hover:bg-white/15"
          >
            Get Started <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 md:hidden"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-white/[0.05] bg-[#040810]/95 px-6 py-4 backdrop-blur-xl md:hidden"
        >
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm text-slate-400"
            >
              {l.label}
            </a>
          ))}
          <div className="mt-4 flex gap-3">
            <Link href="/login" className="text-sm text-slate-400">
              Sign In
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white"
            >
              Get Started
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  )
}
