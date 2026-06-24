"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Zap,
  Users,
  Library,
  CheckSquare,
  BarChart2,
  CreditCard,
  Settings,
  LogOut,
  Network,
  ChevronRight,
  Crown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getInitials } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/growth", label: "Growth Generator", icon: Zap },
  { href: "/crm", label: "Pipeline & CRM", icon: Users },
  { href: "/templates", label: "Templates", icon: Library },
  { href: "/tasks", label: "Execution Plan", icon: CheckSquare },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
]

const BOTTOM_ITEMS = [
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, profile, signOut, isPro } = useAuth()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[240px] border-r border-slate-200 bg-white flex flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center px-4 border-b border-slate-200">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
            <Network className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-slate-900 text-[15px]">Growth OS</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-indigo-600" : "")} />
                {item.label}
                {item.href === "/growth" && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-600">
                    AI
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        <Separator className="my-3" />

        <div className="space-y-0.5">
          {BOTTOM_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Upgrade CTA for free users */}
        {!isPro && (
          <div className="mt-4 mx-1 rounded-lg border border-indigo-100 bg-indigo-50 p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Crown className="h-3.5 w-3.5 text-indigo-600" />
              <span className="text-xs font-semibold text-indigo-700">Upgrade to Pro</span>
            </div>
            <p className="text-[11px] text-indigo-600/80 mb-2.5">
              Unlimited systems, templates & advanced AI scripts.
            </p>
            <Link
              href="/billing"
              className="flex items-center justify-between rounded-md bg-indigo-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              View Plans
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
            <AvatarFallback className="text-xs">
              {getInitials(profile?.full_name ?? user?.email ?? "U")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {profile?.full_name ?? user?.email?.split("@")[0]}
            </p>
            <div className="flex items-center gap-1.5">
              <Badge
                variant={isPro ? "purple" : "secondary"}
                className="text-[10px] px-1.5 py-0 h-4"
              >
                {isPro ? "Pro" : "Free"}
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
