"use client"

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"
import { TrendingUp, Target, CalendarCheck, ThumbsUp, Sparkles } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { useCampaigns } from "@/hooks/use-campaigns"
import { useScoutingLeads } from "@/hooks/use-scouting-leads"
import { PIPELINE_STAGES } from "@/lib/scouting/constants"

const WEEKLY = [
  { label: "W1", replyRate: 6.2, meetings: 1, sent: 88 },
  { label: "W2", replyRate: 8.1, meetings: 2, sent: 102 },
  { label: "W3", replyRate: 9.4, meetings: 3, sent: 96 },
  { label: "W4", replyRate: 11.8, meetings: 3, sent: 110 },
  { label: "W5", replyRate: 12.6, meetings: 4, sent: 118 },
  { label: "W6", replyRate: 13.9, meetings: 5, sent: 121 },
]

const TOP_HOOKS = [
  { hook: "Recent funding round", replyRate: 18.4 },
  { hook: "Hiring sales reps", replyRate: 15.1 },
  { hook: "Posted about the problem", replyRate: 12.7 },
  { hook: "Headcount growth", replyRate: 9.3 },
]

export default function AnalyticsPage() {
  const { campaigns } = useCampaigns()
  const { leads } = useScoutingLeads()

  const totals = campaigns.reduce(
    (acc, c) => ({
      sent: acc.sent + c.connectionsSent,
      accepted: acc.accepted + c.connectionsAccepted,
      replies: acc.replies + c.repliesReceived,
      meetings: acc.meetings + c.meetingsBooked,
    }),
    { sent: 0, accepted: 0, replies: 0, meetings: 0 }
  )

  const safeDiv = (a: number, b: number) => (b ? (a / b) * 100 : 0)
  const acceptanceRate = safeDiv(totals.accepted, totals.sent).toFixed(0)
  const replyRate = safeDiv(totals.replies, totals.sent).toFixed(1)
  const positiveReplies = Math.round(totals.replies * 0.55)
  const positiveRate = safeDiv(positiveReplies, totals.replies).toFixed(0)
  const meetingRate = safeDiv(totals.meetings, totals.replies).toFixed(0)

  const stageData = PIPELINE_STAGES.map((s) => ({
    label: s.label,
    count: leads.filter((l) => l.stage === s.id).length,
  })).filter((d) => d.count > 0)

  const funnel = [
    { label: "Connections sent", value: totals.sent, color: "#1E3A5F" },
    { label: "Accepted", value: totals.accepted, color: "#2D5F9A" },
    { label: "Replied", value: totals.replies, color: "#5B8DD0" },
    { label: "Meetings booked", value: totals.meetings, color: "#22C55E" },
  ]
  const funnelMax = funnel[0].value

  const metrics = [
    { label: "Acceptance rate", value: `${acceptanceRate}%`, sub: "benchmark 30–45%", icon: Target },
    { label: "Reply rate", value: `${replyRate}%`, sub: "benchmark 8–15%", icon: TrendingUp },
    { label: "Positive reply rate", value: `${positiveRate}%`, sub: "hot + warm", icon: ThumbsUp },
    { label: "Meeting booked rate", value: `${meetingRate}%`, sub: "of replies", icon: CalendarCheck },
  ]

  return (
    <div>
      <PageHeader title="Analytics" description="Campaign performance across every channel." />

      <div className="p-6 space-y-6 max-w-[1200px]">
        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m) => {
            const Icon = m.icon
            return (
              <div key={m.label} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-slate-500">{m.label}</span>
                  <Icon className="h-4 w-4 text-[#2D5F9A]" />
                </div>
                <p className="text-2xl font-bold text-[#0F1B35]">{m.value}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{m.sub}</p>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reply rate over time */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold text-[#0F1B35] text-sm mb-4">Reply rate over time</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={WEEKLY} margin={{ left: -20, right: 8, top: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }}
                  formatter={(v) => [`${v}%`, "Reply rate"]}
                />
                <Line type="monotone" dataKey="replyRate" stroke="#2D5F9A" strokeWidth={2.5} dot={{ r: 3, fill: "#2D5F9A" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Leads by stage */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold text-[#0F1B35] text-sm mb-4">Leads by stage</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stageData} margin={{ left: -20, right: 8, top: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="label" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-25} textAnchor="end" height={50} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }} />
                <Bar dataKey="count" fill="#2D5F9A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Funnel */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold text-[#0F1B35] text-sm mb-4">Conversion funnel</h3>
            <div className="space-y-3">
              {funnel.map((f) => (
                <div key={f.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-600">{f.label}</span>
                    <span className="text-xs font-semibold text-[#0F1B35]">{f.value.toLocaleString()}</span>
                  </div>
                  <div className="h-6 rounded-md bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-md flex items-center justify-end pr-2"
                      style={{ width: `${(f.value / funnelMax) * 100}%`, backgroundColor: f.color }}
                    >
                      <span className="text-[10px] font-medium text-white">
                        {((f.value / funnelMax) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top hooks */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-[#2D5F9A]" />
              <h3 className="font-semibold text-[#0F1B35] text-sm">Best performing hooks</h3>
            </div>
            <div className="space-y-3">
              {TOP_HOOKS.map((h, i) => (
                <div key={h.hook} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8F0FB] text-[11px] font-bold text-[#2D5F9A]">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-600">{h.hook}</span>
                      <span className="text-xs font-semibold text-emerald-600">{h.replyRate}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${(h.replyRate / 20) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
