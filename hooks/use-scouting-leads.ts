"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./use-auth"
import { rowToLead, leadToRow } from "@/lib/scouting/serializers"
import { isSupabaseConfigured, genId } from "@/lib/scouting/demo-mode"
import { DEMO_LEADS } from "@/lib/scouting/mock-data"
import type { Lead, PipelineStage } from "@/types/scouting"

function completeLead(partial: Partial<Lead>, userId: string): Lead {
  const now = new Date().toISOString()
  return {
    id: partial.id ?? genId("lead"),
    userId,
    campaignId: partial.campaignId ?? null,
    firstName: partial.firstName ?? "",
    lastName: partial.lastName ?? "",
    title: partial.title ?? "",
    company: partial.company ?? "",
    companyDomain: partial.companyDomain ?? "",
    linkedinUrl: partial.linkedinUrl ?? "",
    avatarColor: partial.avatarColor ?? "bg-slate-500",
    employeeCount: partial.employeeCount ?? 0,
    fundingStage: partial.fundingStage ?? "seed",
    lastFundingDate: partial.lastFundingDate ?? null,
    location: partial.location ?? "",
    techStack: partial.techStack ?? [],
    lastActivity: partial.lastActivity ?? "",
    icpScore: partial.icpScore ?? 0,
    intentScore: partial.intentScore ?? 0,
    engagementScore: partial.engagementScore ?? 0,
    totalScore: partial.totalScore ?? 0,
    intentSignals: partial.intentSignals ?? [],
    researchBrief: partial.researchBrief ?? null,
    stage: partial.stage ?? "prospected",
    status: partial.status ?? "active",
    createdAt: partial.createdAt ?? now,
    updatedAt: now,
    lastContactedAt: partial.lastContactedAt ?? null,
  }
}

function demoSeed(campaignId?: string): Lead[] {
  const seed = campaignId ? DEMO_LEADS.filter((l) => l.campaignId === campaignId) : DEMO_LEADS
  return [...seed].sort((a, b) => b.totalScore - a.totalScore)
}

export function useScoutingLeads(campaignId?: string) {
  const { user } = useAuth()
  const demo = !isSupabaseConfigured()
  const [leads, setLeads] = useState<Lead[]>(() => (demo ? demoSeed(campaignId) : []))
  const [loading, setLoading] = useState(!demo)
  const supabase = createClient()

  const fetchLeads = useCallback(async () => {
    if (demo) {
      setLeads(demoSeed(campaignId))
      setLoading(false)
      return
    }
    if (!user) {
      setLeads([])
      setLoading(false)
      return
    }
    let query = supabase
      .from("scouting_leads")
      .select("*")
      .order("total_score", { ascending: false })
    if (campaignId) query = query.eq("campaign_id", campaignId)
    const { data } = await query
    setLeads((data ?? []).map(rowToLead))
    setLoading(false)
  }, [supabase, user, campaignId, demo])

  useEffect(() => {
    if (demo || !user) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLeads()
  }, [fetchLeads, demo, user])

  const createLeads = async (newLeads: Partial<Lead>[]): Promise<Lead[]> => {
    if (demo) {
      const created = newLeads.map((l) => completeLead(l, user?.id ?? "demo-user"))
      setLeads((prev) => [...created, ...prev].sort((a, b) => b.totalScore - a.totalScore))
      return created
    }
    if (!user) throw new Error("Not authenticated")
    const rows = newLeads.map((l) => ({ ...leadToRow(l), user_id: user.id }))
    const { data, error } = await supabase.from("scouting_leads").insert(rows).select()
    if (error) throw error
    const created = (data ?? []).map(rowToLead)
    setLeads((prev) => [...created, ...prev].sort((a, b) => b.totalScore - a.totalScore))
    return created
  }

  const updateLead = async (id: string, updates: Partial<Lead>): Promise<Lead | null> => {
    if (demo) {
      let updated: Lead | null = null
      setLeads((prev) =>
        prev.map((l) => {
          if (l.id !== id) return l
          updated = { ...l, ...updates, updatedAt: new Date().toISOString() }
          return updated
        })
      )
      return updated
    }
    const { data, error } = await supabase
      .from("scouting_leads")
      .update({ ...leadToRow(updates), updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    const updated = rowToLead(data)
    setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)))
    return updated
  }

  const moveStage = (id: string, stage: PipelineStage) => updateLead(id, { stage })
  const attachResearch = (id: string, researchBrief: Lead["researchBrief"]) =>
    updateLead(id, { researchBrief })

  const deleteLead = async (id: string) => {
    if (!demo) {
      const { error } = await supabase.from("scouting_leads").delete().eq("id", id)
      if (error) throw error
    }
    setLeads((prev) => prev.filter((l) => l.id !== id))
  }

  const byStage = (stage: PipelineStage) => leads.filter((l) => l.stage === stage)

  return {
    leads,
    loading,
    refetch: fetchLeads,
    createLeads,
    updateLead,
    moveStage,
    attachResearch,
    deleteLead,
    byStage,
    total: leads.length,
  }
}
