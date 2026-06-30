import type { SupabaseClient } from '@supabase/supabase-js'
import type { IntegrationId } from '@/config/integrations'

// Hard timeout for every external API call (TASK 6 — never block the app).
export const EXTERNAL_TIMEOUT_MS = 10_000

// Per-account rate limits (enforced in code before any external call).
export const RATE_CAPS = {
  slackPerDay: 50,
  gmailPerDay: 50,
  outlookPerDay: 50,
  docusignPerMonth: 30,
  calendarMaxEvents: 200,
  outlookMaxEvents: 200,
}

// Which table stores the connection for each integration.
export const INTEGRATION_TABLES: Record<IntegrationId, string> = {
  slack: 'slack_integrations',
  google_calendar: 'calendar_integrations',
  gmail: 'gmail_integrations',
  outlook: 'outlook_integrations',
  docusign: 'docusign_integrations',
  cloud_storage: 'cloud_storage_integrations',
}

// OAuth provider config. Real authorize endpoints; credentials come from env so
// nothing is hard-coded. If the client id is unset the integration shows as
// "Setup required" rather than failing at runtime.
type Provider = { authorizeUrl: string; tokenUrl: string; scopes: string; clientIdEnv: string; clientSecretEnv: string; tokenColumn: string }
export const PROVIDERS: Record<IntegrationId, Provider> = {
  slack:           { authorizeUrl: 'https://slack.com/oauth/v2/authorize', tokenUrl: 'https://slack.com/api/oauth.v2.access', scopes: 'chat:write,channels:read', clientIdEnv: 'SLACK_CLIENT_ID', clientSecretEnv: 'SLACK_CLIENT_SECRET', tokenColumn: 'workspace_token' },
  google_calendar: { authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth', tokenUrl: 'https://oauth2.googleapis.com/token', scopes: 'https://www.googleapis.com/auth/calendar.events', clientIdEnv: 'GOOGLE_CLIENT_ID', clientSecretEnv: 'GOOGLE_CLIENT_SECRET', tokenColumn: 'refresh_token' },
  gmail:           { authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth', tokenUrl: 'https://oauth2.googleapis.com/token', scopes: 'https://www.googleapis.com/auth/gmail.send', clientIdEnv: 'GOOGLE_CLIENT_ID', clientSecretEnv: 'GOOGLE_CLIENT_SECRET', tokenColumn: 'gmail_token' },
  outlook:         { authorizeUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize', tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token', scopes: 'Mail.Send Calendars.ReadWrite offline_access', clientIdEnv: 'MS_CLIENT_ID', clientSecretEnv: 'MS_CLIENT_SECRET', tokenColumn: 'access_token' },
  docusign:        { authorizeUrl: 'https://account.docusign.com/oauth/auth', tokenUrl: 'https://account.docusign.com/oauth/token', scopes: 'signature', clientIdEnv: 'DOCUSIGN_CLIENT_ID', clientSecretEnv: 'DOCUSIGN_CLIENT_SECRET', tokenColumn: 'docusign_token' },
  cloud_storage:   { authorizeUrl: 'https://www.dropbox.com/oauth2/authorize', tokenUrl: 'https://api.dropboxapi.com/oauth2/token', scopes: 'files.content.read', clientIdEnv: 'DROPBOX_CLIENT_ID', clientSecretEnv: 'DROPBOX_CLIENT_SECRET', tokenColumn: 'access_token' },
}

export function providerConfigured(id: IntegrationId): boolean {
  return !!process.env[PROVIDERS[id].clientIdEnv]
}

/**
 * Exchange an OAuth2 authorization code for a token and store the connection.
 * Wrapped in the standard timeout + try/catch + error-logging. Never throws.
 */
export async function exchangeAndStore(
  supabase: SupabaseClient, ownerId: string, id: IntegrationId, code: string, redirectUri: string
): Promise<{ ok: boolean; error?: string }> {
  const p = PROVIDERS[id]
  const clientId = process.env[p.clientIdEnv]
  const clientSecret = process.env[p.clientSecretEnv]
  if (!clientId || !clientSecret) {
    await logIntegrationError(supabase, ownerId, id, 'Provider not configured (missing client id/secret)')
    return { ok: false, error: 'not_configured' }
  }
  try {
    const body = new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: 'authorization_code' })
    const res = await withTimeout(fetch(p.tokenUrl, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body }))
    if (!res.ok) throw new Error(`Token exchange failed (${res.status})`)
    const json = await res.json() as { access_token?: string; refresh_token?: string }
    const token = json.refresh_token || json.access_token
    if (!token) throw new Error('No token in provider response')
    const row: Record<string, unknown> = { owner_id: ownerId, [p.tokenColumn]: token, last_status: 'ok' }
    if (json.refresh_token && 'refresh_token' in row === false) row.refresh_token = json.refresh_token
    if (id === 'cloud_storage') row.provider = 'dropbox'
    await supabase.from(INTEGRATION_TABLES[id]).upsert(row, { onConflict: 'owner_id' })
    return { ok: true }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Token exchange error'
    await logIntegrationError(supabase, ownerId, id, message)
    return { ok: false, error: message }
  }
}

export function buildAuthorizeUrl(id: IntegrationId, redirectUri: string, state: string): string | null {
  const p = PROVIDERS[id]
  const clientId = process.env[p.clientIdEnv]
  if (!clientId) return null
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: p.scopes,
    state,
    access_type: 'offline',
    prompt: 'consent',
  })
  return `${p.authorizeUrl}?${params.toString()}`
}

// Reject a promise if it does not settle within EXTERNAL_TIMEOUT_MS.
export function withTimeout<T>(p: Promise<T>, ms = EXTERNAL_TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Integration request timed out')), ms)
    p.then(v => { clearTimeout(timer); resolve(v) }, e => { clearTimeout(timer); reject(e) })
  })
}

// Record a failure to integration_errors. Never throws — best effort.
export async function logIntegrationError(
  supabase: SupabaseClient, ownerId: string, integrationType: string, message: string
) {
  try {
    await supabase.from('integration_errors').insert({ owner_id: ownerId, integration_type: integrationType, error_message: message.slice(0, 500) })
  } catch { /* swallow — logging must never break the app */ }
}

/**
 * Wrap any external API call: enforces the 10s timeout, catches every error,
 * logs failures, and updates the integration's last_status for the health dot.
 * Returns { ok, data?, error? } and NEVER throws.
 */
export async function safeExternal<T>(
  supabase: SupabaseClient, ownerId: string, id: IntegrationId, fn: () => Promise<T>
): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const data = await withTimeout(fn())
    await supabase.from(INTEGRATION_TABLES[id]).update({ last_status: 'ok' }).eq('owner_id', ownerId)
    return { ok: true, data }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown integration error'
    await logIntegrationError(supabase, ownerId, id, message)
    try { await supabase.from(INTEGRATION_TABLES[id]).update({ last_status: 'error' }).eq('owner_id', ownerId) } catch { /* ignore */ }
    return { ok: false, error: message }
  }
}

// Count rows created since `since` for a per-account rate check.
export async function countSince(supabase: SupabaseClient, table: string, ownerId: string, since: Date): Promise<number> {
  const { count } = await supabase.from(table).select('id', { count: 'exact', head: true })
    .eq('owner_id', ownerId).gte('created_at', since.toISOString())
  return count || 0
}

export function startOfToday(): Date { const d = new Date(); d.setHours(0, 0, 0, 0); return d }
export function startOfMonth(): Date { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1) }
