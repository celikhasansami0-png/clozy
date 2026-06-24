"use client"

import Link from "next/link"
import { Zap, Users, BarChart2, Plus, ArrowRight, CheckSquare, Target, TrendingUp, Activity } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { MetricCard } from "@/components/dashboard/metric-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { useLeads } from "@/hooks/use-leads"
import { useTasks } from "@/hooks/use-tasks"
import { useAnalytics } from "@/hooks/use-analytics"
import { formatCurrency, formatPercent, relativeTime } from "@/lib/utils"
import { LEAD_STAGES } from "@/lib/constants"

export default function DashboardPage() {
  const { profile } = useAuth()
  const { leads, loading: leadsLoading } = useLeads()
  const { tasks, todaysTasks } = useTasks()
  const { overview, loading: analyticsLoading } = useAnalytics()

  const firstName = profile?.full_name?.split(" ")[0] ?? "there"

  const stageColors: Record<string, string> = {
    new: "secondary",
    contacted: "info",
    replied: "purple",
    booked: "warning",
    closed: "success",
    lost: "danger",
  }

  return (
    <div>
      <PageHeader
        title={`Good morning, ${firstName}`}
        description="Here's your growth performance overview."
        actions={
          <Link href="/growth">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
              <Zap className="h-4 w-4" />
              New Growth System
            </Button>
          </Link>
        }
      />

      <div className="p-6 space-y-6">
        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Leads"
            value={overview?.total_leads ?? 0}
            change={overview?.new_leads_this_month ? `+${overview.new_leads_this_month} this month` : undefined}
            changeType="positive"
            icon={Users}
            iconColor="text-indigo-600"
            iconBg="bg-indigo-50"
          />
          <MetricCard
            title="Reply Rate"
            value={overview ? formatPercent(overview.reply_rate) : "—"}
            description="Contacted → Replied"
            icon={Activity}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
            changeType={overview && overview.reply_rate > 20 ? "positive" : "neutral"}
          />
          <MetricCard
            title="Pipeline Value"
            value={overview ? formatCurrency(overview.pipeline_value) : "—"}
            description="Weighted by stage"
            icon={TrendingUp}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
          />
          <MetricCard
            title="Deals Closed"
            value={overview?.deals_closed ?? 0}
            change={overview ? `${formatPercent(overview.conversion_rate)} close rate` : undefined}
            icon={Target}
            iconColor="text-rose-600"
            iconBg="bg-rose-50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Tasks */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-900">
                  Today&apos;s Tasks
                </CardTitle>
                <Link href="/tasks">
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500 gap-1">
                    View all <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {todaysTasks.length === 0 ? (
                <div className="py-6 text-center">
                  <CheckSquare className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No tasks for today</p>
                  <Link href="/growth" className="mt-2 inline-block text-xs text-indigo-600 hover:underline">
                    Generate a growth system →
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {todaysTasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 rounded-md p-2.5 hover:bg-slate-50 transition-colors"
                    >
                      <div className={`mt-0.5 h-3 w-3 shrink-0 rounded-full border-2 ${
                        task.status === "completed" ? "bg-emerald-500 border-emerald-500" : "border-slate-300"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium ${task.status === "completed" ? "line-through text-slate-400" : "text-slate-700"}`}>
                          {task.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pipeline Summary */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-900">
                  Pipeline Overview
                </CardTitle>
                <Link href="/crm">
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500 gap-1">
                    Open CRM <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {leadsLoading ? (
                <div className="py-8 text-center text-sm text-slate-400">Loading...</div>
              ) : leads.length === 0 ? (
                <div className="py-6 text-center">
                  <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No leads yet</p>
                  <Link href="/crm" className="mt-2 inline-block text-xs text-indigo-600 hover:underline">
                    Add your first lead →
                  </Link>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {LEAD_STAGES.map((stage) => {
                    const count = overview?.leads_by_stage?.[stage.id] ?? 0
                    const percentage = overview?.total_leads ? (count / overview.total_leads) * 100 : 0
                    return (
                      <div key={stage.id} className="flex items-center gap-3">
                        <div className="w-20 shrink-0">
                          <Badge variant={stageColors[stage.id] as "secondary"} className="text-[10px]">
                            {stage.label}
                          </Badge>
                        </div>
                        <div className="flex-1 rounded-full bg-slate-100 h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-indigo-500 transition-all"
                            style={{ width: `${Math.max(percentage, 2)}%` }}
                          />
                        </div>
                        <span className="w-6 text-right text-xs font-medium text-slate-600">{count}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.href} href={action.href}>
                  <div className="rounded-lg border border-slate-200 bg-white p-4 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all cursor-pointer group">
                    <div className={`mb-2.5 flex h-8 w-8 items-center justify-center rounded-lg ${action.bg}`}>
                      <Icon className={`h-4 w-4 ${action.color} group-hover:scale-110 transition-transform`} />
                    </div>
                    <p className="text-sm font-medium text-slate-900">{action.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{action.description}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

const QUICK_ACTIONS = [
  {
    label: "New Growth System",
    description: "Generate AI outreach strategy",
    href: "/growth",
    icon: Zap,
    bg: "bg-indigo-100",
    color: "text-indigo-600",
  },
  {
    label: "Add Lead",
    description: "Track a new prospect",
    href: "/crm",
    icon: Plus,
    bg: "bg-emerald-100",
    color: "text-emerald-600",
  },
  {
    label: "Browse Templates",
    description: "Copy proven scripts",
    href: "/templates",
    icon: BarChart2,
    bg: "bg-amber-100",
    color: "text-amber-600",
  },
  {
    label: "View Analytics",
    description: "Track your performance",
    href: "/analytics",
    icon: TrendingUp,
    bg: "bg-rose-100",
    color: "text-rose-600",
  },
]
