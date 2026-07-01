import { createServerSupabaseClient } from '@/lib/supabase-server'
import { INTEGRATION_TABLES } from '@/lib/integrations'
import { INTEGRATIONS } from '@/config/integrations'
import IntegrationsView, { type IntegrationStatus } from '@/components/IntegrationsView'

export default async function SettingsPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_name, client_count')
    .eq('id', user!.id)
    .single()

  // Health = connected AND no integration error logged in the last 24h. Errors are
  // written to integration_errors whenever an external call fails.
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data: recentErrors } = await supabase
    .from('integration_errors')
    .select('integration_type')
    .eq('owner_id', user!.id)
    .gte('created_at', since)
    .limit(200)
  const erroredTypes = new Set((recentErrors || []).map(e => e.integration_type))

  const statuses: IntegrationStatus[] = await Promise.all(
    INTEGRATIONS.map(async (meta): Promise<IntegrationStatus> => {
      const { data } = await supabase
        .from(INTEGRATION_TABLES[meta.id])
        .select('id')
        .eq('owner_id', user!.id)
        .limit(1)
      const connected = !!data?.[0]
      return { id: meta.id, connected, healthy: connected ? !erroredTypes.has(meta.id) : true }
    })
  )

  return <IntegrationsView statuses={statuses} companyName={profile?.company_name || ''} clientCount={profile?.client_count || ''} />
}
