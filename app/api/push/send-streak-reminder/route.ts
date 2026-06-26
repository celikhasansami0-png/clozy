import { NextResponse } from "next/server"
import { requireAuth, fail } from "@/lib/api-helpers"
import { createClient } from "@/lib/supabase/server"
import webpush from "web-push"

function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT ?? "mailto:support@autopilot-os.com"

  if (!publicKey || !privateKey) return false

  webpush.setVapidDetails(subject, publicKey, privateKey)
  return true
}

export async function POST(req: Request) {
  const auth = await requireAuth()
  if (auth.unauthorized) return auth.unauthorized

  if (!configureWebPush()) {
    return NextResponse.json({ ok: false, reason: "VAPID keys not configured" })
  }

  const supabase = await createClient()

  // Get all push subscriptions for this user
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", auth.user.id)

  if (!subs?.length) return NextResponse.json({ ok: true, sent: 0 })

  const payload = JSON.stringify({
    title: "Study today to keep your streak! 🔥",
    body: "You haven't studied yet today. Open Autopilot OS and review some flashcards.",
    url: "/flashcards",
    icon: "/icons/icon-192.png",
  })

  let sent = 0
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys },
        payload
      )
      sent++
    } catch (err: unknown) {
      // Remove expired subscriptions (410 Gone)
      if (err instanceof Error && "statusCode" in err && (err as { statusCode: number }).statusCode === 410) {
        await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint)
      }
    }
  }

  return NextResponse.json({ ok: true, sent })
}
