import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { extractActionItems } from '@/lib/ai'

const DAILY_CAP = 20

export async function POST(req: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { notes } = (await req.json()) as { notes?: string }
  if (!notes || !notes.trim()) return NextResponse.json({ error: 'notes required' }, { status: 400 })

  // Per-user daily cap (20/day) via ai_usage_logs.
  const since = new Date(); since.setHours(0, 0, 0, 0)
  const { count } = await supabase.from('ai_usage_logs').select('id', { count: 'exact', head: true })
    .eq('owner_id', user.id).eq('feature', 'meeting_notes').gte('created_at', since.toISOString())
  if ((count || 0) >= DAILY_CAP) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })

  try {
    const items = await extractActionItems(notes.slice(0, 8000))
    await supabase.from('ai_usage_logs').insert({ owner_id: user.id, feature: 'meeting_notes' })
    return NextResponse.json({ items })
  } catch (err) {
    console.error('meeting-notes extraction failed', err)
    return NextResponse.json({ error: 'AI request failed' }, { status: 502 })
  }
}
