"use client"

import { useAuth } from "./use-auth"
import { PLAN_LIMITS } from "@/types"

export function useSubscription() {
  const { profile, isPro, tier } = useAuth()

  const limits = PLAN_LIMITS[tier ?? "free"]

  const canUseFeature = (feature: keyof typeof limits): boolean => {
    const value = limits[feature]
    if (typeof value === "boolean") return value
    return true
  }

  const hasReachedLimit = (
    feature: "toolkits_per_month" | "leads_max",
    currentCount: number
  ): boolean => {
    const limit = limits[feature]
    if (limit === -1) return false
    return currentCount >= limit
  }

  const getLimit = (feature: "toolkits_per_month" | "leads_max"): number => {
    return limits[feature]
  }

  return {
    tier,
    isPro,
    profile,
    limits,
    canUseFeature,
    hasReachedLimit,
    getLimit,
    stripeCustomerId: profile?.stripe_customer_id,
    stripeSubscriptionId: profile?.stripe_subscription_id,
  }
}
