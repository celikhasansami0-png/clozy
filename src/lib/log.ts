import type { SupabaseClient } from '@supabase/supabase-js'
import { emit } from './bus'
import type { NotificationRow, ActivityLog } from './types'

// Write an activity-log row for a project action (fire-and-forget, broadcasts to feed).
export async function logActivity(
  supabase: SupabaseClient,
  p: { projectId?: string | null; ownerId: string; actorId?: string | null; action: string; entityType: string; entityId?: string | null; metadata?: Record<string, unknown> }
) {
  try {
    const { data } = await supabase.from('activity_logs').insert({
      project_id: p.projectId ?? null,
      owner_id: p.ownerId,
      actor_id: p.actorId ?? p.ownerId,
      action: p.action,
      entity_type: p.entityType,
      entity_id: p.entityId ?? null,
      metadata: p.metadata ?? {},
    }).select('*').single()
    if (data) emit<ActivityLog>('bn:activity:add', data as ActivityLog)
  } catch { /* non-blocking */ }
}

// Create an in-app notification and broadcast it to the bell (optimistic).
export async function notify(
  supabase: SupabaseClient,
  ownerId: string,
  n: { title: string; body?: string; type?: string; link?: string }
) {
  try {
    const { data } = await supabase
      .from('notifications')
      .insert({ owner_id: ownerId, title: n.title, body: n.body ?? '', type: n.type ?? 'info', link: n.link ?? '' })
      .select('*')
      .single()
    if (data) emit<NotificationRow>('bn:notification:add', data as NotificationRow)
  } catch { /* non-blocking */ }
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.max(0, Math.floor(diff / 1000))
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} minute${m > 1 ? 's' : ''} ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d} day${d > 1 ? 's' : ''} ago`
  const w = Math.floor(d / 7)
  if (w < 5) return `${w} week${w > 1 ? 's' : ''} ago`
  return new Date(iso).toLocaleDateString()
}
