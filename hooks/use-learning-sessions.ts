"use client"

import { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { LearningSession } from "@/types"

export function useLearningSession() {
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const saveSession = useCallback(
    async (params: { duration_minutes: number; topic?: string; course_id?: string | null; mastery_score?: number | null }) => {
      setSaving(true)
      try {
        const { error } = await supabase.from("learning_sessions").insert([{
          duration_minutes: params.duration_minutes,
          topic: params.topic ?? null,
          course_id: params.course_id ?? null,
          mastery_score: params.mastery_score ?? null,
        }])
        if (error) throw error
      } finally {
        setSaving(false)
      }
    },
    [supabase],
  )

  const fetchSessions = useCallback(async (): Promise<LearningSession[]> => {
    const { data } = await supabase
      .from("learning_sessions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)
    return (data as LearningSession[]) ?? []
  }, [supabase])

  return { saveSession, fetchSessions, saving }
}
