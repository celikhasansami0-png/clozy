import type { SupabaseClient } from '@supabase/supabase-js'

export type EmailType = 'task_assigned' | 'due_reminder' | 'document_status' | 'weekly_digest'

const SETTING_COL: Record<EmailType, string> = {
  task_assigned: 'task_assigned',
  due_reminder: 'due_date_reminder',
  document_status: 'permit_status_change',
  weekly_digest: 'weekly_digest',
}

// Fire a transactional email via the /api/email/send route, respecting the
// user's notification_settings. Non-blocking — failures never break the UI.
export async function sendEmail(
  supabase: SupabaseClient,
  ownerId: string,
  type: EmailType,
  data: Record<string, unknown>,
  toOverride?: string
) {
  try {
    const { data: settings } = await supabase.from('notification_settings').select('*').eq('owner_id', ownerId).single()
    if (settings && (settings as Record<string, unknown>)[SETTING_COL[type]] === false) return
    let to = toOverride
    if (!to) { const { data: u } = await supabase.auth.getUser(); to = u.user?.email ?? undefined }
    if (!to) return
    await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, type, data }),
    })
  } catch { /* non-blocking */ }
}
