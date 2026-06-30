// Supabase Edge Function: send a transactional email via Resend.
// Deploy: supabase functions deploy send-email
// Secrets: supabase secrets set RESEND_API_KEY=... EMAIL_FROM="Bionova <you@yourdomain>"
import { brandEmail, defaultSubject, type EmailType } from '../_shared/email.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM = Deno.env.get('EMAIL_FROM') || 'Bionova <onboarding@resend.dev>'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405)

  try {
    const { to, type, data, subject } = (await req.json()) as { to: string | string[]; type: EmailType; data: Record<string, unknown>; subject?: string }
    if (!to || !type) return json({ ok: false, error: 'Missing `to` or `type`' }, 400)
    if (!RESEND_API_KEY) return json({ ok: false, error: 'RESEND_API_KEY not configured' }, 500)

    const html = brandEmail(type, data || {})
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to, subject: subject || defaultSubject(type, data || {}), html }),
    })
    const body = await res.json()
    return json({ ok: res.ok, body }, res.ok ? 200 : 502)
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500)
  }
})
