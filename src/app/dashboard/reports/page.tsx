import { createServerSupabaseClient } from '@/lib/supabase-server'
import ReportsView from '@/components/ReportsView'

export default async function ReportsPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: jobs }, { data: tasks }, { data: documents }] = await Promise.all([
    supabase.from('jobs').select('*').eq('owner_id', user!.id).eq('is_archived', false).order('created_at').limit(500),
    supabase.from('tasks').select('*').eq('owner_id', user!.id).order('created_at', { ascending: false }).limit(10000),
    supabase.from('documents').select('*').eq('owner_id', user!.id).limit(2000),
  ])

  return <ReportsView jobs={jobs||[]} tasks={tasks||[]} documents={documents||[]} />
}
