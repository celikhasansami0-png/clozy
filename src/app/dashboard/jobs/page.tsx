import { createServerSupabaseClient } from '@/lib/supabase-server'
import JobsView from '@/components/JobsView'

export default async function JobsPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: jobs }, { data: tasks }, { data: crew }] = await Promise.all([
    supabase.from('jobs').select('*').eq('owner_id', user!.id).order('created_at'),
    supabase.from('tasks').select('*, assignee:crew_members(*)').eq('owner_id', user!.id).order('created_at'),
    supabase.from('crew_members').select('*').eq('owner_id', user!.id).order('name'),
  ])

  return <JobsView jobs={jobs||[]} tasks={tasks||[]} crew={crew||[]} />
}
