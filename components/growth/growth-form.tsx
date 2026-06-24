"use client"

import { useState } from "react"
import { Loader2, Zap, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { NICHE_LIST } from "@/lib/niches"
import type { GrowthInput, NicheId } from "@/types"
import { estimateMonthlyLeads } from "@/services/growth-generator"
import { formatCurrency } from "@/lib/utils"

interface GrowthFormProps {
  onSubmit: (input: GrowthInput) => Promise<void>
  loading: boolean
}

const CHALLENGES = [
  "Inconsistent lead flow",
  "Low response rates",
  "Hard to close high-ticket",
  "Too much competition",
  "No content strategy",
  "Poor positioning",
]

export function GrowthForm({ onSubmit, loading }: GrowthFormProps) {
  const [formData, setFormData] = useState<Partial<GrowthInput>>({
    niche: "coaches",
    offer_price: 3000,
    revenue_goal: 30000,
  })
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([])

  const estimate = formData.offer_price && formData.revenue_goal
    ? estimateMonthlyLeads({
        ...formData,
        offer_price: formData.offer_price,
        revenue_goal: formData.revenue_goal,
        niche: formData.niche as NicheId ?? "coaches",
        business_type: formData.business_type ?? "",
        service: formData.service ?? "",
        target_client: formData.target_client ?? "",
      })
    : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.business_type || !formData.niche || !formData.service || !formData.target_client) return

    await onSubmit({
      business_type: formData.business_type,
      niche: formData.niche as NicheId,
      service: formData.service,
      target_client: formData.target_client,
      offer_price: formData.offer_price ?? 3000,
      revenue_goal: formData.revenue_goal ?? 30000,
      current_clients: formData.current_clients,
      main_challenges: selectedChallenges,
    })
  }

  const toggleChallenge = (c: string) => {
    setSelectedChallenges((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form */}
      <div className="lg:col-span-2">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Details */}
          <Card>
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
              <CardDescription>Tell us about your business so we can tailor your growth system.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="business_type">Business Type</Label>
                  <Input
                    id="business_type"
                    placeholder="e.g. Marketing Agency, Coaching"
                    value={formData.business_type ?? ""}
                    onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="niche">Target Niche</Label>
                  <Select
                    value={formData.niche}
                    onValueChange={(v) => setFormData({ ...formData, niche: v as NicheId })}
                  >
                    <SelectTrigger id="niche">
                      <SelectValue placeholder="Select niche..." />
                    </SelectTrigger>
                    <SelectContent>
                      {NICHE_LIST.map((n) => (
                        <SelectItem key={n.id} value={n.id}>
                          {n.icon} {n.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="service">Your Service / Offer</Label>
                <Input
                  id="service"
                  placeholder="e.g. Done-for-you LinkedIn lead generation"
                  value={formData.service ?? ""}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="target_client">Ideal Target Client</Label>
                <Textarea
                  id="target_client"
                  placeholder="e.g. B2B SaaS companies with 10-50 employees, $1M-$10M ARR, struggling with enterprise sales"
                  value={formData.target_client ?? ""}
                  onChange={(e) => setFormData({ ...formData, target_client: e.target.value })}
                  required
                  className="h-20"
                />
              </div>
            </CardContent>
          </Card>

          {/* Revenue Goals */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Goals</CardTitle>
              <CardDescription>This shapes your outreach targets and execution plan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="offer_price">Offer Price ($)</Label>
                  <Input
                    id="offer_price"
                    type="number"
                    min={100}
                    placeholder="3000"
                    value={formData.offer_price ?? ""}
                    onChange={(e) => setFormData({ ...formData, offer_price: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="revenue_goal">Monthly Revenue Goal ($)</Label>
                  <Input
                    id="revenue_goal"
                    type="number"
                    min={1000}
                    placeholder="30000"
                    value={formData.revenue_goal ?? ""}
                    onChange={(e) => setFormData({ ...formData, revenue_goal: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="current_clients">Current Clients</Label>
                  <Input
                    id="current_clients"
                    type="number"
                    min={0}
                    placeholder="0"
                    value={formData.current_clients ?? ""}
                    onChange={(e) => setFormData({ ...formData, current_clients: Number(e.target.value) })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Challenges */}
          <Card>
            <CardHeader>
              <CardTitle>Main Challenges</CardTitle>
              <CardDescription>Select all that apply to personalize your strategy.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {CHALLENGES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleChallenge(c)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      selectedChallenges.includes(c)
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-11 gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating your growth system...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Generate Growth System
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Sidebar estimate */}
      <div className="space-y-4">
        {estimate && (
          <Card className="border-indigo-100">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-600" />
                <CardTitle className="text-sm">Revenue Projection</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="space-y-2">
                {[
                  { label: "Connections/day", value: `${estimate.connections_per_day}` },
                  { label: "Acceptance rate", value: `${(estimate.acceptance_rate * 100).toFixed(0)}%` },
                  { label: "Reply rate", value: `${(estimate.reply_rate * 100).toFixed(0)}%` },
                  { label: "Calls booked/mo", value: `${Math.ceil(estimate.connections_per_day * 22 * estimate.acceptance_rate * estimate.reply_rate * estimate.call_booking_rate)}` },
                  { label: "Clients/month", value: `${estimate.estimated_clients_per_month}` },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{item.label}</span>
                    <span className="font-semibold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Est. Monthly Revenue</span>
                  <span className="text-base font-bold text-emerald-600">
                    {formatCurrency(estimate.estimated_revenue)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="pt-4 pb-4">
            <h4 className="text-xs font-semibold text-slate-700 mb-2">What you&apos;ll get:</h4>
            <ul className="space-y-1.5">
              {[
                "Positioning map & UVP",
                "6-step outreach sequence",
                "Content strategy & hooks",
                "Closing framework & scripts",
                "7-day execution plan",
                "Objection handlers",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
