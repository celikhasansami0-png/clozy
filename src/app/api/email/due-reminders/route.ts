import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { emailContent, renderEmail } from '@/lib/emailTemplate'

const FROM = process.env.EMAIL_FROM || 'Doppio <onboarding@resend.dev>'
const DAY = 86400000

// Cron-callable: tasks due within 24h. POST with `Authorization: Bearer <CRON_SECRET>`.
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

  const { data: settings } = await admin.from('notification_settings').select('owner_id').eq('due_date_reminder', true).limit(1000)
  for (const s of settings || []) {
    try {
      const ownerId = s.owner_id as string
      const { data: tasks } = await admin.from('tasks').select('title, due_date, jobs(name)').eq('owner_id', ownerId).neq('status', 'done').not('due_date', 'is', null).limit(500)
      const dueSoon = (tasks || []).filter(t => { const d = new Date(t.due_date as string).getTime() - now; return d <= DAY && d >= -DAY })
      if (dueSoon.length === 0) continue
      const { data: authUser } = await admin.auth.admin.getUserById(ownerId)
      const email = authUser?.user?.email
      if (!email) continue
      for (const t of dueSoon) {
        try {
          const projectName = (t.jobs as { name?: string } | null)?.name || ''
          const { subject, heading, lines, link } = emailContent('due_reminder', { taskTitle: t.title, projectName, dueDate: t.due_date, link: process.env.NEXT_PUBLIC_SITE_URL || '' })
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ from: FROM, to: email, subject, html: renderEmail(heading, lines, link) }),
          })
          if (res.ok) sent++
        } catch (e) { console.error('due-reminder send error', e) }
      }
    } catch (e) { console.error('due-reminder error', e) }
  }
  return NextResponse.json({ ok: true, sent })
}
