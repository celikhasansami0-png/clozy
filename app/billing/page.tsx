"use client"

import { useState } from "react"
import { Check, Loader2, ExternalLink, Crosshair } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useSubscription } from "@/hooks/use-subscription"
import { PRICING_PLANS } from "@/lib/constants"
import { toast } from "sonner"

export default function BillingPage() {
  const { tier, profile, stripeCustomerId } = useSubscription()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const isPro = tier === "student_pro" || tier === "team_pro" || tier === "university"

  const tierLabel = () => {
    switch (tier) {
      case "student_pro": return "Starter"
      case "team_pro": return "Growth"
      case "university": return "Enterprise"
      default: return "Free Trial"
    }
  }

  const handleUpgrade = async (planId: string, stripePriceId: string) => {
    if (!stripePriceId) {
      toast.error("Stripe not configured. Set STRIPE_SECRET_KEY to enable billing.")
      return
    }

    setLoadingPlan(planId)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: stripePriceId,
          successUrl: `${window.location.origin}/billing?success=true`,
          cancelUrl: `${window.location.origin}/billing`,
        }),
      })

      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error ?? "Failed to create checkout session")
      }
    } catch {
      toast.error("Failed to start upgrade flow")
    } finally {
      setLoadingPlan(null)
    }
  }

  const handleManageBilling = async () => {
    setLoadingPlan("portal")
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnUrl: `${window.location.origin}/billing` }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error("Failed to open billing portal")
      }
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Billing & Plans"
        description="Manage your subscription and billing details."
      />

      <div className="p-6 space-y-8 max-w-4xl">
        {/* Current Plan */}
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-900">Current Plan</CardTitle>
                <CardDescription>Your active subscription</CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm px-3 py-1 bg-slate-100 text-slate-700">
                {tierLabel()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isPro ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                  <p className="text-sm text-slate-700">
                    You&apos;re on {tierLabel()} — your outreach engine is fully unlocked.
                  </p>
                </div>
                {stripeCustomerId && (
                  <Button
                    variant="outline"
                    onClick={handleManageBilling}
                    disabled={loadingPlan === "portal"}
                    className="gap-2 border-slate-200"
                  >
                    {loadingPlan === "portal" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ExternalLink className="h-4 w-4" />
                    )}
                    Manage Billing
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                  <p className="text-sm text-slate-600">
                    You&apos;re on the free trial with full Growth access. Pick a plan below to keep
                    your campaigns running after the trial ends.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plans */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">
            {isPro ? "Available Plans" : "Upgrade your plan"}
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Flat monthly pricing. Cancel anytime.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PRICING_PLANS.map((plan) => {
              const isCurrentPlan = tier === plan.tier
              return (
                <div
                  key={plan.id}
                  className={`rounded-xl border-2 p-6 relative ${
                    plan.highlighted
                      ? "border-slate-900 bg-white"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                        <Crosshair className="h-3 w-3" /> Most Popular
                      </span>
                    </div>
                  )}

                  <h3 className="font-semibold text-slate-900">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mb-3 mt-0.5">{plan.description}</p>
                  <div className="mb-5">
                    <span className="text-3xl font-bold text-slate-900">
                      {plan.price === 0 ? "Free" : `$${plan.price}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-slate-400 text-sm ml-1">/{plan.interval}</span>
                    )}
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                        <Check className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {isCurrentPlan ? (
                    <Button variant="outline" className="w-full border-slate-200" disabled>
                      Current plan
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleUpgrade(plan.id, plan.stripe_price_id)}
                      disabled={!!loadingPlan}
                      className={`w-full gap-2 ${
                        plan.highlighted
                          ? "bg-slate-900 hover:bg-slate-800 text-white"
                          : ""
                      }`}
                      variant={plan.highlighted ? "default" : "outline"}
                    >
                      {loadingPlan === plan.id && <Loader2 className="h-4 w-4 animate-spin" />}
                      {plan.cta}
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Feature comparison table */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Plan Comparison</h2>
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="py-3 px-4 text-left font-medium text-slate-700">Feature</th>
                  <th className="py-3 px-4 text-center font-medium text-slate-500">Trial</th>
                  <th className="py-3 px-4 text-center font-medium text-slate-500">Starter</th>
                  <th className="py-3 px-4 text-center font-semibold text-slate-900">Growth</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                    <td className="py-2.5 px-4 text-slate-700">{row.feature}</td>
                    <td className="py-2.5 px-4 text-center text-slate-400">{row.free}</td>
                    <td className="py-2.5 px-4 text-center font-medium text-slate-900">{row.student_pro}</td>
                    <td className="py-2.5 px-4 text-center text-slate-500">{row.team_pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs text-slate-500 text-center">
            14-day free trial · Cancel anytime · Secure payment via Stripe ·
            Annual billing saves 20% — <a href="mailto:hello@scouting.so" className="underline">contact us</a>
          </p>
        </div>
      </div>
    </div>
  )
}

const COMPARISON_ROWS = [
  { feature: "Active campaigns", free: "Unlimited", student_pro: "2", team_pro: "Unlimited" },
  { feature: "Leads per month", free: "1,000", student_pro: "200", team_pro: "1,000" },
  { feature: "AI messages generated", free: "Unlimited", student_pro: "400", team_pro: "Unlimited" },
  { feature: "Voice profiles", free: "3", student_pro: "1", team_pro: "3" },
  { feature: "Intent signals", free: "All 6", student_pro: "Basic", team_pro: "All 6" },
  { feature: "A/B testing", free: "✓", student_pro: "✗", team_pro: "✓" },
  { feature: "CRM integrations", free: "✓", student_pro: "✗", team_pro: "✓" },
  { feature: "Analytics", free: "Advanced", student_pro: "Basic", team_pro: "Advanced" },
  { feature: "Team members", free: "5", student_pro: "1", team_pro: "5" },
  { feature: "Weekly reports", free: "✓", student_pro: "✓", team_pro: "✓" },
  { feature: "Priority support", free: "✓", student_pro: "✗", team_pro: "✓" },
]
