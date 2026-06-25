import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { SupabaseClient, User } from "@supabase/supabase-js"

type AuthOk = { user: User; supabase: SupabaseClient; unauthorized: null }
type AuthFail = { user: null; supabase: null; unauthorized: NextResponse }

export async function requireAuth(): Promise<AuthOk | AuthFail> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { user: null, supabase: null, unauthorized: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }
  return { user, supabase, unauthorized: null }
}

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status })
}

export function fail(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status })
}
