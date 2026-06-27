"use client"

import Link from "next/link"
import {
  Radar,
  Inbox,
  CalendarCheck,
  TrendingUp,
  ArrowRight,
  Flame,
  Users,
  Send,
  ChevronRight,
} from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { DEMO_LEADS, DEMO_CAMPAIGNS, DEMO_CONVERSATIONS, getLeadById } from "@/lib/scouting/mock-data"
import { REPLY_CLASS_META, STAGE_COLORS, PIPELINE_STAGES } from "@/lib/scouting/constants"
import { IntentBadge } from "@/components/scouting/intent-badge"
import { ScoreRing } from "@/components/scouting/score-ring"
import { getInitials, cn } from "@/lib/utils"

export default function DashboardPage() {
  const { profile } = useAuth()
  const firstName = profile?.full_name?.split(" ")[0] ?? "there"

  // Aggregate demo metrics across campaigns
  const totals = DEMO_CAMPAIGNS.reduce(
    (acc, c) => ({
      leads: acc.leads + c.totalLeads,
      sent: acc.sent + c.connectionsSent,
      accepted: acc.accepted + c.connectionsAccepted,
      replies: acc.replies + c.repliesReceived,
      meetings: acc.meetings + c.meetingsBooked,
    }),
    { leads: 0, sent: 0, accepted: 0, replies: 0, meetings: 0 }
  )
  const replyRate = totals.sent ? ((totals.replies / totals.sent) * 100).toFixed(1) : "0"
  const acceptRate = totals.sent ? ((totals.accepted / totals.sent) * 100).toFixed(0) : "0"

  const hotLeads = [...DEMO_LEADS].sort((a, b) => b.totalScore - a.totalScore).slice(0, 4)
  const needsReply = DEMO_CONVERSATIONS.filter((c) => c.unread)

  const metrics = [
    { label: "Leads in pipeline", value: totals.leads.toLocaleString(), icon: Users, sub: "across 3 campaigns" },
    { label: "Connections sent", value: totals.sent.toLocaleString(), icon: Send, sub: `${acceptRate}% accepted` },
    { label: "Reply rate", value: `${replyRate}%`, icon: TrendingUp, sub: "benchmark 8–15%" },
    { label: "Meetings booked", value: totals.meetings.toString(), icon: CalendarCheck, sub: "this month" },
  ]

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here's what needs your attention today."
        actions={
          <Link href="/scout">
            <Button className="bg-[#1E3A5F] hover:bg-[#16304f] text-white gap-1.5">
              <Radar className="h-4 w-4" />
              Find leads
            </Button>
          </Link>
        }
      />

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Needs reply */}
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Inbox className="h-4 w-4 text-[#2D5F9A]" />
                <h2 className="font-semibold text-[#0F1B35] text-sm">Needs your reply</h2>
                <Badge variant="danger" className="h-5">
                  {needsReply.length}
                </Badge>
              </div>
              <Link href="/inbox" className="text-xs font-medium text-[#2D5F9A] hover:underline">
                Open inbox
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {needsReply.map((conv) => {
                const lead = getLeadById(conv.leadId)
                const meta = REPLY_CLASS_META[conv.classification]
                const lastMsg = conv.messages[conv.messages.length - 1]
                if (!lead) return null
                return (
                  <Link
                    key={conv.id}
                    href="/inbox"
                    className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors"
                  >
                    <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-xs font-semibold", lead.avatarColor)}>
                      {getInitials(`${lead.firstName} ${lead.lastName}`)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[#0F1B35] truncate">
                          {lead.firstName} {lead.lastName}
                        </p>
                        <span className="text-[11px] text-slate-400">· {lead.company}</span>
                        <span className={cn("ml-auto inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium", meta.pill)}>
                          {meta.emoji} {meta.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{lastMsg.content}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Hot leads */}
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-500" />
                <h2 className="font-semibold text-[#0F1B35] text-sm">Top scored leads</h2>
              </div>
              <Link href="/scout" className="text-xs font-medium text-[#2D5F9A] hover:underline">
                View all
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {hotLeads.map((lead) => (
                <div key={lead.id} className="flex items-center gap-3 px-5 py-3">
                  <ScoreRing score={lead.totalScore} size={38} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#0F1B35] truncate">
                      {lead.firstName} {lead.lastName}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {lead.title} · {lead.company}
                    </p>
                  </div>
                  {lead.intentSignals[0] && <IntentBadge signal={lead.intentSignals[0]} showLabel={false} />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Campaigns */}
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-[#0F1B35] text-sm">Active campaigns</h2>
            <Link href="/sequence" className="text-xs font-medium text-[#2D5F9A] hover:underline">
              Manage
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {DEMO_CAMPAIGNS.map((c) => (
              <Link
                key={c.id}
                href="/sequence"
                className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[#0F1B35]">{c.name}</p>
                    <Badge
                      variant={c.status === "active" ? "success" : c.status === "paused" ? "warning" : "secondary"}
                      className="h-5 capitalize"
                    >
                      {c.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{c.description}</p>
                </div>
                <div className="hidden sm:flex items-center gap-6 text-center">
                  <Stat label="Leads" value={c.totalLeads} />
                  <Stat label="Sent" value={c.connectionsSent} />
                  <Stat label="Replies" value={c.repliesReceived} />
                  <Stat label="Meetings" value={c.meetingsBooked} />
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </Link>
            ))}
          </div>
        </div>

        {/* Pipeline snapshot */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#0F1B35] text-sm">Pipeline snapshot</h2>
            <Link href="/pipeline" className="text-xs font-medium text-[#2D5F9A] hover:underline inline-flex items-center gap-1">
              Open board <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {PIPELINE_STAGES.map((stage) => {
              const count = DEMO_LEADS.filter((l) => l.stage === stage.id).length
              return (
                <div
                  key={stage.id}
                  className={cn("rounded-lg border px-3 py-2 text-center min-w-[92px]", STAGE_COLORS[stage.id])}
                >
                  <p className="text-lg font-bold leading-none">{count}</p>
                  <p className="text-[10px] font-medium mt-1">{stage.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-sm font-bold text-[#0F1B35]">{value}</p>
      <p className="text-[10px] text-slate-400">{label}</p>
    </div>
  )
}
