"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import type { UserProfile } from "@/types"

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
  })

  const supabase = createClient()

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()
    return data as UserProfile | null
  }, [supabase])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null
      const profile = user ? await fetchProfile(user.id) : null
      setState({ user, profile, loading: false })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        const user = session?.user ?? null
        const profile = user ? await fetchProfile(user.id) : null
        setState({ user, profile, loading: false })
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile, supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/auth/login"
  }

  const refreshProfile = async () => {
    if (!state.user) return
    const profile = await fetchProfile(state.user.id)
    setState((prev) => ({ ...prev, profile }))
  }

  return {
    user: state.user,
    profile: state.profile,
    loading: state.loading,
    signOut,
    refreshProfile,
    isAuthenticated: !!state.user,
    isPro: state.profile?.subscription_tier === "student_pro" || state.profile?.subscription_tier === "team_pro" || state.profile?.subscription_tier === "university",
    tier: state.profile?.subscription_tier ?? "free",
  }
}
