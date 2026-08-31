"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Workflow,
  Mic,
  MessageCircle,
  Camera,
  Mail,
  Share2,
  BarChart3,
  CalendarDays,
  Receipt,
  Contact,
  UserCog,
  Sparkles,
  Settings,
  LifeBuoy,
  Bell,
  HelpCircle,
  Plus,
  ChevronDown,
  LogOut,
  ShieldCheck,
  Building2,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GlobalCommandPalette } from "@/components/global-command-palette"
import { useAuth, logout } from "@/lib/auth"

const navigationItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
  { title: "CRM", icon: Users, url: "/dashboard/crm" },
  { title: "Automation", icon: Workflow, url: "/dashboard/workflows" },
  { title: "AI Voice Agent", icon: Mic, url: "/dashboard/voice-ai" },
  { title: "WhatsApp Chatbot", icon: MessageCircle, url: "/dashboard/whatsapp-chatbot" },
  { title: "Instagram DM", icon: Camera, url: "/dashboard/instagram-automation" },
  { title: "Email Marketing", icon: Mail, url: "/dashboard/email-marketing" },
  { title: "Social Media", icon: Share2, url: "/dashboard/social-media" },
  { title: "Analytics", icon: BarChart3, url: "/dashboard/analytics" },
  { title: "Appointments", icon: CalendarDays, url: "/dashboard/appointment-booking" },
  { title: "Invoices & Billing", icon: Receipt, url: "/dashboard/billing" },
  { title: "Clients", icon: Building2, url: "/dashboard/clients", adminOnly: true },
  { title: "Team Management", icon: UserCog, url: "/dashboard/team", adminOnly: true },
  { title: "AI Tools", icon: Sparkles, url: "/dashboard/ai-employees" },
  { title: "Settings", icon: Settings, url: "/dashboard/ai-settings" },
  { title: "Support", icon: LifeBuoy, url: "/dashboard/chatbot" },
]

/** Routes only admins may open. */
const ADMIN_ONLY_PATHS = ["/dashboard/clients", "/dashboard/team", "/dashboard/api-keys", "/dashboard/admin"];

