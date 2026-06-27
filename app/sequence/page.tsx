"use client"

import { useState } from "react"
import {
  Play,
  Pause,
  Shield,
  Clock,
  Link2,
  MessageSquare,
  UserPlus,
  AlertTriangle,
  Plus,
} from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DEMO_CAMPAIGNS } from "@/lib/scouting/mock-data"
import { DEFAULT_SEQUENCE, SAFETY } from "@/lib/scouting/constants"
import { cn } from "@/lib/utils"
import type { Campaign, CampaignStatus, MessageType } from "@/types/scouting"

const TYPE_ICON: Record<MessageType, typeof UserPlus> = {
  connection_request: UserPlus,
  message: MessageSquare,
  follow_up: MessageSquare,
  reply: MessageSquare,
}

export default function SequencePage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(DEMO_CAMPAIGNS)
  const [selectedId, setSelectedId] = useState(DEMO_CAMPAIGNS[0].id)

  const selected = campaigns.find((c) => c.id === selectedId)!

  function toggleStatus(id: string) {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c
        const next: CampaignStatus = c.status === "active" ? "paused" : "active"
        toast.success(`Campaign ${next === "active" ? "resumed" : "paused"}`)
        return { ...c, status: next }
      })
    )
  }

  const sentToday = 14 // demo: connections sent today
  const messagesToday = 31

  return (
    <div>
      <PageHeader
        title="Sequence"
        description="Campaigns, timelines, and account-safe sending."
        actions={
          <Button className="bg-[#1E3A5F] hover:bg-[#16304f] text-white gap-1.5">
            <Plus className="h-4 w-4" />
            New campaign
          </Button>
        }
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 max-w-[1200px] items-start">
        {/* Campaign list */}
        <div className="space-y-2">
          {campaigns.map((c) => {
            const acceptRate = c.connectionsSent ? Math.round((c.connectionsAccepted / c.connectionsSent) * 100) : 0
            return (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={cn(
                  "w-full text-left rounded-xl border bg-white p-4 transition-all",
                  selectedId === c.id ? "border-[#2D5F9A] ring-1 ring-[#2D5F9A]" : "border-slate-200 hover:border-slate-300"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-[#0F1B35] truncate pr-2">{c.name}</p>
                  <Badge
                    variant={c.status === "active" ? "success" : c.status === "paused" ? "warning" : "secondary"}
                    className="h-5 capitalize shrink-0"
                  >
                    {c.status}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-400 mb-3 line-clamp-1">{c.description}</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <MiniStat label="Leads" value={c.totalLeads} />
                  <MiniStat label="Replies" value={c.repliesReceived} />
                  <MiniStat label="Accept" value={`${acceptRate}%`} />
                </div>
              </button>
            )
          })}
        </div>

        {/* Selected campaign detail */}
        <div className="space-y-6">
          {/* Header bar */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#0F1B35]">{selected.name}</h2>
                <p className="text-sm text-slate-500 mt-0.5">{selected.description}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {selected.activeHoursStart}–{selected.activeHoursEnd}
                  </span>
                  <span className="capitalize">{selected.type.replace(/_/g, " ")}</span>
                  <span>{selected.activeDays.length} active days</span>
                </div>
              </div>
              <Button
                onClick={() => toggleStatus(selected.id)}
                variant={selected.status === "active" ? "outline" : "default"}
                className={cn("gap-1.5", selected.status !== "active" && "bg-[#1E3A5F] hover:bg-[#16304f] text-white")}
              >
                {selected.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {selected.status === "active" ? "Pause" : "Resume"}
              </Button>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold text-[#0F1B35] text-sm mb-5">Sequence timeline</h3>
            <div className="relative">
              <div className="absolute top-5 left-5 right-5 h-px bg-slate-200" />
              <div className="grid grid-cols-5 gap-2 relative">
                {DEFAULT_SEQUENCE.map((step) => {
                  const Icon = TYPE_ICON[step.type]
                  const cumulative = DEFAULT_SEQUENCE.slice(0, step.step).reduce((s, x) => s + x.delayDays, 0)
                  return (
                    <div key={step.step} className="flex flex-col items-center text-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F0FB] border-2 border-white ring-1 ring-slate-200 z-10">
                        <Icon className="h-4 w-4 text-[#2D5F9A]" />
                      </div>
                      <p className="text-[11px] font-semibold text-[#0F1B35] mt-2">{step.label}</p>
                      <p className="text-[10px] text-slate-400">Day {cumulative}</p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-tight">{step.condition}</p>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-slate-500">
              <span>↳ If accepted within 24h → send Message 1 immediately</span>
              <span>↳ If replied at any point → stop & move to Inbox</span>
              <span>↳ If pending 7 days → withdraw & skip</span>
            </div>
          </div>

          {/* Safety controls */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-4 w-4 text-emerald-600" />
              <h3 className="font-semibold text-[#0F1B35] text-sm">Account safety</h3>
              <Badge variant="success" className="h-5 ml-auto">Healthy</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LimitBar
                icon={Link2}
                label="Connection requests"
                used={sentToday}
                limit={selected.dailyConnectionLimit}
              />
              <LimitBar
                icon={MessageSquare}
                label="Messages"
                used={messagesToday}
                limit={selected.dailyMessageLimit}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <SafetyChip label="Min gap" value={`${SAFETY.minGapMinutes} min`} />
              <SafetyChip label="Delay variance" value={`±${SAFETY.delayVariance * 100}%`} />
              <SafetyChip label="Weekend pause" value="On" />
              <SafetyChip label="Warm-up mode" value="Off" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md bg-slate-50 py-1.5">
      <p className="text-sm font-bold text-[#0F1B35] leading-none">{value}</p>
      <p className="text-[10px] text-slate-400 mt-1">{label}</p>
    </div>
  )
}

function LimitBar({
  icon: Icon,
  label,
  used,
  limit,
}: {
  icon: typeof Link2
  label: string
  used: number
  limit: number
}) {
  const pct = Math.min(100, (used / limit) * 100)
  const warn = pct >= 80
  return (
    <div className="rounded-lg border border-slate-100 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
          <Icon className="h-3.5 w-3.5 text-slate-400" />
          {label}
        </span>
        <span className={cn("text-xs font-semibold", warn ? "text-amber-600" : "text-slate-500")}>
          {used} / {limit}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <div className={cn("h-full", warn ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${pct}%` }} />
      </div>
      {warn && (
        <p className="text-[10px] text-amber-600 mt-1.5 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" /> Approaching daily limit
        </p>
      )}
    </div>
  )
}

function SafetyChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className="text-xs font-semibold text-[#0F1B35] mt-0.5">{value}</p>
    </div>
  )
}
