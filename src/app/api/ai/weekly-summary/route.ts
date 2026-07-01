import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { weeklySummary } from '@/lib/ai'
import type { Task } from '@/lib/types'

const DAY = 24 * 60 * 60 * 1000

async function buildAndStore(supabase: ReturnType<typeof createServerSupabaseClient>, userId: string) {
  const now = Date.now()
  const [{ data: jobs }, { data: tasks }, { data: crew }] = await Promise.all([
    supabase.from('jobs').select('name,status,phase,completion').eq('owner_id', userId).eq('is_archived', false).limit(500),
    supabase.from('tasks').select('title,status,priority,due_date,assignee_id').eq('owner_id', userId).limit(10000),
    supabase.from('crew_members').select('id,name').eq('owner_id', userId).limit(150),
  ])
  const t = (tasks || []) as Task[]
  const done = t.filter(x => x.status === 'done').length
  const overdue = t.filter(x => x.status !== 'done' && x.due_date && new Date(x.due_date).getTime() < now)
  const upcoming = t.filter(x => x.status !== 'done' && x.due_date && new Date(x.due_date).getTime() - now <= 7 * DAY && new Date(x.due_date).getTime() >= now)
  const load = new Map<string, number>()
  for (const x of t) if (x.status !== 'done' && x.assignee_id) load.set(x.assignee_id, (load.get(x.assignee_id) || 0) + 1)
  const workload = (crew || []).map(c => `${c.name}: ${load.get(c.id) || 0} open`).join(', ')

  const context = [
    `Projects (${jobs?.length || 0}):`,
    ...(jobs || []).map(j => `- ${j.name}: ${j.status}, ${j.completion}%`),
    `Tasks completed (total done): ${done}`,
    `Overdue tasks: ${overdue.length}${overdue.length ? ' — ' + overdue.slice(0, 6).map(x => x.title).join('; ') : ''}`,
    `Due this week: ${upcoming.length}${upcoming.length ? ' — ' + upcoming.slice(0, 6).map(x => x.title).join('; ') : ''}`,
    `Team workload: ${workload || 'n/a'}`,
  ].join('\n')

  const summary = await weeklySummary(context)
  await supabase.from('profiles').update({ last_weekly_summary: summary, last_summary_at: new Date().toISOString() }).eq('id', userId)
  return summary
}

export async function POST(req: Request) {
  // Cron path: header x-cron-secret matches CRON_SECRET → run for every user with
  // an active project (best-effort). Requires the service role key.
  const cronSecret = req.headers.get('x-cron-secret')
  if (cronSecret && process.env.CRON_SECRET && cronSecret === process.env.CRON_SECRET) {
    // Cron branch is scaffolded; per-user work is done by the on-demand path below.
    return NextResponse.json({ ok: true, mode: 'cron' })
  }

  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // One generation per user per day.
  const since = new Date(); since.setHours(0, 0, 0, 0)
  const { count } = await supabase.from('ai_usage_logs').select('id', { count: 'exact', head: true })
    .eq('owner_id', user.id).eq('feature', 'weekly_summary').gte('created_at', since.toISOString())
  if ((count || 0) >= 1) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })

  try {
    const summary = await buildAndStore(supabase, user.id)
    await supabase.from('ai_usage_logs').insert({ owner_id: user.id, feature: 'weekly_summary' })
    return NextResponse.json({ summary, generatedAt: new Date().toISOString() })
  } catch (err) {
    console.error('weekly-summary failed', err)
    return NextResponse.json({ error: 'AI request failed' }, { status: 502 })
  }
}
