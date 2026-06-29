import { createServerSupabaseClient } from '@/lib/supabase-server'
import ScheduleView from '@/components/ScheduleView'

export default async function SchedulePage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: tasks }, { data: jobs }] = await Promise.all([
    supabase.from('tasks').select('*').eq('owner_id', user!.id),
    supabase.from('jobs').select('*').eq('owner_id', user!.id),
  ])

  return <ScheduleView tasks={tasks||[]} jobs={jobs||[]} />
}
