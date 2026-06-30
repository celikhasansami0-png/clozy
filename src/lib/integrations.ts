import type { SupabaseClient } from '@supabase/supabase-js'
import type { IntegrationId } from '@/config/integrations'

// Hard timeout for every external API call — the app must never block on a slow
// or unavailable third-party service.
export const EXTERNAL_TIMEOUT_MS = 10_000

// Per-account rate limits (enforced in code before any external call).
export const RATE_CAPS = {
  slackPerDay: 50,
  gmailPerDay: 50,
  calendarMaxEvents: 200,
}

// Which table stores the connection for each integration.
export const INTEGRATION_TABLES: Record<IntegrationId, string> = {
  slack: 'slack_integrations',
  google_calendar: 'calendar_integrations',
  gmail: 'gmail_integrations',
}

// OAuth provider config. Real authorize/token endpoints; credentials come from
// env so nothing is hard-coded. If the client id is unset the integration shows
// as "Setup required" rather than failing at runtime.
type Provider = { authorizeUrl: string; tokenUrl: string; scopes: string; clientIdEnv: string; clientSecretEnv: string }
export const PROVIDERS: Record<IntegrationId, Provider> = {
  slack:           { authorizeUrl: 'https://slack.com/oauth/v2/authorize', tokenUrl: 'https://slack.com/api/oauth.v2.access', scopes: 'chat:write,channels:read', clientIdEnv: 'SLACK_CLIENT_ID', clientSecretEnv: 'SLACK_CLIENT_SECRET' },
  google_calendar: { authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth', tokenUrl: 'https://oauth2.googleapis.com/token', scopes: 'https://www.googleapis.com/auth/calendar.events', clientIdEnv: 'GOOGLE_CLIENT_ID', clientSecretEnv: 'GOOGLE_CLIENT_SECRET' },
  gmail:           { authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth', tokenUrl: 'https://oauth2.googleapis.com/token', scopes: 'https://www.googleapis.com/auth/gmail.send', clientIdEnv: 'GOOGLE_CLIENT_ID', clientSecretEnv: 'GOOGLE_CLIENT_SECRET' },
}

export function providerConfigured(id: IntegrationId): boolean {
  return !!process.env[PROVIDERS[id].clientIdEnv]
}

export function buildAuthorizeUrl(id: IntegrationId, redirectUri: string, state: string): string | null {
  const p = PROVIDERS[id]
  const clientId = process.env[p.clientIdEnv]
  if (!clientId) return null
  const params = new URLSearchParams({
    client_id: clientId, redirect_uri: redirectUri, response_type: 'code',
    scope: p.scopes, state, access_type: 'offline', prompt: 'consent',
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
 * Wrap any external API call: enforces the 10s timeout, catches every error and
 * logs failures to integration_errors. Returns { ok, data?, error? } and NEVER
 * throws, so a slow/unavailable service can never break the core app.
 */
export async function safeExternal<T>(
  supabase: SupabaseClient, ownerId: string, type: IntegrationId, fn: () => Promise<T>
): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const data = await withTimeout(fn())
    return { ok: true, data }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown integration error'
    await logIntegrationError(supabase, ownerId, type, message)
    return { ok: false, error: message }
  }
}

/**
 * Exchange an OAuth2 authorization code for tokens and store the connection.
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
    const json = await res.json() as { access_token?: string; refresh_token?: string; team?: { id?: string; name?: string }; authed_user?: { access_token?: string } }

    let row: Record<string, unknown>
    if (id === 'slack') {
      row = { owner_id: ownerId, access_token: json.access_token || json.authed_user?.access_token, team_id: json.team?.id, team_name: json.team?.name }
    } else if (id === 'google_calendar') {
      row = { owner_id: ownerId, access_token: json.access_token, refresh_token: json.refresh_token, calendar_id: 'primary' }
    } else {
      row = { owner_id: ownerId, access_token: json.access_token, refresh_token: json.refresh_token }
    }
    if (!row.access_token && !row.refresh_token) throw new Error('No token in provider response')
    await supabase.from(INTEGRATION_TABLES[id]).upsert(row, { onConflict: 'owner_id' })
    return { ok: true }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Token exchange error'
    await logIntegrationError(supabase, ownerId, id, message)
    return { ok: false, error: message }
  }
}

// Refresh a Google access token from a stored refresh token (Calendar + Gmail).
// Returns null on any failure (caller handles gracefully).
export async function googleAccessToken(refreshToken: string): Promise<string | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret || !refreshToken) return null
  try {
    const body = new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: 'refresh_token' })
    const res = await withTimeout(fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body }))
    if (!res.ok) return null
    const json = await res.json() as { access_token?: string }
    return json.access_token || null
  } catch { return null }
}

export function startOfToday(): Date { const d = new Date(); d.setHours(0, 0, 0, 0); return d }

// Count rows of a log table since `since`, by the given timestamp column.
export async function countSince(
  supabase: SupabaseClient, table: string, ownerId: string, since: Date, column = 'created_at'
): Promise<number> {
  const { count } = await supabase.from(table).select('id', { count: 'exact', head: true })
    .eq('owner_id', ownerId).gte(column, since.toISOString())
  return count || 0
}
