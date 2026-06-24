"use client"

import { useState } from "react"
import { Crown, Check, Loader2, ExternalLink, Zap } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useSubscription } from "@/hooks/use-subscription"
import { PRICING_PLANS } from "@/lib/constants"
import { toast } from "sonner"

export default function BillingPage() {
  const { tier, isPro, profile, stripeCustomerId } = useSubscription()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

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
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/billing`,
        }),
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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Your active subscription</CardDescription>
              </div>
              <Badge variant={isPro ? "purple" : "secondary"} className="text-sm px-3 py-1">
                {isPro ? (
                  <><Crown className="mr-1.5 h-3.5 w-3.5" /> Pro</>
                ) : (
                  "Free"
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isPro ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-4">
                  <p className="text-sm font-medium text-indigo-900">
                    You&apos;re on the Pro plan — unlimited growth systems, leads, templates, and advanced AI.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {PRO_FEATURES.map((f) => (
                    <div key={f} className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      {f}
                    </div>
                  ))}
                </div>
                {stripeCustomerId && (
                  <Button
                    variant="outline"
                    onClick={handleManageBilling}
                    disabled={loadingPlan === "portal"}
                    className="gap-2"
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
                    You&apos;re on the Free plan. Upgrade to Pro for unlimited access.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-500" /> 2 growth systems/month
                  </div>
                  <div className="flex items-center gap-1.5 opacity-50">
                    ✗ Unlimited systems
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-500" /> 25 leads max
                  </div>
                  <div className="flex items-center gap-1.5 opacity-50">
                    ✗ Unlimited leads
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plans */}
        {!isPro && (
          <>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Upgrade to Pro</h2>
              <p className="text-sm text-slate-500 mb-6">
                Unlock unlimited everything and accelerate your LinkedIn growth.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PRICING_PLANS.filter((p) => p.tier === "pro").map((plan) => (
                  <div
                    key={plan.id}
                    className={`rounded-xl border-2 p-6 relative ${
                      plan.highlighted
                        ? "border-indigo-600 bg-white"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    {plan.highlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                          <Crown className="h-3 w-3" /> Most Popular
                        </span>
                      </div>
                    )}

                    <h3 className="font-semibold text-slate-900">{plan.name}</h3>
                    <div className="mt-2 mb-4">
                      <span className="text-3xl font-bold text-slate-900">${plan.price}</span>
                      <span className="text-slate-500">/{plan.interval === "month" ? "mo" : "yr"}</span>
                      {plan.interval === "year" && (
                        <Badge variant="success" className="ml-2 text-[10px]">Save 20%</Badge>
                      )}
                    </div>

                    <ul className="space-y-2 mb-6">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                          <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handleUpgrade(plan.id, plan.stripe_price_id)}
                      disabled={!!loadingPlan}
                      className={`w-full ${
                        plan.highlighted
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                          : ""
                      } gap-2`}
                      variant={plan.highlighted ? "default" : "outline"}
                    >
                      {loadingPlan === plan.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4" />
                      )}
                      {plan.cta}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500 text-center">
                30-day money-back guarantee · Cancel anytime · Secure payment via Stripe
              </p>
            </div>
          </>
        )}

        {/* Feature Comparison */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Plan Comparison</h2>
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="py-3 px-4 text-left font-medium text-slate-700">Feature</th>
                  <th className="py-3 px-4 text-center font-medium text-slate-700">Free</th>
                  <th className="py-3 px-4 text-center font-semibold text-indigo-700">Pro</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                    <td className="py-2.5 px-4 text-slate-700">{row.feature}</td>
                    <td className="py-2.5 px-4 text-center text-slate-500">{row.free}</td>
                    <td className="py-2.5 px-4 text-center font-medium text-indigo-600">{row.pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

const PRO_FEATURES = [
  "Unlimited growth systems",
  "Unlimited leads",
  "Full template library",
  "Advanced AI scripts",
  "Analytics dashboard",
  "CSV export",
  "Priority support",
]

const COMPARISON_ROWS = [
  { feature: "Growth systems/month", free: "2", pro: "Unlimited" },
  { feature: "Leads in CRM", free: "25", pro: "Unlimited" },
  { feature: "Template library access", free: "✗", pro: "✓" },
  { feature: "Advanced AI scripts", free: "✗", pro: "✓" },
  { feature: "14-day execution plans", free: "✗", pro: "✓" },
  { feature: "Analytics dashboard", free: "Basic", pro: "Full" },
  { feature: "CSV export", free: "✗", pro: "✓" },
  { feature: "Priority support", free: "✗", pro: "✓" },
  { feature: "Team members", free: "1", pro: "5" },
]
