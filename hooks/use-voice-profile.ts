"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./use-auth"
import { rowToVoiceProfile, voiceProfileToRow } from "@/lib/scouting/serializers"
import { isSupabaseConfigured, genId } from "@/lib/scouting/demo-mode"
import { DEMO_VOICE_PROFILE } from "@/lib/scouting/mock-data"
import type { VoiceProfile } from "@/types/scouting"

export function useVoiceProfile() {
  const { user } = useAuth()
  const demo = !isSupabaseConfigured()
  const [voice, setVoice] = useState<VoiceProfile | null>(() => (demo ? DEMO_VOICE_PROFILE : null))
  const [loading, setLoading] = useState(!demo)
  const supabase = createClient()

  const fetchVoice = useCallback(async () => {
    if (demo) {
      setVoice(DEMO_VOICE_PROFILE)
      setLoading(false)
      return
    }
    if (!user) {
      setVoice(null)
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from("scouting_voice_profiles")
      .select("*")
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle()
    setVoice(data ? rowToVoiceProfile(data) : null)
    setLoading(false)
  }, [supabase, user, demo])

  useEffect(() => {
    if (demo || !user) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchVoice()
  }, [fetchVoice, demo, user])

  // Insert a new version (keeps history); returns the saved profile.
  const saveVoice = async (v: Partial<VoiceProfile>): Promise<VoiceProfile> => {
    const nextVersion = (voice?.version ?? 0) + 1
    if (demo) {
      const now = new Date().toISOString()
      const saved: VoiceProfile = {
        id: genId("voice"),
        userId: user?.id ?? "demo-user",
        formalityLevel: v.formalityLevel ?? voice?.formalityLevel ?? 3,
        avgMessageLength: v.avgMessageLength ?? voice?.avgMessageLength ?? 300,
        openingStyle: v.openingStyle ?? voice?.openingStyle ?? "observation",
        usesHumor: v.usesHumor ?? voice?.usesHumor ?? false,
        characteristicPhrases: v.characteristicPhrases ?? voice?.characteristicPhrases ?? [],
        phrasesToAvoid: v.phrasesToAvoid ?? voice?.phrasesToAvoid ?? [],
        signOffStyle: v.signOffStyle ?? voice?.signOffStyle ?? "",
        trainingMessages: v.trainingMessages ?? voice?.trainingMessages ?? [],
        version: nextVersion,
        createdAt: voice?.createdAt ?? now,
        updatedAt: now,
      }
      setVoice(saved)
      return saved
    }
    if (!user) throw new Error("Not authenticated")
    const { data, error } = await supabase
      .from("scouting_voice_profiles")
      .insert({ ...voiceProfileToRow({ ...v, version: nextVersion }), user_id: user.id })
      .select()
      .single()
    if (error) throw error
    const saved = rowToVoiceProfile(data)
    setVoice(saved)
    return saved
  }

  return { voice, loading, refetch: fetchVoice, saveVoice }
}
