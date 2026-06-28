/**
 * Demo-mode fallback. When Supabase isn't configured (placeholder env), the
 * Scouting hooks operate on in-memory demo data so the product is fully
 * navigable for sales demos. Once real Supabase env vars are set, the same
 * hooks persist to the database. Mirrors the MockProvider philosophy in
 * services/ai.ts.
 */

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return Boolean(
    url &&
      key &&
      !url.includes("placeholder") &&
      !key.includes("placeholder")
  )
}

export function genId(prefix = "id"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`
}
