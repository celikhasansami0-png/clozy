"use client"

import { MapPin, Building2, Sparkles, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScoreRing } from "./score-ring"
import { IntentBadge } from "./intent-badge"
import type { Lead } from "@/types/scouting"
import { getInitials } from "@/lib/utils"

interface LeadCardProps {
  lead: Lead
  onResearch?: (lead: Lead) => void
  researching?: boolean
  selected?: boolean
  onSelect?: (lead: Lead) => void
}

export function LeadCard({ lead, onResearch, researching, selected, onSelect }: LeadCardProps) {
  return (
    <div
      onClick={() => onSelect?.(lead)}
      className={cn(
        "rounded-xl border bg-white p-4 transition-all",
        onSelect && "cursor-pointer hover:shadow-sm",
        selected ? "border-[#2D5F9A] ring-1 ring-[#2D5F9A]" : "border-slate-200 hover:border-slate-300"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white text-xs font-semibold",
              lead.avatarColor
            )}
          >
            {getInitials(`${lead.firstName} ${lead.lastName}`)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[#0F1B35] text-sm leading-tight truncate">
              {lead.firstName} {lead.lastName}
            </p>
            <p className="text-xs text-slate-500 truncate">{lead.title}</p>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-0.5">
                <Building2 className="h-3 w-3" />
                {lead.company}
              </span>
              <span className="inline-flex items-center gap-0.5">
                <MapPin className="h-3 w-3" />
                {lead.location}
              </span>
            </div>
          </div>
        </div>
        <ScoreRing score={lead.totalScore} />
      </div>

      {/* Intent signals */}
      {lead.intentSignals.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {lead.intentSignals.slice(0, 3).map((s, i) => (
            <IntentBadge key={i} signal={s} />
          ))}
        </div>
      )}

      {/* Last activity + research */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
        <p className="text-[11px] text-slate-400 truncate pr-2">{lead.lastActivity}</p>
        {onResearch && (
          <Button
            size="sm"
            variant={lead.researchBrief ? "outline" : "default"}
            className={cn(
              "h-7 text-[11px] shrink-0",
              !lead.researchBrief && "bg-[#1E3A5F] hover:bg-[#16304f] text-white"
            )}
            onClick={(e) => {
              e.stopPropagation()
              onResearch(lead)
            }}
            disabled={researching}
          >
            {researching ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            {lead.researchBrief ? "Researched" : "Research"}
          </Button>
        )}
      </div>
    </div>
  )
}
