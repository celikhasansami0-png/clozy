"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Radar,
  PenLine,
  GitBranch,
  Send,
  Inbox,
  KanbanSquare,
  BarChart2,
  CreditCard,
  Settings,
  LogOut,
  Crosshair,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getInitials } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

const MAIN_NAV = [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }]

const MODULES = [
  { href: "/scout", label: "Scout", icon: Radar },
  { href: "/craft", label: "Craft", icon: PenLine },
  { href: "/sequence", label: "Sequence", icon: GitBranch },
  { href: "/send", label: "Send", icon: Send },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/pipeline", label: "Pipeline", icon: KanbanSquare },
]

const SYSTEM_MODULES = [{ href: "/analytics", label: "Analytics", icon: BarChart2 }]

const BOTTOM_ITEMS = [
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
]

function tierLabel(tier?: string) {
  switch (tier) {
    case "student_pro":
      return "Starter"
    case "team_pro":
    case "university":
      return "Growth"
    default:
      return "Free Trial"
  }
}

export function Sidebar() {
  const pathname = usePathname()
  const { user, profile, signOut } = useAuth()

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")
  const isPro =
    profile?.subscription_tier === "student_pro" ||
    profile?.subscription_tier === "team_pro" ||
    profile?.subscription_tier === "university"

  const renderLink = (item: { href: string; label: string; icon: typeof Radar }) => {
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
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[240px] border-r border-slate-200 bg-white flex flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center px-4 border-b border-slate-200">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1E3A5F]">
            <Crosshair className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-slate-900 text-[15px] tracking-tight leading-tight">
            Scouting
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {MAIN_NAV.map(renderLink)}

        <Separator className="my-2.5" />
        <div className="px-3 pt-0.5 pb-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Pipeline
          </span>
        </div>
        {MODULES.map(renderLink)}

        <Separator className="my-2.5" />
        <div className="px-3 pt-0.5 pb-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Insights
          </span>
        </div>
        {SYSTEM_MODULES.map(renderLink)}

        <Separator className="my-2.5" />
        {BOTTOM_ITEMS.map(renderLink)}

        {!isPro && (
          <div className="mt-3 mx-1 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-[11px] font-semibold text-slate-700 mb-1">Upgrade to Growth</p>
            <p className="text-[11px] text-slate-500 mb-2.5">
              Unlimited campaigns, all intent signals, A/B testing.
            </p>
            <Link
              href="/billing"
              className="flex items-center justify-between rounded-md bg-[#1E3A5F] px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-[#16304f] transition-colors"
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
              {profile?.full_name ?? user?.email?.split("@")[0] ?? "You"}
            </p>
            <Badge className="text-[10px] px-1.5 py-0 h-4 bg-slate-100 text-slate-500 hover:bg-slate-100">
              {tierLabel(profile?.subscription_tier)}
            </Badge>
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
