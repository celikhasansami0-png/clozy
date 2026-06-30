import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { safeExternal, countSince, startOfToday, RATE_CAPS } from '@/lib/integrations'

// Send a Slack notification for an in-app event. Non-blocking, rate-limited to
// 50 messages/account/day, and fully wrapped so Slack being down never breaks
// the app. Body: { messageType, text }.
export async function POST(req: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { messageType, text } = (await req.json()) as { messageType?: string; text?: string }
  if (!text) return NextResponse.json({ ok: false, skipped: 'no_text' })

  const { data: integ } = await supabase
    .from('slack_integrations')
    .select('access_token, default_channel_id')
    .eq('owner_id', user.id)
    .limit(1)
  const row = integ?.[0] as { access_token?: string; default_channel_id?: string } | undefined
  if (!row?.access_token || !row.default_channel_id) return NextResponse.json({ ok: false, skipped: 'not_connected' })

  // Per-account daily cap.
  const sentToday = await countSince(supabase, 'slack_logs', user.id, startOfToday(), 'sent_at')
  if (sentToday >= RATE_CAPS.slackPerDay) return NextResponse.json({ ok: false, skipped: 'rate_limited' })

  const result = await safeExternal(supabase, user.id, 'slack', async () => {
    const res = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${row.access_token}` },
      body: JSON.stringify({ channel: row.default_channel_id, text }),
    })
    const json = await res.json() as { ok?: boolean; error?: string }
    if (!json.ok) throw new Error(`Slack API error: ${json.error || res.status}`)
    return json
  })

  if (result.ok) await supabase.from('slack_logs').insert({ owner_id: user.id, message_type: messageType || 'notification' })
  return NextResponse.json({ ok: result.ok })
}
