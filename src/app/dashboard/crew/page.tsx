import { createServerSupabaseClient } from '@/lib/supabase-server'
import CrewView from '@/components/CrewView'

export default async function CrewPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: crew }, { data: tasks }, { data: jobs }] = await Promise.all([
    supabase.from('crew_members').select('*').eq('owner_id', user!.id).order('name').limit(100),
    supabase.from('tasks').select('*, job:jobs(name,color)').eq('owner_id', user!.id).neq('status','done').limit(500),
    supabase.from('jobs').select('*').eq('owner_id', user!.id).limit(100),
  ])

  return <CrewView crew={crew||[]} tasks={tasks||[]} jobs={jobs||[]} />
}
