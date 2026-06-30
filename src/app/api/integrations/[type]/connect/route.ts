import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { buildAuthorizeUrl } from '@/lib/integrations'
import { INTEGRATIONS, type IntegrationId } from '@/config/integrations'

// Kick off the OAuth flow. Redirects to the provider, or back to Settings with
// an error if the provider's credentials are not configured.
export async function GET(req: Request, { params }: { params: { type: string } }) {
  const origin = new URL(req.url).origin
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${origin}/auth`)

  const type = params.type as IntegrationId
  if (!INTEGRATIONS.some(i => i.id === type)) return NextResponse.redirect(`${origin}/dashboard/settings?error=unknown`)

  const redirectUri = `${origin}/api/integrations/${type}/callback`
  const url = buildAuthorizeUrl(type, redirectUri, type)
  if (!url) return NextResponse.redirect(`${origin}/dashboard/settings?error=${type}_not_configured`)
  return NextResponse.redirect(url)
}
