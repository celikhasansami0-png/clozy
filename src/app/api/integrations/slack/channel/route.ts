import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// Save the channel that should receive Slack notifications.
export async function POST(req: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { channelId } = (await req.json()) as { channelId?: string }
  if (!channelId) return NextResponse.json({ error: 'channelId required' }, { status: 400 })

  await supabase.from('slack_integrations').update({ default_channel_id: channelId }).eq('owner_id', user.id)
  return NextResponse.json({ ok: true })
}
