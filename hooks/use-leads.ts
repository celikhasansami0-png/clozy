"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Lead, LeadStage } from "@/types"

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setLeads(data as Lead[])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const createLead = async (lead: Omit<Lead, "id" | "user_id" | "created_at" | "updated_at">) => {
    const { data, error } = await supabase
      .from("leads")
      .insert([lead])
      .select()
      .single()

    if (error) throw error
    setLeads((prev) => [data as Lead, ...prev])
    return data as Lead
  }

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    const { data, error } = await supabase
      .from("leads")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    setLeads((prev) => prev.map((l) => (l.id === id ? (data as Lead) : l)))
    return data as Lead
  }

  const updateLeadStage = async (id: string, stage: LeadStage) => {
    return updateLead(id, { stage })
  }

  const deleteLead = async (id: string) => {
    const { error } = await supabase.from("leads").delete().eq("id", id)
    if (error) throw error
    setLeads((prev) => prev.filter((l) => l.id !== id))
  }

  const leadsByStage = (stage: LeadStage) => leads.filter((l) => l.stage === stage)

  return {
    leads,
    loading,
    error,
    refetch: fetchLeads,
    createLead,
    updateLead,
    updateLeadStage,
    deleteLead,
    leadsByStage,
    total: leads.length,
  }
}
