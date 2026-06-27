import { NextResponse } from "next/server"
import { requireAuth, fail } from "@/lib/api-helpers"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const auth = await requireAuth()
  if (auth.unauthorized) return auth.unauthorized

  const subscription = await req.json()
  if (!subscription?.endpoint) return fail("Invalid subscription", 400)

  const supabase = await createClient()

  // Upsert subscription (one per endpoint)
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: auth.user.id,
      endpoint: subscription.endpoint,
      keys: subscription.keys ?? {},
    },
    { onConflict: "endpoint" }
  )

  if (error) return fail("Failed to save subscription")
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const auth = await requireAuth()
  if (auth.unauthorized) return auth.unauthorized

  const { endpoint } = await req.json()
  if (!endpoint) return fail("Missing endpoint", 400)

  const supabase = await createClient()
  await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint).eq("user_id", auth.user.id)
  return NextResponse.json({ ok: true })
}
