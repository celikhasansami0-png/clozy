"use client"

import { useState } from "react"
import { Plus, Search, Users, TrendingUp, SlidersHorizontal } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MetricCard } from "@/components/dashboard/metric-card"
import { PipelineKanban } from "@/components/crm/pipeline-kanban"
import { LeadForm } from "@/components/crm/lead-form"
import { useLeads } from "@/hooks/use-leads"
import type { Lead, LeadStage } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { PIPELINE_VALUE_PER_STAGE } from "@/lib/constants"
import { toast } from "sonner"

export default function CRMPage() {
  const { leads, loading, createLead, updateLead, updateLeadStage, deleteLead } = useLeads()
  const [showForm, setShowForm] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [search, setSearch] = useState("")

  const filteredLeads = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      (l.company ?? "").toLowerCase().includes(search.toLowerCase())
  )

  const pipelineValue = leads.reduce((sum, lead) => {
    const weight = PIPELINE_VALUE_PER_STAGE[lead.stage]
    const dealValue = lead.deal_value ?? 0
    return sum + dealValue * weight
  }, 0)

  const replyRate =
    leads.length > 0
      ? (leads.filter((l) => ["replied", "booked", "closed"].includes(l.stage)).length /
          Math.max(leads.filter((l) => l.stage !== "new").length, 1)) *
        100
      : 0

  const handleCreateLead = async (data: Omit<Lead, "id" | "user_id" | "created_at" | "updated_at">) => {
    try {
      await createLead(data)
      toast.success("Lead added!")
    } catch {
      toast.error("Failed to add lead")
    }
  }

  const handleUpdateLead = async (data: Omit<Lead, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!editingLead) return
    try {
      await updateLead(editingLead.id, data)
      setEditingLead(null)
      toast.success("Lead updated!")
    } catch {
      toast.error("Failed to update lead")
    }
  }

  const handleDeleteLead = async (id: string) => {
    if (!confirm("Delete this lead?")) return
    try {
      await deleteLead(id)
      toast.success("Lead deleted")
    } catch {
      toast.error("Failed to delete lead")
    }
  }

  const handleStageChange = async (id: string, stage: LeadStage) => {
    try {
      await updateLeadStage(id, stage)
    } catch {
      toast.error("Failed to update stage")
    }
  }

  return (
    <div>
      <PageHeader
        title="Pipeline & CRM"
        description="Track leads and manage your sales pipeline."
        actions={
          <Button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Lead
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            title="Total Leads"
            value={leads.length}
            icon={Users}
            iconColor="text-indigo-600"
            iconBg="bg-indigo-50"
          />
          <MetricCard
            title="Reply Rate"
            value={`${replyRate.toFixed(1)}%`}
            description="Contacted → Replied"
            icon={TrendingUp}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
          />
          <MetricCard
            title="Weighted Pipeline"
            value={formatCurrency(pipelineValue)}
            description="Probability-adjusted value"
            icon={TrendingUp}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
          />
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search leads..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Kanban */}
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400">Loading pipeline...</div>
        ) : (
          <PipelineKanban
            leads={filteredLeads}
            onEditLead={setEditingLead}
            onDeleteLead={handleDeleteLead}
            onStageChange={handleStageChange}
          />
        )}
      </div>

      {/* Forms */}
      <LeadForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreateLead}
      />
      {editingLead && (
        <LeadForm
          open={!!editingLead}
          onClose={() => setEditingLead(null)}
          onSubmit={handleUpdateLead}
          initialData={editingLead}
        />
      )}
    </div>
  )
}
