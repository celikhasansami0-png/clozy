import { createServerSupabaseClient } from '@/lib/supabase-server'
import ReportsView from '@/components/ReportsView'

export default async function ReportsPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: jobs }, { data: tasks }, { data: permits }] = await Promise.all([
    supabase.from('jobs').select('*').eq('owner_id', user!.id).eq('is_archived', false).order('created_at').limit(100),
    supabase.from('tasks').select('*').eq('owner_id', user!.id).order('created_at', { ascending: false }).limit(500),
    supabase.from('permits').select('*').eq('owner_id', user!.id).limit(200),
  ])

  return <ReportsView jobs={jobs||[]} tasks={tasks||[]} permits={permits||[]} />
}
