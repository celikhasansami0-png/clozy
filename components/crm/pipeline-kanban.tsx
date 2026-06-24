"use client"

import { useState } from "react"
import {
  MoreHorizontal,
  Edit,
  Trash2,
  ExternalLink,
  Mail,
  Phone,
  GripVertical,
  MessageSquare,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Lead, LeadStage } from "@/types"
import { LEAD_STAGES } from "@/lib/constants"
import { formatCurrency, relativeTime, getInitials } from "@/lib/utils"

const STAGE_COLORS: Record<LeadStage, string> = {
  new: "bg-slate-100 text-slate-600",
  contacted: "bg-blue-100 text-blue-700",
  replied: "bg-purple-100 text-purple-700",
  booked: "bg-amber-100 text-amber-700",
  closed: "bg-emerald-100 text-emerald-700",
  lost: "bg-red-100 text-red-600",
}

const STAGE_HEADER_COLORS: Record<LeadStage, string> = {
  new: "border-slate-300 bg-slate-50",
  contacted: "border-blue-200 bg-blue-50",
  replied: "border-purple-200 bg-purple-50",
  booked: "border-amber-200 bg-amber-50",
  closed: "border-emerald-200 bg-emerald-50",
  lost: "border-red-200 bg-red-50",
}

interface LeadCardProps {
  lead: Lead
  onEdit: (lead: Lead) => void
  onDelete: (id: string) => void
  onStageChange: (id: string, stage: LeadStage) => void
}

function LeadCard({ lead, onEdit, onDelete, onStageChange }: LeadCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md transition-shadow group">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
            {getInitials(lead.name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{lead.name}</p>
            {lead.company && (
              <p className="text-xs text-slate-400 truncate">{lead.company}</p>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onEdit(lead)}>
              <Edit className="mr-2 h-3.5 w-3.5" /> Edit
            </DropdownMenuItem>
            {lead.linkedin_url && (
              <DropdownMenuItem asChild>
                <a href={lead.linkedin_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-3.5 w-3.5" /> View LinkedIn
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={() => onDelete(lead.id)}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Deal value */}
      {lead.deal_value && (
        <p className="text-xs font-semibold text-emerald-600 mb-2">
          {formatCurrency(lead.deal_value)}
        </p>
      )}

      {/* Notes preview */}
      {lead.notes && (
        <div className="flex items-start gap-1.5 mb-2">
          <MessageSquare className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 line-clamp-2">{lead.notes}</p>
        </div>
      )}

      {/* Quick contact */}
      <div className="flex items-center gap-1">
        {lead.email && (
          <a href={`mailto:${lead.email}`} className="rounded p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <Mail className="h-3 w-3" />
          </a>
        )}
        {lead.phone && (
          <a href={`tel:${lead.phone}`} className="rounded p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <Phone className="h-3 w-3" />
          </a>
        )}
        {lead.linkedin_url && (
          <a href={lead.linkedin_url} target="_blank" rel="noopener noreferrer" className="rounded p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
        {lead.last_contact_at && (
          <span className="ml-auto text-[10px] text-slate-400">
            {relativeTime(lead.last_contact_at)}
          </span>
        )}
      </div>

      {/* Move to next stage */}
      <div className="mt-2 pt-2 border-t border-slate-100">
        <Select
          currentStage={lead.stage}
          onChange={(stage) => onStageChange(lead.id, stage)}
        />
      </div>
    </div>
  )
}

function Select({ currentStage, onChange }: { currentStage: LeadStage; onChange: (s: LeadStage) => void }) {
  return (
    <select
      value={currentStage}
      onChange={(e) => onChange(e.target.value as LeadStage)}
      className="w-full rounded text-[11px] border-slate-200 bg-slate-50 py-1 px-1.5 text-slate-600 cursor-pointer"
      style={{ border: "1px solid #e2e8f0" }}
    >
      {LEAD_STAGES.map((s) => (
        <option key={s.id} value={s.id}>{s.label}</option>
      ))}
    </select>
  )
}

interface PipelineKanbanProps {
  leads: Lead[]
  onEditLead: (lead: Lead) => void
  onDeleteLead: (id: string) => void
  onStageChange: (id: string, stage: LeadStage) => void
}

export function PipelineKanban({ leads, onEditLead, onDeleteLead, onStageChange }: PipelineKanbanProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {LEAD_STAGES.map((stage) => {
        const stageLeads = leads.filter((l) => l.stage === stage.id)
        const stageValue = stageLeads.reduce((sum, l) => sum + (l.deal_value ?? 0), 0)

        return (
          <div key={stage.id} className="flex-none w-[280px]">
            {/* Column Header */}
            <div className={`rounded-lg border px-3 py-2.5 mb-3 ${STAGE_HEADER_COLORS[stage.id]}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800">{stage.label}</span>
                  <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-xs font-semibold text-slate-600">
                    {stageLeads.length}
                  </span>
                </div>
                {stageValue > 0 && (
                  <span className="text-xs font-medium text-slate-500">
                    {formatCurrency(stageValue)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">{stage.description}</p>
            </div>

            {/* Cards */}
            <div className="space-y-2.5">
              {stageLeads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onEdit={onEditLead}
                  onDelete={onDeleteLead}
                  onStageChange={onStageChange}
                />
              ))}

              {stageLeads.length === 0 && (
                <div className="rounded-lg border-2 border-dashed border-slate-200 py-8 text-center">
                  <p className="text-xs text-slate-400">No leads here</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
