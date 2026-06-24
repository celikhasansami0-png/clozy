"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { AnalyticsOverview, Lead, LeadStage } from "@/types"
import { PIPELINE_VALUE_PER_STAGE } from "@/lib/constants"

export function useAnalytics() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)

    const { data: leads } = await supabase.from("leads").select("*")
    const { data: toolkits } = await supabase
      .from("toolkits")
      .select("id")
      .eq("status", "active")

    const allLeads = (leads as Lead[]) ?? []

    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const newLeadsThisMonth = allLeads.filter((l) => l.created_at >= thisMonth).length

    const contacted = allLeads.filter((l) =>
      ["contacted", "replied", "booked", "closed", "lost"].includes(l.stage)
    ).length
    const replied = allLeads.filter((l) =>
      ["replied", "booked", "closed"].includes(l.stage)
    ).length
    const closed = allLeads.filter((l) => l.stage === "closed").length
    const booked = allLeads.filter((l) => l.stage === "booked").length

    const replyRate = contacted > 0 ? (replied / contacted) * 100 : 0
    const conversionRate = allLeads.length > 0 ? (closed / allLeads.length) * 100 : 0

    const pipelineValue = allLeads.reduce((sum, lead) => {
      const weight = PIPELINE_VALUE_PER_STAGE[lead.stage]
      const dealValue = lead.deal_value ?? 1000
      return sum + dealValue * weight
    }, 0)

    const leadsByStage = allLeads.reduce(
      (acc, lead) => {
        acc[lead.stage] = (acc[lead.stage] ?? 0) + 1
        return acc
      },
      {} as Record<LeadStage, number>
    )

    // Build monthly data (last 6 months)
    const months: { month: string; count: number }[] = []
    const revenueByMonth: { month: string; value: number }[] = []

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = d.toLocaleString("default", { month: "short" })
      const start = d.toISOString()
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString()

      const monthLeads = allLeads.filter(
        (l) => l.created_at >= start && l.created_at <= end
      )
      const monthRevenue = allLeads
        .filter(
          (l) =>
            l.stage === "closed" &&
            l.updated_at >= start &&
            l.updated_at <= end
        )
        .reduce((sum, l) => sum + (l.deal_value ?? 0), 0)

      months.push({ month: label, count: monthLeads.length })
      revenueByMonth.push({ month: label, value: monthRevenue })
    }

    setOverview({
      total_leads: allLeads.length,
      new_leads_this_month: newLeadsThisMonth,
      reply_rate: Math.round(replyRate * 10) / 10,
      conversion_rate: Math.round(conversionRate * 10) / 10,
      pipeline_value: Math.round(pipelineValue),
      active_campaigns: toolkits?.length ?? 0,
      meetings_booked: booked,
      deals_closed: closed,
      leads_by_stage: leadsByStage,
      leads_by_month: months,
      revenue_by_month: revenueByMonth,
    })

    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return { overview, loading, refetch: fetchAnalytics }
}
