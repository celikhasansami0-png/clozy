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

  const fetchOrCreateProfile = useCallback(async (user: User): Promise<UserProfile | null> => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (data) return data as UserProfile

    // Auto-create profile if it doesn't exist (e.g. after email/password signup)
    const { data: created } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name ?? null,
        avatar_url: user.user_metadata?.avatar_url ?? null,
        role: "student",
        subscription_tier: "free",
        subscription_status: "inactive",
        language: "en",
      })
      .select()
      .single()

    return (created as UserProfile) ?? null
  }, [supabase])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null
      const profile = user ? await fetchOrCreateProfile(user) : null
      setState({ user, profile, loading: false })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        const user = session?.user ?? null
        const profile = user ? await fetchOrCreateProfile(user) : null
        setState({ user, profile, loading: false })
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchOrCreateProfile, supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/auth/login"
  }

  const refreshProfile = async () => {
    if (!state.user) return
    const profile = await fetchOrCreateProfile(state.user)
    setState((prev) => ({ ...prev, profile }))
  }

  return {
    user: state.user,
    profile: state.profile,
    loading: state.loading,
    signOut,
    refreshProfile,
    isAuthenticated: !!state.user,
    isPro:
      state.profile?.subscription_tier === "student_pro" ||
      state.profile?.subscription_tier === "team_pro" ||
      state.profile?.subscription_tier === "university",
    tier: state.profile?.subscription_tier ?? "free",
  }
}
