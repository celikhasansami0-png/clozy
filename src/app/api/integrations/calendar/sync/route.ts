import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { safeExternal, googleAccessToken, RATE_CAPS } from '@/lib/integrations'

const DAY = 24 * 60 * 60 * 1000

// Decide whether a task qualifies for calendar sync: urgent/high priority, or
// due within 14 days.
function qualifies(priority: string, dueDate: string | null): boolean {
  if (priority === 'urgent' || priority === 'high') return true
  if (!dueDate) return false
  return new Date(dueDate).getTime() - Date.now() <= 14 * DAY
}

// Create / update / delete a Google Calendar event for a task. Non-blocking,
// capped at 200 actively synced events per account, de-duplicated via
// tasks.google_event_id. Body: { taskId, action: 'upsert' | 'delete' }.
export async function POST(req: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const origin = new URL(req.url).origin
  const { taskId, action } = (await req.json()) as { taskId?: string; action?: 'upsert' | 'delete' }
  if (!taskId) return NextResponse.json({ ok: false, skipped: 'no_task' })

  const { data: integ } = await supabase.from('calendar_integrations').select('refresh_token, calendar_id').eq('owner_id', user.id).limit(1)
  const conn = integ?.[0] as { refresh_token?: string; calendar_id?: string } | undefined
  if (!conn?.refresh_token) return NextResponse.json({ ok: false, skipped: 'not_connected' })

  const { data: taskRows } = await supabase.from('tasks').select('id,title,due_date,priority,status,google_event_id').eq('id', taskId).eq('owner_id', user.id).limit(1)
  const task = taskRows?.[0] as { title: string; due_date: string | null; priority: string; status: string; google_event_id: string | null } | undefined
  if (!task) return NextResponse.json({ ok: false, skipped: 'no_task' })

  const cal = conn.calendar_id || 'primary'
  const remove = action === 'delete' || task.status === 'done' || !qualifies(task.priority, task.due_date)

  const result = await safeExternal(supabase, user.id, 'google_calendar', async () => {
    const accessToken = await googleAccessToken(conn.refresh_token as string)
    if (!accessToken) throw new Error('Could not obtain Google access token')
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` }

    // Delete path.
    if (remove) {
      if (task.google_event_id) {
        await fetch(`https://www.googleapis.com/calendar/v3/calendars/${cal}/events/${task.google_event_id}`, { method: 'DELETE', headers })
        await supabase.from('tasks').update({ google_event_id: null }).eq('id', taskId)
      }
      return { removed: true }
    }

    const date = (task.due_date || new Date().toISOString().slice(0, 10))
    const event = {
      summary: task.title,
      description: `Doppio task — ${origin}/dashboard/tasks`,
      start: { date }, end: { date },
    }

    // Update existing event.
    if (task.google_event_id) {
      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${cal}/events/${task.google_event_id}`, { method: 'PATCH', headers, body: JSON.stringify(event) })
      if (!res.ok) throw new Error(`Calendar update failed (${res.status})`)
      return { updated: true }
    }

    // Create — enforce the 200 actively-synced-events cap first.
    const { count } = await supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('owner_id', user.id).not('google_event_id', 'is', null)
    if ((count || 0) >= RATE_CAPS.calendarMaxEvents) throw new Error('Calendar sync cap (200 events) reached')

    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${cal}/events`, { method: 'POST', headers, body: JSON.stringify(event) })
    if (!res.ok) throw new Error(`Calendar create failed (${res.status})`)
    const created = await res.json() as { id?: string }
    if (created.id) await supabase.from('tasks').update({ google_event_id: created.id }).eq('id', taskId)
    return { created: true }
  })

  return NextResponse.json({ ok: result.ok })
}
