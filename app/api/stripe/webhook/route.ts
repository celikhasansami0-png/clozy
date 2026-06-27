import { NextResponse } from "next/server"
import { constructWebhookEvent } from "@/services/stripe"
import { createClient } from "@/lib/supabase/server"
import type Stripe from "stripe"
import type { SubscriptionTier } from "@/types"

function tierFromPriceId(priceId: string | undefined): SubscriptionTier {
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_TEAM_PRO_PRICE_ID) return "team_pro"
  return "student_pro"
}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = constructWebhookEvent(body, signature)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const priceId = subscription.items.data[0]?.price.id

        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single()

        if (profile) {
          const tier =
            subscription.status === "active" || subscription.status === "trialing"
              ? tierFromPriceId(priceId)
              : "free"

          await supabase
            .from("profiles")
            .update({
              subscription_tier: tier,
              subscription_status: subscription.status,
              stripe_subscription_id: subscription.id,
              updated_at: new Date().toISOString(),
            })
            .eq("id", profile.id)
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single()

        if (profile) {
          await supabase
            .from("profiles")
            .update({
              subscription_tier: "free",
              subscription_status: "canceled",
              stripe_subscription_id: null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", profile.id)
        }
        break
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        console.log("Checkout completed:", session.id)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (error) {
    console.error("Webhook handler error:", error)
    return NextResponse.json({ error: "Handler error" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
