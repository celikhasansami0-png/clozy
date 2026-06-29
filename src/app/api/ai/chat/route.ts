import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { bionovaChat, type ChatMessage } from '@/lib/ai'

export async function POST(req: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { messages } = (await req.json()) as { messages: ChatMessage[] }
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'messages required' }, { status: 400 })
  }

  // Ground the assistant in the user's live workspace.
  const [{ data: jobs }, { data: tasks }, { data: permits }] = await Promise.all([
    supabase.from('jobs').select('name,status,phase,completion').eq('owner_id', user.id),
    supabase.from('tasks').select('title,status,priority,due_date,tag').eq('owner_id', user.id),
    supabase.from('permits').select('permit_number,type,status,submitted_date').eq('owner_id', user.id),
  ])

  const context = [
    `Projects (${jobs?.length || 0}):`,
    ...(jobs || []).map((j) => `- ${j.name} — ${j.status}, phase ${j.phase}, ${j.completion}%`),
    `Open tasks: ${(tasks || []).filter((t) => t.status !== 'done').length} of ${tasks?.length || 0}`,
    `Permits: ${(permits || []).map((p) => `${p.permit_number} ${p.type} (${p.status})`).join('; ') || 'none'}`,
  ].join('\n')

  try {
    const reply = await bionovaChat(messages, context)
    return NextResponse.json({ reply })
  } catch (err) {
    console.error('bionovaChat failed', err)
    return NextResponse.json({ error: 'AI request failed' }, { status: 502 })
  }
}
