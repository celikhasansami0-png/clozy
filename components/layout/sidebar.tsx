"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Brain,
  ClipboardCheck,
  FileText,
  FolderOpen,
  Microscope,
  Database,
  Briefcase,
  BarChart2,
  Zap,
  CreditCard,
  Settings,
  LogOut,
  GraduationCap,
  ChevronRight,
  BookOpen,
  CalendarDays,
  FlaskConical,
  RotateCcw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getInitials } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

const MAIN_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/flashcards", label: "Flashcards", icon: RotateCcw },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/formulas", label: "Formulas", icon: FlaskConical },
]

const OS_MODULES = [
  { href: "/learn", label: "Learn OS", icon: Brain },
  { href: "/exam", label: "Exam OS", icon: ClipboardCheck },
  { href: "/assignment", label: "Assignment OS", icon: FileText },
  { href: "/project", label: "Project OS", icon: FolderOpen },
  { href: "/research", label: "Research OS", icon: Microscope },
  { href: "/knowledge", label: "Knowledge OS", icon: Database },
  { href: "/career", label: "Career OS", icon: Briefcase },
]

const SYSTEM_MODULES = [
  { href: "/analytics", label: "Analytics OS", icon: BarChart2 },
  { href: "/automation", label: "Automation OS", icon: Zap },
]

const BOTTOM_ITEMS = [
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, profile, signOut } = useAuth()

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")

  const isPro = profile?.subscription_tier === "student_pro" || profile?.subscription_tier === "team_pro" || profile?.subscription_tier === "university"

  const tierLabel = () => {
    switch (profile?.subscription_tier) {
      case "student_pro": return "Student Pro"
      case "team_pro": return "Team Pro"
      case "university": return "University"
      default: return "Free"
    }
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[240px] border-r border-slate-200 bg-white flex flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center px-4 border-b border-slate-200">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900">
            <GraduationCap className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-semibold text-slate-900 text-[13px] tracking-tight leading-tight">
            Autopilot OS
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {/* Dashboard */}
        {MAIN_NAV.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}

        <Separator className="my-2.5" />

        {/* OS Modules label */}
        <div className="px-3 pt-0.5 pb-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Modules
          </span>
        </div>

        {OS_MODULES.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}

        <Separator className="my-2.5" />

        {/* System label */}
        <div className="px-3 pt-0.5 pb-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            System
          </span>
        </div>

        {SYSTEM_MODULES.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}

        <Separator className="my-2.5" />

        {BOTTOM_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}

        {/* Upgrade CTA for free users */}
        {!isPro && (
          <div className="mt-3 mx-1 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-[11px] font-semibold text-slate-700 mb-1">Upgrade to Student Pro</p>
            <p className="text-[11px] text-slate-500 mb-2.5">
              Unlimited exams, assignments, and AI tutoring.
            </p>
            <Link
              href="/billing"
              className="flex items-center justify-between rounded-md bg-slate-900 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              View plans
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </nav>

      {/* User */}
      <div className="border-t border-slate-200 p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url ?? ""} />
            <AvatarFallback className="text-xs bg-slate-100 text-slate-600">
              {getInitials(profile?.full_name ?? user?.email ?? "U")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {profile?.full_name ?? user?.email?.split("@")[0]}
            </p>
            <div className="flex items-center gap-1.5">
              <Badge
                variant={isPro ? "secondary" : "secondary"}
                className="text-[10px] px-1.5 py-0 h-4 bg-slate-100 text-slate-500 hover:bg-slate-100"
              >
                {tierLabel()}
              </Badge>
            </div>
          </div>
          <button
            onClick={signOut}
            className="rounded-md p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
