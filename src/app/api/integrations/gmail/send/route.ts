import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { safeExternal, googleAccessToken, countSince, startOfToday, RATE_CAPS } from '@/lib/integrations'

function base64Url(input: string): string {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// Send an email from the user's connected Gmail account. Non-blocking,
// rate-limited to 50 sends/account/day, fully wrapped. Body: { to, subject, body }.
export async function POST(req: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { to, subject, body } = (await req.json()) as { to?: string; subject?: string; body?: string }
  if (!to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return NextResponse.json({ ok: false, error: 'invalid_recipient' }, { status: 400 })

  const { data: integ } = await supabase.from('gmail_integrations').select('refresh_token, email').eq('owner_id', user.id).limit(1)
  const conn = integ?.[0] as { refresh_token?: string; email?: string } | undefined
  if (!conn?.refresh_token) return NextResponse.json({ ok: false, error: 'not_connected' }, { status: 400 })

  const sentToday = await countSince(supabase, 'gmail_logs', user.id, startOfToday(), 'sent_at')
  if (sentToday >= RATE_CAPS.gmailPerDay) return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })

  const result = await safeExternal(supabase, user.id, 'gmail', async () => {
    const accessToken = await googleAccessToken(conn.refresh_token as string)
    if (!accessToken) throw new Error('Could not obtain Google access token')
    const raw = base64Url(
      `From: ${conn.email || 'me'}\r\nTo: ${to}\r\nSubject: ${subject || 'Shared from Doppio'}\r\n` +
      `Content-Type: text/plain; charset=UTF-8\r\n\r\n${body || ''}`
    )
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ raw }),
    })
    if (!res.ok) throw new Error(`Gmail send failed (${res.status})`)
    return res.json()
  })

  if (result.ok) await supabase.from('gmail_logs').insert({ owner_id: user.id, recipient: to })
  return NextResponse.json({ ok: result.ok, error: result.ok ? undefined : 'send_failed' })
}
