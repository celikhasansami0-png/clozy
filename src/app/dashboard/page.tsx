import { createServerSupabaseClient } from '@/lib/supabase-server'
import DashboardHome from '@/components/DashboardHome'

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: jobs }, { data: tasks }, { data: permits }, { data: crew }] = await Promise.all([
    supabase.from('jobs').select('*').eq('owner_id', user!.id).eq('is_archived', false).order('created_at').limit(100),
    supabase.from('tasks').select('*, assignee:crew_members(*)').eq('owner_id', user!.id).order('created_at', { ascending: false }).limit(200),
    supabase.from('permits').select('*, job:jobs(*)').eq('owner_id', user!.id).limit(100),
    supabase.from('crew_members').select('*').eq('owner_id', user!.id).limit(100),
  ])

  return <DashboardHome jobs={jobs||[]} tasks={tasks||[]} permits={permits||[]} crew={crew||[]} />
}
