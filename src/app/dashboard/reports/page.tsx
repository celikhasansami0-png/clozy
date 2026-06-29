import { createServerSupabaseClient } from '@/lib/supabase-server'
import ReportsView from '@/components/ReportsView'

export default async function ReportsPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: jobs }, { data: tasks }, { data: permits }] = await Promise.all([
    supabase.from('jobs').select('*').eq('owner_id', user!.id).order('created_at'),
    supabase.from('tasks').select('*').eq('owner_id', user!.id),
    supabase.from('permits').select('*').eq('owner_id', user!.id),
  ])

  return <ReportsView jobs={jobs||[]} tasks={tasks||[]} permits={permits||[]} />
}
