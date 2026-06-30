import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { safeExternal } from '@/lib/integrations'

// List the connected workspace's public channels so the user can pick a default.
// Wrapped + timed out; returns an empty list on any failure.
export async function GET() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ channels: [] }, { status: 401 })

  const { data: integ } = await supabase
    .from('slack_integrations')
    .select('access_token, default_channel_id')
    .eq('owner_id', user.id)
    .limit(1)
  const row = integ?.[0] as { access_token?: string; default_channel_id?: string } | undefined
  if (!row?.access_token) return NextResponse.json({ channels: [], selected: null })

  const result = await safeExternal(supabase, user.id, 'slack', async () => {
    const res = await fetch('https://slack.com/api/conversations.list?types=public_channel&limit=200', {
      headers: { Authorization: `Bearer ${row.access_token}` },
    })
    const json = await res.json() as { ok?: boolean; error?: string; channels?: { id: string; name: string }[] }
    if (!json.ok) throw new Error(`Slack API error: ${json.error || res.status}`)
    return json.channels || []
  })

  return NextResponse.json({ channels: result.ok ? result.data : [], selected: row.default_channel_id || null })
}
