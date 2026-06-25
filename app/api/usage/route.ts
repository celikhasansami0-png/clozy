import { NextResponse } from "next/server"
import { requireAuth, fail } from "@/lib/api-helpers"
import type { UsageLimits } from "@/types"
import { PLAN_LIMITS } from "@/types"

function currentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

export async function GET() {
  const { user, supabase, unauthorized } = await requireAuth()
  if (unauthorized) return unauthorized

  const month = currentMonth()

  let { data: usage } = await supabase
    .from("usage_limits")
    .select("*")
    .eq("user_id", user.id)
    .eq("month", month)
    .single()

  if (!usage) {
    const { data: created } = await supabase
      .from("usage_limits")
      .insert({
        user_id: user.id,
        month,
        lessons_generated: 0,
        exams_generated: 0,
        assignments_generated: 0,
        projects_generated: 0,
        research_analyses: 0,
        translations: 0,
        semester_plans: 0,
        portfolios_generated: 0,
        reset_at: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
      })
      .select()
      .single()
    usage = created
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single()

  const tier = (profile?.subscription_tier ?? "free") as keyof typeof PLAN_LIMITS
  const limits = PLAN_LIMITS[tier]

  return NextResponse.json({ usage: usage as UsageLimits, limits })
}

export async function POST(request: Request) {
  const { user, supabase, unauthorized } = await requireAuth()
  if (unauthorized) return unauthorized

  try {
    const { field } = await request.json()
    if (!field) return fail("Field is required", 400)

    const month = currentMonth()

    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single()

    const tier = (profile?.subscription_tier ?? "free") as keyof typeof PLAN_LIMITS
    const limits = PLAN_LIMITS[tier]
    if (limits.unlimited) return NextResponse.json({ ok: true })

    let { data: usage } = await supabase
      .from("usage_limits")
      .select("*")
      .eq("user_id", user.id)
      .eq("month", month)
      .single()

    if (!usage) {
      const { data: created } = await supabase
        .from("usage_limits")
        .insert({ user_id: user.id, month, [field]: 0 })
        .select()
        .single()
      usage = created
    }

    const current = (usage as Record<string, number>)[field] ?? 0
    await supabase
      .from("usage_limits")
      .update({ [field]: current + 1 })
      .eq("user_id", user.id)
      .eq("month", month)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("usage increment error:", error)
    return fail("Failed to update usage")
  }
}
