"use client"

import { useState } from "react"
import { Building2, ArrowRight, MoveRight } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/layout/page-header"
import { Badge } from "@/components/ui/badge"
import { DEMO_LEADS } from "@/lib/scouting/mock-data"
import { PIPELINE_STAGES, STAGE_COLORS } from "@/lib/scouting/constants"
import { ScoreRing } from "@/components/scouting/score-ring"
import { IntentBadge } from "@/components/scouting/intent-badge"
import { cn, getInitials, relativeTime } from "@/lib/utils"
import type { Lead, PipelineStage } from "@/types/scouting"

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>(DEMO_LEADS)

  function moveLead(id: string, stage: PipelineStage) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, stage, updatedAt: new Date().toISOString() } : l)))
    const label = PIPELINE_STAGES.find((s) => s.id === stage)?.label
    toast.success(`Moved to ${label}`)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-1px)]">
      <PageHeader
        title="Pipeline"
        description="Every lead, every stage — drag through to closed won."
        actions={
          <Badge variant="secondary" className="h-7 px-3">
            {leads.length} leads
          </Badge>
        }
      />

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="flex gap-3 h-full min-w-max">
          {PIPELINE_STAGES.map((stage) => {
            const stageLeads = leads.filter((l) => l.stage === stage.id)
            return (
              <div key={stage.id} className="w-[260px] flex flex-col">
                <div className={cn("flex items-center justify-between rounded-lg border px-3 py-2 mb-2", STAGE_COLORS[stage.id])}>
                  <span className="text-xs font-semibold">{stage.label}</span>
                  <span className="text-[11px] font-bold rounded-full bg-white/60 px-1.5">{stageLeads.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {stageLeads.map((lead) => (
                    <PipelineCard key={lead.id} lead={lead} onMove={moveLead} />
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="rounded-lg border border-dashed border-slate-200 py-6 text-center">
                      <p className="text-[11px] text-slate-300">Empty</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function PipelineCard({ lead, onMove }: { lead: Lead; onMove: (id: string, stage: PipelineStage) => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const currentIdx = PIPELINE_STAGES.findIndex((s) => s.id === lead.stage)
  const nextStage = PIPELINE_STAGES[currentIdx + 1]

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-start gap-2.5">
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-[11px] font-semibold", lead.avatarColor)}>
          {getInitials(`${lead.firstName} ${lead.lastName}`)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#0F1B35] truncate leading-tight">
            {lead.firstName} {lead.lastName}
          </p>
          <p className="text-[11px] text-slate-500 truncate">{lead.title}</p>
        </div>
        <ScoreRing score={lead.totalScore} size={32} />
      </div>

      <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-400">
        <Building2 className="h-3 w-3" />
        <span className="truncate">{lead.company}</span>
      </div>

      {lead.intentSignals[0] && (
        <div className="mt-2">
          <IntentBadge signal={lead.intentSignals[0]} />
        </div>
      )}

      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-100">
        <span className="text-[10px] text-slate-400">{relativeTime(lead.updatedAt)}</span>
        {nextStage ? (
          <button
            onClick={() => onMove(lead.id, nextStage.id)}
            className="inline-flex items-center gap-1 text-[10px] font-medium text-[#2D5F9A] hover:underline"
            title={`Move to ${nextStage.label}`}
          >
            {nextStage.label}
            <ArrowRight className="h-3 w-3" />
          </button>
        ) : (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 hover:text-slate-600"
            >
              <MoveRight className="h-3 w-3" /> Move
            </button>
            {menuOpen && (
              <div className="absolute right-0 bottom-5 z-10 w-40 rounded-lg border border-slate-200 bg-white shadow-lg py-1">
                {PIPELINE_STAGES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onMove(lead.id, s.id)
                      setMenuOpen(false)
                    }}
                    className="block w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
