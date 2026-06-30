import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { aiInsights } from '@/lib/ai'
import { flaggedDocuments, riskAlerts, suggestAssignee } from '@/lib/insights'
import type { Task, Doc, CrewMember } from '@/lib/types'

export async function POST() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [{ data: jobs }, { data: tasks }, { data: docs }, { data: crew }] = await Promise.all([
    supabase.from('jobs').select('name,status,phase,completion').eq('owner_id', user.id).limit(100),
    supabase.from('tasks').select('title,status,priority,due_date,tag,assignee_id,job_id').eq('owner_id', user.id).limit(200),
    supabase.from('documents').select('doc_number,type,status,submitted_date').eq('owner_id', user.id).limit(100),
    supabase.from('crew_members').select('*').eq('owner_id', user.id).limit(100),
  ])

  const taskRows = (tasks || []) as Task[]
  const risks = riskAlerts(taskRows)
  const flagged = flaggedDocuments((docs || []) as Doc[])
  const freest = suggestAssignee((crew || []) as CrewMember[], taskRows)

  const context = [
    `Projects (${jobs?.length || 0}):`,
    ...(jobs || []).map((j) => `- ${j.name}: ${j.status}, phase ${j.phase}, ${j.completion}% complete`),
    ``,
    `Open tasks: ${taskRows.filter((t) => t.status !== 'done').length} of ${taskRows.length}`,
    `Tasks due within 3 days or overdue: ${risks.length}`,
    ...risks.slice(0, 8).map((r) => `- ${r.task.title} (${r.daysLeft}d, ${r.task.priority})`),
    ``,
    `Documents flagged (Under Review > 14 days): ${flagged.length}`,
    ...flagged.map((f) => `- ${f.doc.doc_number} ${f.doc.type} (${f.daysInReview}d in review)`),
    ``,
    `Team members: ${crew?.length || 0}. Member with most capacity: ${freest?.name || 'n/a'}`,
  ].join('\n')

  const insights = await aiInsights(context)
  return NextResponse.json({ insights })
}
