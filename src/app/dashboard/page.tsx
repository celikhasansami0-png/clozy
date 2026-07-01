import { createServerSupabaseClient } from '@/lib/supabase-server'
import DashboardHome from '@/components/DashboardHome'

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: jobs }, { data: tasks }, { data: documents }, { data: crew }, { data: profile }] = await Promise.all([
    supabase.from('jobs').select('*').eq('owner_id', user!.id).eq('is_archived', false).order('created_at').limit(500),
    supabase.from('tasks').select('*, assignee:crew_members(*)').eq('owner_id', user!.id).order('created_at', { ascending: false }).limit(200),
    supabase.from('documents').select('*, job:jobs(*)').eq('owner_id', user!.id).limit(2000),
    supabase.from('crew_members').select('*').eq('owner_id', user!.id).limit(150),
    supabase.from('profiles').select('last_weekly_summary, last_summary_at').eq('id', user!.id).single(),
  ])

  return <DashboardHome jobs={jobs||[]} tasks={tasks||[]} documents={documents||[]} crew={crew||[]}
    weeklySummary={profile?.last_weekly_summary || ''} weeklySummaryAt={profile?.last_summary_at || null} />
}
