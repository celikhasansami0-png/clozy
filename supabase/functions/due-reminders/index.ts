// Supabase Edge Function: email reminders for tasks due within 24 hours.
// Deploy: supabase functions deploy due-reminders
// Schedule (e.g. daily 07:00 UTC) via pg_cron + pg_net (see weekly-digest for the pattern).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { brandEmail, defaultSubject } from '../_shared/email.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM = Deno.env.get('EMAIL_FROM') || 'Bionova <onboarding@resend.dev>'
const DAY = 86400000

Deno.serve(async () => {
  if (!RESEND_API_KEY) return new Response('RESEND_API_KEY not set', { status: 500 })
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE)
  const now = Date.now()
  let sent = 0

  const { data: settings } = await admin.from('notification_settings').select('owner_id').eq('due_date_reminder', true)
  for (const s of settings || []) {
    try {
      const ownerId = s.owner_id as string
      const { data: tasks } = await admin
        .from('tasks')
        .select('title, due_date, job_id, jobs(name)')
        .eq('owner_id', ownerId)
        .neq('status', 'done')
        .not('due_date', 'is', null)
      const dueSoon = (tasks || []).filter((t) => {
        const d = new Date(t.due_date as string).getTime() - now
        return d <= DAY && d >= -DAY
      })
      if (dueSoon.length === 0) continue

      const { data: authUser } = await admin.auth.admin.getUserById(ownerId)
      const email = authUser?.user?.email
      if (!email) continue

      for (const t of dueSoon) {
        try {
          const projectName = (t.jobs as { name?: string } | null)?.name || ''
          const html = brandEmail('due_reminder', { taskTitle: t.title, projectName, dueDate: t.due_date, link: Deno.env.get('SITE_URL') || '' })
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ from: FROM, to: email, subject: defaultSubject('due_reminder', { taskTitle: t.title }), html }),
          })
          if (res.ok) sent++
          else console.error('due-reminder send failed', ownerId, await res.text())
        } catch (e) {
          console.error('due-reminder send error', ownerId, e)
        }
      }
    } catch (e) {
      console.error('due-reminder error for', s.owner_id, e)
    }
  }
  return new Response(JSON.stringify({ ok: true, sent }), { headers: { 'Content-Type': 'application/json' } })
})
