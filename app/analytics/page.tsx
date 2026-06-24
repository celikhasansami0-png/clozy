"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { PageHeader } from "@/components/layout/page-header"
import { MetricCard } from "@/components/dashboard/metric-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAnalytics } from "@/hooks/use-analytics"
import {
  Users,
  MessageSquare,
  Target,
  TrendingUp,
  Activity,
  Zap,
  Phone,
  DollarSign,
} from "lucide-react"
import { formatCurrency, formatPercent } from "@/lib/utils"
import { LEAD_STAGES } from "@/lib/constants"

const STAGE_COLORS = {
  new: "#94a3b8",
  contacted: "#60a5fa",
  replied: "#a78bfa",
  booked: "#f59e0b",
  closed: "#10b981",
  lost: "#ef4444",
}

export default function AnalyticsPage() {
  const { overview, loading } = useAnalytics()

  if (loading) {
    return (
      <div>
        <PageHeader title="Analytics" description="Track your LinkedIn growth performance." />
        <div className="p-6 py-16 text-center text-sm text-slate-400">Loading analytics...</div>
      </div>
    )
  }

  const stageData = LEAD_STAGES.map((stage) => ({
    name: stage.label,
    value: overview?.leads_by_stage?.[stage.id] ?? 0,
    color: STAGE_COLORS[stage.id],
  })).filter((d) => d.value > 0)

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Track your LinkedIn growth performance and pipeline metrics."
      />

      <div className="p-6 space-y-6">
        {/* Top Metrics */}
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
            value={formatPercent(overview?.reply_rate ?? 0)}
            description="Contacted → Replied"
            icon={MessageSquare}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
            changeType={overview && overview.reply_rate > 20 ? "positive" : "neutral"}
          />
          <MetricCard
            title="Meetings Booked"
            value={overview?.meetings_booked ?? 0}
            description="Qualified discovery calls"
            icon={Phone}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
          />
          <MetricCard
            title="Deals Closed"
            value={overview?.deals_closed ?? 0}
            change={formatPercent(overview?.conversion_rate ?? 0) + " close rate"}
            icon={Target}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Pipeline Value"
            value={formatCurrency(overview?.pipeline_value ?? 0)}
            description="Weighted by stage probability"
            icon={DollarSign}
            iconColor="text-indigo-600"
            iconBg="bg-indigo-50"
          />
          <MetricCard
            title="Active Campaigns"
            value={overview?.active_campaigns ?? 0}
            description="Live growth systems"
            icon={Zap}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
          />
          <MetricCard
            title="Conversion Rate"
            value={formatPercent(overview?.conversion_rate ?? 0)}
            description="Lead → Closed"
            icon={Activity}
            iconColor="text-rose-600"
            iconBg="bg-rose-50"
          />
          <MetricCard
            title="New This Month"
            value={overview?.new_leads_this_month ?? 0}
            description="New leads added"
            icon={TrendingUp}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leads by Month */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Leads Added by Month</CardTitle>
            </CardHeader>
            <CardContent>
              {(overview?.leads_by_month?.length ?? 0) > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={overview?.leads_by_month} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <Tooltip
                      contentStyle={{ border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }}
                    />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Leads" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[220px] items-center justify-center text-sm text-slate-400">
                  No data yet — add leads to see trends
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revenue by Month */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Revenue Closed by Month</CardTitle>
            </CardHeader>
            <CardContent>
              {(overview?.revenue_by_month?.some((m) => m.value > 0)) ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={overview?.revenue_by_month} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                    />
                    <Tooltip
                      formatter={(v: unknown) => [`$${Number(v).toLocaleString()}`, "Revenue"]}
                      contentStyle={{ border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: "#10b981", r: 4 }}
                      name="Revenue"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[220px] items-center justify-center text-sm text-slate-400">
                  Close deals to see revenue trends
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pipeline Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pie chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Pipeline Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {stageData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={stageData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {stageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }}
                        formatter={(v: unknown) => String(v)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-2">
                    {stageData.map((d) => (
                      <div key={d.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                          <span className="text-slate-600">{d.name}</span>
                        </div>
                        <span className="font-semibold text-slate-900">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex h-[180px] items-center justify-center text-sm text-slate-400">
                  Add leads to see distribution
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conversion Funnel */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm">Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {LEAD_STAGES.filter(s => s.id !== "lost").map((stage, i) => {
                  const count = overview?.leads_by_stage?.[stage.id] ?? 0
                  const maxCount = Math.max(overview?.total_leads ?? 1, 1)
                  const pct = (count / maxCount) * 100

                  return (
                    <div key={stage.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px]">{stage.label}</Badge>
                          <span className="text-slate-500">{stage.description}</span>
                        </div>
                        <span className="font-semibold text-slate-900">{count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.max(pct, 1)}%`,
                            backgroundColor: STAGE_COLORS[stage.id],
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
