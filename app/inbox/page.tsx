"use client"

import { useState } from "react"
import { Send, Sparkles, CalendarCheck, Loader2, Filter } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DEMO_CONVERSATIONS, getLeadById } from "@/lib/scouting/mock-data"
import { REPLY_CLASS_META } from "@/lib/scouting/constants"
import { IntentBadge } from "@/components/scouting/intent-badge"
import { ScoreRing } from "@/components/scouting/score-ring"
import { cn, getInitials } from "@/lib/utils"
import type { Conversation } from "@/types/scouting"

const FILTERS = ["All", "Unread", "Hot", "Warm", "Nurture"] as const
type FilterKey = (typeof FILTERS)[number]

export default function InboxPage() {
  const [conversations] = useState<Conversation[]>(DEMO_CONVERSATIONS)
  const [activeId, setActiveId] = useState(DEMO_CONVERSATIONS[0].id)
  const [filter, setFilter] = useState<FilterKey>("All")
  const [draft, setDraft] = useState("")
  const [classifying, setClassifying] = useState(false)

  const filtered = conversations.filter((c) => {
    if (filter === "All") return true
    if (filter === "Unread") return c.unread
    return REPLY_CLASS_META[c.classification].label.toLowerCase() === filter.toLowerCase()
  })

  const active = conversations.find((c) => c.id === activeId)!
  const activeLead = getLeadById(active.leadId)
  const meta = REPLY_CLASS_META[active.classification]

  async function handleReclassify() {
    const lastInbound = [...active.messages].reverse().find((m) => m.direction === "inbound")
    if (!lastInbound) return
    setClassifying(true)
    try {
      const res = await fetch("/api/scouting/classify-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: lastInbound.content }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`Classified as ${data.classification}`)
    } catch {
      toast.error("Classification failed")
    } finally {
      setClassifying(false)
    }
  }

  function handleSend() {
    if (!draft.trim()) return
    toast.success("Reply queued to send")
    setDraft("")
  }

  return (
    <div>
      <PageHeader title="Inbox" description="Every reply, classified and ready to answer." />

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_280px] h-[calc(100vh-81px)]">
        {/* Conversation list */}
        <div className="border-r border-slate-200 bg-white flex flex-col">
          <div className="flex items-center gap-1 p-3 border-b border-slate-100 overflow-x-auto">
            <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors shrink-0",
                  filter === f ? "bg-[#1E3A5F] text-white" : "text-slate-500 hover:bg-slate-100"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filtered.map((conv) => {
              const lead = getLeadById(conv.leadId)
              const cm = REPLY_CLASS_META[conv.classification]
              const last = conv.messages[conv.messages.length - 1]
              if (!lead) return null
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveId(conv.id)}
                  className={cn(
                    "w-full text-left flex items-start gap-3 px-4 py-3 transition-colors",
                    activeId === conv.id ? "bg-[#E8F0FB]" : "hover:bg-slate-50"
                  )}
                >
                  <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-xs font-semibold", lead.avatarColor)}>
                    {getInitials(`${lead.firstName} ${lead.lastName}`)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className={cn("text-sm truncate", conv.unread ? "font-bold text-[#0F1B35]" : "font-medium text-slate-700")}>
                        {lead.firstName} {lead.lastName}
                      </p>
                      {conv.unread && <span className="h-1.5 w-1.5 rounded-full bg-[#2D5F9A] shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{lead.company}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{last.content}</p>
                  </div>
                  <span className="text-base shrink-0" title={cm.label}>{cm.emoji}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Thread */}
        <div className="flex flex-col bg-slate-50/40 min-h-0">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-white">
            <div className="flex items-center gap-2">
              <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium", meta.pill)}>
                {meta.emoji} {meta.label}
              </span>
              <span className="text-xs text-slate-400">{meta.action}</span>
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1" onClick={handleReclassify} disabled={classifying}>
              {classifying ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              Re-classify
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {active.messages.map((m) => (
              <div key={m.id} className={cn("flex", m.direction === "outbound" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    m.direction === "outbound"
                      ? "bg-[#1E3A5F] text-white rounded-br-sm"
                      : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm"
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
          </div>

          {/* Suggested replies + compose */}
          <div className="border-t border-slate-200 bg-white p-4 space-y-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
                AI suggested replies
              </p>
              <div className="flex flex-col gap-2">
                {active.suggestedReplies.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setDraft(s.content)}
                    className="text-left rounded-lg border border-slate-200 px-3 py-2 hover:border-[#2D5F9A] hover:bg-[#E8F0FB]/40 transition-colors"
                  >
                    <span
                      className={cn(
                        "inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium mb-1",
                        s.tone === "aggressive"
                          ? "bg-red-50 text-red-600"
                          : s.tone === "soft"
                            ? "bg-sky-50 text-sky-700"
                            : "bg-violet-50 text-violet-700"
                      )}
                    >
                      {s.label}
                    </span>
                    <p className="text-xs text-slate-600 leading-snug">{s.content}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-end gap-2">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write a reply or pick a suggestion above…"
                className="min-h-[44px] text-sm resize-none"
              />
              <Button onClick={handleSend} className="bg-[#1E3A5F] hover:bg-[#16304f] text-white h-11 px-4">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Lead context */}
        <div className="hidden lg:block border-l border-slate-200 bg-white overflow-y-auto">
          {activeLead && (
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className={cn("flex h-11 w-11 items-center justify-center rounded-full text-white text-sm font-semibold", activeLead.avatarColor)}>
                  {getInitials(`${activeLead.firstName} ${activeLead.lastName}`)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[#0F1B35] text-sm truncate">
                    {activeLead.firstName} {activeLead.lastName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{activeLead.title}</p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <div>
                  <p className="text-sm font-semibold text-[#0F1B35]">{activeLead.company}</p>
                  <p className="text-[11px] text-slate-400">{activeLead.location}</p>
                </div>
                <ScoreRing score={activeLead.totalScore} />
              </div>

              {activeLead.intentSignals.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Intent signals</p>
                  <div className="flex flex-wrap gap-1.5">
                    {activeLead.intentSignals.map((s, i) => (
                      <IntentBadge key={i} signal={s} />
                    ))}
                  </div>
                </div>
              )}

              {activeLead.researchBrief && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Top hook</p>
                  <p className="text-xs text-slate-600 leading-relaxed rounded-lg bg-[#E8F0FB] p-3">
                    {activeLead.researchBrief.hooks[0]}
                  </p>
                </div>
              )}

              {(active.classification === "hot" || active.classification === "warm") && (
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
                  <CalendarCheck className="h-4 w-4" />
                  Insert booking link
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
