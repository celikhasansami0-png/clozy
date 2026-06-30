import { createServerSupabaseClient } from '@/lib/supabase-server'
import { INTEGRATION_TABLES } from '@/lib/integrations'
import { INTEGRATIONS } from '@/config/integrations'
import IntegrationsView, { type IntegrationStatus } from '@/components/IntegrationsView'

export default async function SettingsPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_name, industry')
    .eq('id', user!.id)
    .single()

  // Connection + health status for each integration.
  const statuses: IntegrationStatus[] = await Promise.all(
    INTEGRATIONS.map(async (meta): Promise<IntegrationStatus> => {
      const { data } = await supabase
        .from(INTEGRATION_TABLES[meta.id])
        .select('last_status')
        .eq('owner_id', user!.id)
        .limit(1)
      const row = data?.[0] as { last_status?: string } | undefined
      return { id: meta.id, connected: !!row, healthy: row ? row.last_status !== 'error' : true }
    })
  )

  return <IntegrationsView statuses={statuses} companyName={profile?.company_name || ''} industry={profile?.industry || ''} />
}
