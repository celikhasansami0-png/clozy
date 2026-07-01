import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Task, Job } from '@/lib/types'

const DAY = 24 * 60 * 60 * 1000

type Risk = { key: string; title: string; body: string; link: string }

// Doppio Radar — compute risk conditions, create radar_alert notifications
// (deduplicated), and return the active (unread) alerts.
export async function POST() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ alerts: [] }, { status: 401 })

  const now = Date.now()
  const [{ data: jobs }, { data: tasks }] = await Promise.all([
    supabase.from('jobs').select('id,name,completion').eq('owner_id', user.id).eq('is_archived', false).limit(500),
    supabase.from('tasks').select('id,title,status,due_date,job_id').eq('owner_id', user.id).limit(10000),
  ])
  const J = (jobs || []) as Job[]
  const T = (tasks || []) as Task[]
  const jobMap = new Map(J.map(j => [j.id, j]))

  const risks: Risk[] = []
  for (const t of T) {
    if (t.status === 'done' || !t.due_date) continue
    const due = new Date(t.due_date).getTime()
    const proj = jobMap.get(t.job_id)
    const link = `/dashboard/jobs?job=${t.job_id}`
    if (due < now) {
      risks.push({ key: `overdue:${t.id}`, title: `Task overdue: ${t.title}`, body: `"${t.title}" in ${proj?.name || 'a project'} is past its due date.`, link })
    } else if (due - now <= 3 * DAY) {
      const days = Math.round((due - now) / DAY)
      risks.push({ key: `due:${t.id}`, title: `Task due ${days <= 1 ? 'tomorrow' : `in ${days} days`}: ${t.title}`, body: `"${t.title}" in ${proj?.name || 'a project'} is due soon.`, link })
    }
  }
  for (const j of J) {
    if (j.completion >= 30) continue
    const soon = T.some(t => t.job_id === j.id && t.status !== 'done' && !!t.due_date && new Date(t.due_date).getTime() - now <= 7 * DAY && new Date(t.due_date).getTime() >= now)
    if (soon) risks.push({ key: `project:${j.id}`, title: `Project at risk: ${j.name}`, body: `${j.name} is only ${j.completion}% complete but has work due within a week.`, link: `/dashboard/jobs?job=${j.id}` })
  }

  // Dedupe against every radar_alert already created (read or unread) by title.
  const { data: existing } = await supabase.from('notifications').select('title').eq('owner_id', user.id).eq('type', 'radar_alert').limit(500)
  const seen = new Set((existing || []).map(e => e.title))
  const toInsert = risks.filter(r => !seen.has(r.title)).map(r => ({ owner_id: user.id, title: r.title, body: r.body, type: 'radar_alert', link: r.link }))
  if (toInsert.length) await supabase.from('notifications').insert(toInsert)

  // Return the currently active (unread) radar alerts.
  const { data: active } = await supabase.from('notifications')
    .select('id,title,body,link,created_at').eq('owner_id', user.id).eq('type', 'radar_alert').eq('read', false)
    .order('created_at', { ascending: false }).limit(50)
  return NextResponse.json({ alerts: active || [] })
}
