import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { emailContent, renderEmail } from '@/lib/emailTemplate'

const FROM = process.env.EMAIL_FROM || 'Doppio <onboarding@resend.dev>'
const DAY = 86400000

// Cron-callable: Monday weekly digest. Schedule an external cron (e.g. Vercel Cron)
// to POST here with header `Authorization: Bearer <CRON_SECRET>`.
export async function POST(req: Request) {
  if (process.env.CRON_SECRET && req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }
  if (!process.env.RESEND_API_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ ok: false, error: 'Email/service role not configured' }, { status: 200 })
  }
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const now = Date.now()
  let sent = 0

  const { data: settings } = await admin.from('notification_settings').select('owner_id').eq('weekly_digest', true).limit(1000)
  for (const s of settings || []) {
    try {
      const ownerId = s.owner_id as string
      const { data: authUser } = await admin.auth.admin.getUserById(ownerId)
      const email = authUser?.user?.email
      if (!email) continue
      const [{ data: jobs }, { data: tasks }] = await Promise.all([
        admin.from('jobs').select('status').eq('owner_id', ownerId).eq('is_archived', false).limit(500),
        admin.from('tasks').select('status,due_date').eq('owner_id', ownerId).limit(1000),
      ])
      const active = (jobs || []).filter(j => j.status !== 'Complete').length
      const completed = (tasks || []).filter(t => t.status === 'done').length
      const upcoming = (tasks || []).filter(t => t.status !== 'done' && t.due_date && new Date(t.due_date as string).getTime() - now <= 7 * DAY).length
      const urgent = (tasks || []).filter(t => t.status !== 'done' && t.due_date && new Date(t.due_date as string).getTime() < now).length
      const { subject, heading } = emailContent('weekly_digest', {})
      const lines = [`${active} active projects`, `${completed} tasks completed`, `${upcoming} deadlines this week`, `${urgent} overdue / urgent items`]
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: FROM, to: email, subject, html: renderEmail(heading, lines, process.env.NEXT_PUBLIC_SITE_URL || '') }),
      })
      if (res.ok) sent++
      else console.error('weekly-digest send failed', ownerId)
    } catch (e) { console.error('weekly-digest error', e) }
  }
  return NextResponse.json({ ok: true, sent })
}
