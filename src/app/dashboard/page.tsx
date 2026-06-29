import { createServerSupabaseClient } from '@/lib/supabase-server'
import DashboardHome from '@/components/DashboardHome'

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: jobs }, { data: tasks }, { data: permits }] = await Promise.all([
    supabase.from('jobs').select('*').eq('owner_id', user!.id).order('created_at'),
    supabase.from('tasks').select('*, assignee:crew_members(*)').eq('owner_id', user!.id),
    supabase.from('permits').select('*, job:jobs(*)').eq('owner_id', user!.id),
  ])

  return <DashboardHome jobs={jobs||[]} tasks={tasks||[]} permits={permits||[]} />
}
