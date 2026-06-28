"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./use-auth"
import { rowToIcp, icpToRow } from "@/lib/scouting/serializers"
import { isSupabaseConfigured, genId } from "@/lib/scouting/demo-mode"
import { DEMO_ICPS } from "@/lib/scouting/mock-data"
import type { ICP } from "@/types/scouting"

export function useIcps() {
  const { user } = useAuth()
  const demo = !isSupabaseConfigured()
  const [icps, setIcps] = useState<ICP[]>(() => (demo ? DEMO_ICPS : []))
  const [loading, setLoading] = useState(!demo)
  const supabase = createClient()

  const fetchIcps = useCallback(async () => {
    if (demo) {
      setIcps(DEMO_ICPS)
      setLoading(false)
      return
    }
    if (!user) {
      setIcps([])
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from("scouting_icps")
      .select("*")
      .order("created_at", { ascending: false })
    setIcps((data ?? []).map(rowToIcp))
    setLoading(false)
  }, [supabase, user, demo])

  useEffect(() => {
    if (demo || !user) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchIcps()
  }, [fetchIcps, demo, user])

  const createIcp = async (i: Partial<ICP>): Promise<ICP> => {
    if (demo) {
      const now = new Date().toISOString()
      const created: ICP = {
        id: genId("icp"),
        user_id: user?.id ?? "demo-user",
        name: i.name ?? "New ICP",
        industries: i.industries ?? [],
        employeeMin: i.employeeMin ?? 0,
        employeeMax: i.employeeMax ?? 10000,
        fundingStages: i.fundingStages ?? [],
        geographies: i.geographies ?? [],
        jobTitles: i.jobTitles ?? [],
        keywords: i.keywords ?? [],
        exclusions: i.exclusions ?? [],
        createdAt: now,
        updatedAt: now,
      }
      setIcps((prev) => [created, ...prev])
      return created
    }
    if (!user) throw new Error("Not authenticated")
    const { data, error } = await supabase
      .from("scouting_icps")
      .insert({ ...icpToRow(i), user_id: user.id })
      .select()
      .single()
    if (error) throw error
    const created = rowToIcp(data)
    setIcps((prev) => [created, ...prev])
    return created
  }

  const deleteIcp = async (id: string) => {
    if (!demo) {
      const { error } = await supabase.from("scouting_icps").delete().eq("id", id)
      if (error) throw error
    }
    setIcps((prev) => prev.filter((i) => i.id !== id))
  }

  return { icps, loading, refetch: fetchIcps, createIcp, deleteIcp, total: icps.length }
}
