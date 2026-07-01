import { createServerSupabaseClient } from '@/lib/supabase-server'
import TasksView from '@/components/TasksView'

export default async function TasksPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: tasks }, { data: jobs }, { data: crew }] = await Promise.all([
    supabase.from('tasks').select('*, assignee:crew_members(*)').eq('owner_id', user!.id).order('created_at', { ascending: false }).limit(10000),
    supabase.from('jobs').select('id,name,color').eq('owner_id', user!.id).order('created_at').limit(500),
    supabase.from('crew_members').select('*').eq('owner_id', user!.id).limit(150),
  ])

  return <TasksView tasks={tasks||[]} jobs={jobs||[]} crew={crew||[]} />
}
