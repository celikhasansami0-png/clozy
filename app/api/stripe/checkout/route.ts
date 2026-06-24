import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createOrRetrieveCustomer, createCheckoutSession } from "@/services/stripe"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { priceId, successUrl, cancelUrl } = await request.json()

    if (!priceId) {
      return NextResponse.json({ error: "Price ID required" }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, stripe_customer_id")
      .eq("id", user.id)
      .single()

    const customerId = await createOrRetrieveCustomer({
      userId: user.id,
      email: user.email!,
      name: profile?.full_name ?? undefined,
    })

    // Update profile with customer ID
    if (!profile?.stripe_customer_id) {
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id)
    }

    const session = await createCheckoutSession({
      customerId,
      priceId,
      successUrl,
      cancelUrl,
      trialDays: 7,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
