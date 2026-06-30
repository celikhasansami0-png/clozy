import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { INTEGRATION_TABLES } from '@/lib/integrations'
import type { IntegrationId } from '@/config/integrations'

// Remove a connection (owner-scoped via RLS).
export async function POST(_req: Request, { params }: { params: { type: string } }) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const table = INTEGRATION_TABLES[params.type as IntegrationId]
  if (!table) return NextResponse.json({ error: 'unknown integration' }, { status: 400 })

  await supabase.from(table).delete().eq('owner_id', user.id)
  return NextResponse.json({ ok: true })
}
