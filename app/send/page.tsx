"use client"

import { useState } from "react"
import {
  Copy,
  Check,
  ExternalLink,
  Send,
  Shield,
  UserPlus,
  MessageSquare,
  Inbox,
} from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useScoutingMessages } from "@/hooks/use-scouting-messages"
import { useScoutingLeads } from "@/hooks/use-scouting-leads"
import { SAFETY } from "@/lib/scouting/constants"
import { cn, getInitials } from "@/lib/utils"
import type { OutreachMessage, PipelineStage } from "@/types/scouting"

// Where a lead lands after a given message type is sent.
function stageAfter(type: OutreachMessage["type"]): PipelineStage | null {
  switch (type) {
    case "connection_request":
      return "connection_sent"
    case "message":
      return "messaged"
    case "follow_up":
      return "messaged"
    default:
      return null
  }
}

export default function SendPage() {
  const { pending, markSent, sentToday } = useScoutingMessages()
  const { leads, moveStage } = useScoutingLeads()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [sendingId, setSendingId] = useState<string | null>(null)

  const leadsById = Object.fromEntries(leads.map((l) => [l.id, l]))

  const connectionsToday = sentToday // simplification: counts all sends today
  const connectionPct = Math.min(100, (connectionsToday / SAFETY.maxConnectionsPerDay) * 100)
  const limitReached = connectionsToday >= SAFETY.maxConnectionsPerDay

  async function handleCopy(m: OutreachMessage) {
    try {
      await navigator.clipboard.writeText(m.content)
      setCopiedId(m.id)
      toast.success("Copied — paste it into LinkedIn")
      setTimeout(() => setCopiedId(null), 1500)
    } catch {
      toast.error("Could not copy")
    }
  }

  async function handleMarkSent(m: OutreachMessage) {
    setSendingId(m.id)
    try {
      await markSent(m.id)
      const next = stageAfter(m.type)
      const lead = leadsById[m.leadId]
      if (next && lead) await moveStage(lead.id, next)
      toast.success("Marked as sent")
    } catch {
      toast.error("Could not update")
    } finally {
      setSendingId(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Send"
        description="Your daily queue — copy, send on LinkedIn, mark done. Safe and manual."
        actions={
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5">
            <Shield className={cn("h-4 w-4", limitReached ? "text-amber-500" : "text-emerald-500")} />
            <span className="text-xs font-medium text-slate-600">
              {connectionsToday} / {SAFETY.maxConnectionsPerDay} today
            </span>
            <div className="h-1.5 w-16 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={cn("h-full", limitReached ? "bg-amber-500" : "bg-emerald-500")}
                style={{ width: `${connectionPct}%` }}
              />
            </div>
          </div>
        }
      />

      <div className="p-6 max-w-[1000px] space-y-3">
        {limitReached && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            You&apos;ve hit today&apos;s safe limit of {SAFETY.maxConnectionsPerDay}. Come back tomorrow to keep your account healthy.
          </div>
        )}

        {pending.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <Send className="h-7 w-7 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              Nothing queued. Generate a sequence in Craft and it&apos;ll show up here ready to send.
            </p>
          </div>
        ) : (
          pending.map((m) => {
            const lead = leadsById[m.leadId]
            const TypeIcon = m.type === "connection_request" ? UserPlus : MessageSquare
            return (
              <div key={m.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-xs font-semibold",
                        lead?.avatarColor ?? "bg-slate-400"
                      )}
                    >
                      {lead ? getInitials(`${lead.firstName} ${lead.lastName}`) : "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#0F1B35] truncate">
                        {lead ? `${lead.firstName} ${lead.lastName}` : "Unknown lead"}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {lead?.title}
                        {lead?.company ? ` · ${lead.company}` : ""}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="h-5 gap-1 shrink-0">
                    <TypeIcon className="h-3 w-3" />
                    {m.type === "connection_request" ? "Connection" : `Step ${m.sequenceStep}`}
                  </Badge>
                </div>

                <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 text-sm text-slate-700 leading-relaxed">
                  {m.content}
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-[11px] text-slate-400">{m.charCount} chars</span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => handleCopy(m)}>
                      {copiedId === m.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      Copy
                    </Button>
                    {lead?.linkedinUrl && (
                      <a href={lead.linkedinUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                          <ExternalLink className="h-3.5 w-3.5" />
                          Open
                        </Button>
                      </a>
                    )}
                    <Button
                      size="sm"
                      className="h-8 gap-1.5 text-xs bg-[#1E3A5F] hover:bg-[#16304f] text-white"
                      onClick={() => handleMarkSent(m)}
                      disabled={sendingId === m.id || limitReached}
                    >
                      <Check className="h-3.5 w-3.5" />
                      Mark sent
                    </Button>
                  </div>
                </div>
              </div>
            )
          })
        )}

        <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-400">
          <Inbox className="h-3.5 w-3.5" />
          Replies you get back go in the Inbox — paste them there to classify and respond.
        </div>
      </div>
    </div>
  )
}
