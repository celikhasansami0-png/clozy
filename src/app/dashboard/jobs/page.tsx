import { createServerSupabaseClient } from '@/lib/supabase-server'
import JobsView from '@/components/JobsView'

export default async function JobsPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: jobs }, { data: tasks }, { data: crew }, { data: profile }] = await Promise.all([
    supabase.from('jobs').select('*').eq('owner_id', user!.id).order('created_at'),
    supabase.from('tasks').select('*, assignee:crew_members(*)').eq('owner_id', user!.id).order('created_at'),
    supabase.from('crew_members').select('*').eq('owner_id', user!.id).order('name'),
    supabase.from('profiles').select('full_name').eq('id', user!.id).single(),
  ])

  const uploaderName = profile?.full_name?.trim() || 'You'
  return <JobsView jobs={jobs||[]} tasks={tasks||[]} crew={crew||[]} ownerId={user!.id} uploaderName={uploaderName} />
}
