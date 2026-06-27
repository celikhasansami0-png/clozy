"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./use-auth"
import { rowToCampaign, campaignToRow } from "@/lib/scouting/serializers"
import { isSupabaseConfigured, genId } from "@/lib/scouting/demo-mode"
import { DEMO_CAMPAIGNS } from "@/lib/scouting/mock-data"
import type { Campaign } from "@/types/scouting"

function completeCampaign(c: Partial<Campaign>, userId: string): Campaign {
  const now = new Date().toISOString()
  return {
    id: c.id ?? genId("camp"),
    userId,
    name: c.name ?? "Untitled campaign",
    description: c.description ?? "",
    type: c.type ?? "cold_outreach",
    status: c.status ?? "draft",
    icpId: c.icpId ?? null,
    dailyConnectionLimit: c.dailyConnectionLimit ?? 20,
    dailyMessageLimit: c.dailyMessageLimit ?? 50,
    activeHoursStart: c.activeHoursStart ?? "09:00",
    activeHoursEnd: c.activeHoursEnd ?? "18:00",
    activeDays: c.activeDays ?? ["mon", "tue", "wed", "thu", "fri"],
    timezone: c.timezone ?? "America/New_York",
    sequence: c.sequence ?? [],
    totalLeads: c.totalLeads ?? 0,
    connectionsSent: c.connectionsSent ?? 0,
    connectionsAccepted: c.connectionsAccepted ?? 0,
    messagesSent: c.messagesSent ?? 0,
    repliesReceived: c.repliesReceived ?? 0,
    meetingsBooked: c.meetingsBooked ?? 0,
    createdAt: now,
    updatedAt: now,
  }
}

export function useCampaigns() {
  const { user } = useAuth()
  const demo = !isSupabaseConfigured()
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => (demo ? DEMO_CAMPAIGNS : []))
  const [loading, setLoading] = useState(!demo)
  const supabase = createClient()

  const fetchCampaigns = useCallback(async () => {
    if (demo) {
      setCampaigns(DEMO_CAMPAIGNS)
      setLoading(false)
      return
    }
    if (!user) {
      setCampaigns([])
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from("scouting_campaigns")
      .select("*")
      .order("created_at", { ascending: false })
    setCampaigns((data ?? []).map(rowToCampaign))
    setLoading(false)
  }, [supabase, user, demo])

  useEffect(() => {
    if (demo || !user) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCampaigns()
  }, [fetchCampaigns, demo, user])

  const createCampaign = async (c: Partial<Campaign>): Promise<Campaign> => {
    if (demo) {
      const created = completeCampaign(c, user?.id ?? "demo-user")
      setCampaigns((prev) => [created, ...prev])
      return created
    }
    if (!user) throw new Error("Not authenticated")
    const { data, error } = await supabase
      .from("scouting_campaigns")
      .insert({ ...campaignToRow(c), user_id: user.id })
      .select()
      .single()
    if (error) throw error
    const created = rowToCampaign(data)
    setCampaigns((prev) => [created, ...prev])
    return created
  }

  const updateCampaign = async (id: string, updates: Partial<Campaign>): Promise<Campaign> => {
    if (demo) {
      let updated = completeCampaign(updates, user?.id ?? "demo-user")
      setCampaigns((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c
          updated = { ...c, ...updates, updatedAt: new Date().toISOString() }
          return updated
        })
      )
      return updated
    }
    const { data, error } = await supabase
      .from("scouting_campaigns")
      .update({ ...campaignToRow(updates), updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    const updated = rowToCampaign(data)
    setCampaigns((prev) => prev.map((c) => (c.id === id ? updated : c)))
    return updated
  }

  const deleteCampaign = async (id: string) => {
    if (!demo) {
      const { error } = await supabase.from("scouting_campaigns").delete().eq("id", id)
      if (error) throw error
    }
    setCampaigns((prev) => prev.filter((c) => c.id !== id))
  }

  return {
    campaigns,
    loading,
    refetch: fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    total: campaigns.length,
  }
}
