import { createServerSupabaseClient } from '@/lib/supabase-server'
import PermitsView from '@/components/PermitsView'

export default async function PermitsPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: permits } = await supabase
    .from('permits')
    .select('*, job:jobs(*)')
    .eq('owner_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(200)

  return <PermitsView permits={permits||[]} />
}
