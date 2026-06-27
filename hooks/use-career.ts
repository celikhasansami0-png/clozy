"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { CareerProfile } from "@/types"

export function useCareer() {
  const [profile, setProfile] = useState<CareerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from("career_profiles")
      .select("*")
      .single()
    setProfile((data as CareerProfile) ?? null)
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const saveProfile = async (updates: Omit<CareerProfile, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (profile) {
      const { data, error } = await supabase
        .from("career_profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", profile.id)
        .select().single()
      if (error) throw error
      setProfile(data as CareerProfile)
      return data as CareerProfile
    } else {
      const { data, error } = await supabase
        .from("career_profiles")
        .insert([updates])
        .select().single()
      if (error) throw error
      setProfile(data as CareerProfile)
      return data as CareerProfile
    }
  }

  return { profile, loading, refetch: fetchProfile, saveProfile }
}