export function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useAuth()

  // Auth + RBAC guard
  React.useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "admin" && ADMIN_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
      router.replace("/dashboard");
    }
  }, [loading, user, pathname, router]);

  const isActive = (url: string) => pathname === url || (url !== "/dashboard" && pathname.startsWith(`${url}/`))
  const currentTitle = navigationItems.find((item) => isActive(item.url))?.title || "Dashboard"

  const visibleNav = user?.role === "admin" ? navigationItems : navigationItems.filter((item) => !item.adminOnly)

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const initials = (user?.name || "VS")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-white/5 bg-[#0b1329] text-slate-100">
        {/* Brand */}
        <SidebarHeader className="flex h-16 items-center justify-center gap-3 border-b border-white/5 px-5 group-data-[collapsible=icon]:px-0">
          <Link href="/dashboard" className="flex items-center gap-3">
            {/* Expanded: full logo */}
            <img
              src="/brand/vision360-logo.png"
              alt="Vision 360 AI"
              className="h-9 w-auto rounded-lg object-contain group-data-[collapsible=icon]:hidden"
              style={{ filter: "drop-shadow(0 2px 6px rgba(56,189,248,0.25))" }}
            />
            {/* Collapsed: icon mark only */}
            <div className="hidden size-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 group-data-[collapsible=icon]:flex">
              <span className="text-lg font-black text-white tracking-tighter">V</span>
              <span className="text-[8px] font-bold text-cyan-200 -ml-0.5 mt-1">360</span>
            </div>
          </Link>
        </SidebarHeader>

        {/* Navigation */}
        <SidebarContent className="px-3 py-4 no-scrollbar">
          <SidebarMenu>
            {visibleNav.map((item) => {
              const active = isActive(item.url)
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={active}
                    className={`h-9 rounded-lg px-3 text-[13px] transition-colors ${
                      active
                        ? "bg-[#2563eb] text-white font-medium shadow-[0_4px_14px_rgba(37,99,235,0.45)]"
                        : "text-slate-300/80 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <item.icon className={`h-[17px] w-[17px] ${active ? "text-white" : "text-slate-400"}`} />
                    <span className="truncate">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarContent>

        {/* Profile */}
        <SidebarFooter className="border-t border-white/5 p-4 group-data-[collapsible=icon]:p-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="flex w-full items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5 text-left transition-colors hover:bg-white/10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
                  <Avatar className="h-9 w-9 rounded-full ring-2 ring-sky-400/40">
                    <AvatarFallback className="rounded-full bg-gradient-to-br from-sky-500 to-blue-700 text-xs font-bold text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden flex-1 items-center justify-between overflow-hidden group-data-[collapsible=icon]:hidden">
                    <div className="min-w-0 leading-tight">
                      <span className="block truncate text-sm font-semibold text-white">{user?.name || "Account"}</span>
                      <span className="flex items-center gap-1 text-[11px] capitalize text-slate-400">
                        <ShieldCheck className="h-3 w-3" />
                        {user?.role || "client"}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
                  </div>
                </button>
              }
            />
            <DropdownMenuContent align="start" side="top" className="w-56">
              <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/dashboard/profile" />}>My profile</DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/dashboard/ai-settings" />}>AI settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
        <SidebarRail className="bg-white/5" />
      </Sidebar>

      {/* Main column */}
      <div className="flex flex-1 flex-col h-screen min-w-0 overflow-hidden bg-[#f8fafc]">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="text-slate-500 hover:bg-slate-100 hover:text-slate-900" />
            <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
              <img src="/brand/vision360-logo.png" alt="V360 AI" className="h-8 w-auto object-contain mix-blend-multiply" />
            </Link>
          </div>
          <div className="flex min-w-0 flex-1 items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="hidden items-center gap-2 lg:flex">
                <img src="/brand/vision360-logo.png" alt="V360 AI" className="h-8 w-auto object-contain mix-blend-multiply" />
              </Link>
              <div className="min-w-0">
                {pathname === "/dashboard" || pathname === "/dashboard/" ? (
                  <div className="min-w-0">
                    <h1 className="truncate text-lg font-bold tracking-tight text-slate-900">Welcome back, {user?.name?.split(" ")[0] || "there"}! 👋</h1>
                    <p className="truncate text-xs text-slate-500">Here's what's happening with your business today.</p>
                  </div>
                ) : (
                  <h1 className="truncate text-lg font-semibold tracking-tight text-slate-900">{currentTitle}</h1>
                )}
              </div>
            </div>
            <div className="hidden w-full max-w-md md:block">
              <GlobalCommandPalette variant="header" />
            </div>
            <div className="flex shrink-0 items-center gap-2.5">
              {/* Create New */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#2563eb] px-3.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-600">
                      <Plus className="h-4 w-4" />
                      Create New
                      <ChevronDown className="h-3.5 w-3.5 opacity-80" />
                    </button>
                  }
                />
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>Create</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<Link href="/dashboard/email-marketing/create" />}>
                    New Campaign
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/dashboard/leads" />}>New Lead</DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/dashboard/workflows" />}>
                    New Workflow
                  </DropdownMenuItem>
                  {user?.role === "admin" && (
                    <DropdownMenuItem render={<Link href="/dashboard/clients" />}>Onboard Client</DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Notifications */}
              <button
                className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                aria-label="Notifications"
              >
                <Bell className="h-[18px] w-[18px]" />
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white">
                  1
                </span>
              </button>

              {/* Help */}
              <button
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                aria-label="Help"
              >
                <HelpCircle className="h-[18px] w-[18px]" />
              </button>

              {/* Profile */}
              <button className="ml-1 flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-slate-100">
                <Avatar className="h-8 w-8 rounded-full">
                  <AvatarFallback className="rounded-full bg-gradient-to-br from-sky-500 to-blue-700 text-[11px] font-bold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium text-slate-700 lg:block">
                  {user?.name || "Account"}
                </span>
                <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 lg:block" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto bg-[#f8fafc]">
          <div className="mx-auto w-full max-w-[1440px] min-w-0 p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
