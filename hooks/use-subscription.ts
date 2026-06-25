"use client"

import { useAuth } from "./use-auth"
import { PLAN_LIMITS } from "@/types"
import type { SubscriptionTier } from "@/types"

export function useSubscription() {
  const { profile, isPro, tier } = useAuth()

  const safeTier = (tier as SubscriptionTier) ?? "free"
  const limits = PLAN_LIMITS[safeTier] ?? PLAN_LIMITS["free"]

  const canUseFeature = (feature: keyof typeof limits): boolean => {
    const value = limits[feature]
    if (typeof value === "boolean") return value
    return true
  }

  const hasReachedLimit = (
    feature: "lessons_per_month" | "exams_per_month" | "assignments_per_month" | "projects_max",
    currentCount: number
  ): boolean => {
    const limit = limits[feature]
    if (limit === -1) return false
    return currentCount >= limit
  }

  const getLimit = (
    feature: "lessons_per_month" | "exams_per_month" | "assignments_per_month" | "projects_max"
  ): number => {
    return limits[feature]
  }

  return {
    tier: safeTier,
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
