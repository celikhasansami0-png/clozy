import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateGrowthSystem } from "@/services/growth-generator"
import type { GrowthInput } from "@/types"
import { PLAN_LIMITS } from "@/types"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single()

    const tier = profile?.subscription_tier ?? "free"
    const limits = PLAN_LIMITS[tier as keyof typeof PLAN_LIMITS]

    // Check usage limits for free tier
    if (limits.toolkits_per_month !== -1) {
      const startOfMonth = new Date(new Date().setDate(1)).toISOString().split("T")[0]
      const { count } = await supabase
        .from("toolkits")
        .select("*", { count: "exact" })
        .eq("user_id", user.id)
        .gte("created_at", startOfMonth)

      if ((count ?? 0) >= limits.toolkits_per_month) {
        return NextResponse.json(
          {
            error: "Monthly limit reached",
            message: `Free plan allows ${limits.toolkits_per_month} growth systems per month. Upgrade to Pro for unlimited.`,
            upgrade_required: true,
          },
          { status: 429 }
        )
      }
    }

    const input: GrowthInput = await request.json()
    const output = await generateGrowthSystem(input, user.id)

    // Save to database
    const { data: toolkit, error: dbError } = await supabase
      .from("toolkits")
      .insert([{
        user_id: user.id,
        title: `${input.service} — ${input.niche}`,
        niche: input.niche,
        growth_output: output,
        status: "active",
      }])
      .select()
      .single()

    if (dbError) {
      console.error("DB save error:", dbError)
    }

    return NextResponse.json({ output, toolkit_id: toolkit?.id })
  } catch (error) {
    console.error("Growth generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate growth system" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: toolkits } = await supabase
      .from("toolkits")
      .select("id, title, niche, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    return NextResponse.json({ toolkits })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch toolkits" }, { status: 500 })
  }
}
