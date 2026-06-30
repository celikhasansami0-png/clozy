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

const DOPPIO_SYSTEM = `You are @Doppio, the in-app AI assistant for Doppio — a project
operations platform used by teams across many industries. You help project managers and
their teams reason about project health, documents, deadlines, workload and risk.

Be concise and practical. Adapt to whatever industry the workspace data implies rather than
assuming one. When given project context, ground every answer in it. If you don't have enough
data, say so plainly.`

function textOf(res: Anthropic.Message): string {
  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim()
}

/** @Doppio chat — real Anthropic response, or a graceful mock when no key is set. */
export async function doppioChat(messages: ChatMessage[], context?: string): Promise<string> {
  if (!aiEnabled()) return mockChat(messages, context)
  const system = context ? `${DOPPIO_SYSTEM}\n\n## Current workspace\n${context}` : DOPPIO_SYSTEM
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
    system: `${DOPPIO_SYSTEM}\n\nYou are generating an executive project-health summary for a
portfolio of projects. Output 3 short sections in markdown-free plain text:
"Overall", "Risks", and "Recommended next steps". Keep it under 180 words.`,
    messages: [{ role: 'user', content: `Summarize the health of this portfolio:\n\n${context}` }],
  })
  return textOf(res)
}

export type Insight = { icon: 'risk' | 'document' | 'task' | 'team' | 'trend'; title: string; detail: string }

/** AI Insights — 3–5 short, actionable insights grounded in the workspace. */
export async function aiInsights(context: string): Promise<Insight[]> {
  if (!aiEnabled()) return mockInsights()
  try {
    const res = await getClient().messages.create({
      model: MODEL,
      max_tokens: 700,
      system: `${DOPPIO_SYSTEM}\n\nYou generate concise, actionable dashboard insights for a project
operator. Return ONLY a JSON array (no prose, no markdown fences) of 3 to 5 objects, each
{"icon","title","detail"}. icon must be one of: "risk","document","task","team","trend". title is
<= 6 words. detail is one actionable sentence <= 22 words grounded in the data provided.`,
      messages: [{ role: 'user', content: `Workspace data:\n\n${context}\n\nReturn the JSON array.` }],
    })
    const raw = textOf(res)
    const start = raw.indexOf('[')
    const end = raw.lastIndexOf(']')
    if (start === -1 || end === -1) return mockInsights()
    const parsed = JSON.parse(raw.slice(start, end + 1)) as Insight[]
    return parsed.slice(0, 5).filter((i) => i && i.title && i.detail)
  } catch {
    return mockInsights()
  }
}

function mockInsights(): Insight[] {
  return [
    { icon: 'risk', title: 'Tasks approaching deadline', detail: 'Several open tasks are due within 3 days — prioritise these before they slip overdue.' },
    { icon: 'document', title: 'Document stuck in review', detail: 'A document has been "Under Review" beyond two weeks; follow up to unblock the project.' },
    { icon: 'team', title: 'Rebalance team workload', detail: 'Workload is uneven — reassign tasks from the busiest member to those with capacity.' },
    { icon: 'trend', title: 'Completion trending up', detail: 'Task completion rose over the last period; keep momentum on delayed projects.' },
  ]
}

// ── Mock fallbacks (used when ANTHROPIC_API_KEY is unset) ────────────────────
function mockChat(messages: ChatMessage[], context?: string): string {
  const last = messages.filter((m) => m.role === 'user').pop()?.content || ''
  return [
    `(@Doppio demo mode — set ANTHROPIC_API_KEY for live answers.)`,
    ``,
    `You asked: "${last.slice(0, 200)}"`,
    context
      ? `Based on your current workspace, focus on the projects flagged "Delayed" and any document stuck in "Under Review". I'd prioritise the items closest to their deadline first.`
      : `Add your Supabase data and an Anthropic key and I'll ground answers in your live projects.`,
  ].join('\n')
}

function mockSummary(_context: string): string {
  return [
    'Overall: Portfolio is broadly on track; one project is delayed and a few documents are still under review.',
    '',
    'Risks: A document sitting in review beyond two weeks could push deadlines. One project is behind on completion versus its current phase.',
    '',
    'Recommended next steps: Chase the flagged document to approval, and rebalance the team onto the delayed project.',
    '',
    '(Demo summary — set ANTHROPIC_API_KEY for a live, data-grounded report.)',
  ].join('\n')
}
