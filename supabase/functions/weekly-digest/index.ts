// Supabase Edge Function: send the Monday weekly digest to every opted-in user.
// Deploy: supabase functions deploy weekly-digest
// Schedule (Monday 08:00 UTC) with pg_cron + pg_net, or Supabase scheduled functions:
//   select cron.schedule('bionova-weekly-digest','0 8 * * 1', $$
//     select net.http_post(
//       url:='https://<project-ref>.functions.supabase.co/weekly-digest',
//       headers:='{"Authorization":"Bearer <service-role-key>"}'::jsonb) $$);
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

  const { data: settings } = await admin.from('notification_settings').select('owner_id').eq('weekly_digest', true)
  const now = Date.now()
  let sent = 0

  for (const s of settings || []) {
    try {
      const ownerId = s.owner_id as string
      const { data: authUser } = await admin.auth.admin.getUserById(ownerId)
      const email = authUser?.user?.email
      if (!email) continue

      const [{ data: jobs }, { data: tasks }] = await Promise.all([
        admin.from('jobs').select('name,status,completion').eq('owner_id', ownerId).eq('is_archived', false),
        admin.from('tasks').select('title,status,due_date').eq('owner_id', ownerId),
      ])

      const active = (jobs || []).filter((j) => j.status !== 'Complete').length
      const completedLastWeek = (tasks || []).filter((t) => t.status === 'done').length
      const upcoming = (tasks || []).filter((t) => t.status !== 'done' && t.due_date && new Date(t.due_date as string).getTime() - now <= 7 * DAY).length
      const urgent = (tasks || []).filter((t) => t.status !== 'done' && t.due_date && new Date(t.due_date as string).getTime() < now).length

      const lines = [
        `${active} active projects`,
        `${completedLastWeek} tasks completed`,
        `${upcoming} deadlines coming up this week`,
        `${urgent} overdue / urgent items`,
      ]
      const html = brandEmail('weekly_digest', { lines, link: Deno.env.get('SITE_URL') || '' })
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: FROM, to: email, subject: defaultSubject('weekly_digest', {}), html }),
      })
      if (res.ok) sent++
      else console.error('weekly-digest send failed', s.owner_id, await res.text())
    } catch (e) {
      console.error('weekly-digest error for', s.owner_id, e)
    }
  }

  return new Response(JSON.stringify({ ok: true, sent }), { headers: { 'Content-Type': 'application/json' } })
})
