import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { emailContent, renderEmail, type EmailType } from '@/lib/emailTemplate'

const FROM = process.env.EMAIL_FROM || 'Doppio <onboarding@resend.dev>'

// Transactional email sender (replaces the Supabase Edge Function).
export async function POST(req: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const { to, type, data } = (await req.json()) as { to: string; type: EmailType; data: Record<string, unknown> }
    if (!to || !type) return NextResponse.json({ ok: false, error: 'Missing to/type' }, { status: 400 })
    if (!process.env.RESEND_API_KEY) return NextResponse.json({ ok: false, error: 'RESEND_API_KEY not configured' }, { status: 200 })

    const { subject, heading, lines, link } = emailContent(type, data || {})
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to, subject, html: renderEmail(heading, lines, link) }),
    })
    return NextResponse.json({ ok: res.ok }, { status: res.ok ? 200 : 502 })
  } catch (e) {
    console.error('email send failed', e)
    return NextResponse.json({ ok: false, error: 'send failed' }, { status: 500 })
  }
}
