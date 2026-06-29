import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { projectSummary } from '@/lib/ai'
import { flaggedPermits, riskAlerts } from '@/lib/insights'
import type { Task, Permit } from '@/lib/types'

export async function POST() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [{ data: jobs }, { data: tasks }, { data: permits }] = await Promise.all([
    supabase.from('jobs').select('name,status,phase,completion').eq('owner_id', user.id),
    supabase.from('tasks').select('title,status,priority,due_date,tag').eq('owner_id', user.id),
    supabase.from('permits').select('permit_number,type,status,submitted_date').eq('owner_id', user.id),
  ])

  const risks = riskAlerts((tasks || []) as Task[])
  const flagged = flaggedPermits((permits || []) as Permit[])

  const context = [
    `Projects:`,
    ...(jobs || []).map((j) => `- ${j.name}: ${j.status}, phase ${j.phase}, ${j.completion}% complete`),
    ``,
    `Tasks due within 3 days or overdue: ${risks.length}`,
    ...risks.slice(0, 8).map((r) => `- ${r.task.title} (${r.daysLeft}d, ${r.task.priority})`),
    ``,
    `Permits flagged (Under Review > 14 days): ${flagged.length}`,
    ...flagged.map((f) => `- ${f.permit.permit_number} ${f.permit.type} (${f.daysInReview}d in review)`),
  ].join('\n')

  try {
    const summary = await projectSummary(context)
    return NextResponse.json({ summary })
  } catch (err) {
    console.error('projectSummary failed', err)
    return NextResponse.json({ error: 'AI request failed' }, { status: 502 })
  }
}
