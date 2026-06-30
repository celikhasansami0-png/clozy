import { createServerSupabaseClient } from '@/lib/supabase-server'
import DocumentsView from '@/components/DocumentsView'

export default async function DocumentsPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: documents } = await supabase
    .from('documents')
    .select('*, job:jobs(*)')
    .eq('owner_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(2000)

  return <DocumentsView documents={documents||[]} />
}
