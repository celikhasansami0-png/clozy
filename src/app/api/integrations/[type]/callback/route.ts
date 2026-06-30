import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { exchangeAndStore } from '@/lib/integrations'
import { INTEGRATIONS, type IntegrationId } from '@/config/integrations'

// OAuth callback. Exchanges the code for a token (timeout + try/catch + error
// logging inside exchangeAndStore) and returns the user to Settings.
export async function GET(req: Request, { params }: { params: { type: string } }) {
  const url = new URL(req.url)
  const origin = url.origin
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${origin}/auth`)

  const type = params.type as IntegrationId
  if (!INTEGRATIONS.some(i => i.id === type)) return NextResponse.redirect(`${origin}/dashboard/settings?error=unknown`)

  const code = url.searchParams.get('code')
  if (!code) return NextResponse.redirect(`${origin}/dashboard/settings?error=${type}_denied`)

  const redirectUri = `${origin}/api/integrations/${type}/callback`
  const result = await exchangeAndStore(supabase, user.id, type, code, redirectUri)
  const q = result.ok ? `connected=${type}` : `error=${type}_failed`
  return NextResponse.redirect(`${origin}/dashboard/settings?${q}`)
}
