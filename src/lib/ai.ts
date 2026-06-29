import Anthropic from '@anthropic-ai/sdk'

// Default to the most capable Opus model; override with ANTHROPIC_MODEL
// (e.g. claude-sonnet-4-6 for a cheaper chat tier).
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8'

export function aiEnabled() {
  return !!process.env.ANTHROPIC_API_KEY
}

let client: Anthropic | null = null
function getClient() {
  if (!client) client = new Anthropic() // reads ANTHROPIC_API_KEY from env
  return client
}

export type ChatMessage = { role: 'user' | 'assistant'; content: string }

const BIONOVA_SYSTEM = `You are @Bionova, the in-app AI assistant for BioNova — a project
operations platform for solar EPC (engineering, procurement, construction) teams and energy
consultants. You help project managers, PV designers and installers reason about project
health, permits, interconnection, commissioning timelines, crew workload and risk.

Be concise and practical. Use solar/energy domain language (kW/MW, modules, inverters,
racking, interconnection, PTO, AHJ). When given project context, ground every answer in it.
If you don't have enough data, say so plainly.`

function textOf(res: Anthropic.Message): string {
  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim()
}

/** @Bionova chat — real Anthropic response, or a graceful mock when no key is set. */
export async function bionovaChat(messages: ChatMessage[], context?: string): Promise<string> {
  if (!aiEnabled()) return mockChat(messages, context)
  const system = context ? `${BIONOVA_SYSTEM}\n\n## Current workspace\n${context}` : BIONOVA_SYSTEM
  const res = await getClient().messages.create({
    model: MODEL,
    max_tokens: 1024,
    system,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  })
  return textOf(res)
}

/** Report agent — AI project-health summary, or a deterministic mock when no key is set. */
export async function projectSummary(context: string): Promise<string> {
  if (!aiEnabled()) return mockSummary(context)
  const res = await getClient().messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: `${BIONOVA_SYSTEM}\n\nYou are generating an executive project-health summary for a
solar EPC portfolio. Output 3 short sections in markdown-free plain text:
"Overall", "Risks", and "Recommended next steps". Keep it under 180 words.`,
    messages: [{ role: 'user', content: `Summarize the health of this portfolio:\n\n${context}` }],
  })
  return textOf(res)
}

// ── Mock fallbacks (used when ANTHROPIC_API_KEY is unset) ────────────────────
function mockChat(messages: ChatMessage[], context?: string): string {
  const last = messages.filter((m) => m.role === 'user').pop()?.content || ''
  return [
    `(@Bionova demo mode — set ANTHROPIC_API_KEY for live answers.)`,
    ``,
    `You asked: "${last.slice(0, 200)}"`,
    context
      ? `Based on your current workspace, focus on the projects flagged "Delayed" and any permit stuck in "Under Review". I'd prioritise interconnection items first — they gate PTO.`
      : `Add your Supabase data and an Anthropic key and I'll ground answers in your live projects.`,
  ].join('\n')
}

function mockSummary(_context: string): string {
  return [
    'Overall: Portfolio is broadly on track; one site is delayed in engineering and a few permits are still under review.',
    '',
    'Risks: Interconnection revisions and a permit sitting in review beyond two weeks could push PTO dates. One project is behind on completion versus phase.',
    '',
    'Recommended next steps: Chase the flagged permit with the AHJ, lock the interconnection study, and rebalance crew onto the delayed engineering package.',
    '',
    '(Demo summary — set ANTHROPIC_API_KEY for a live, data-grounded report.)',
  ].join('\n')
}
