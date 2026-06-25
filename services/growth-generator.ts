// @ts-nocheck
import type { GrowthInput, GrowthOutput, NicheId } from "@/types"
import { generateCompletion } from "./ai"
import { NICHES, buildNicheContext } from "@/lib/niches"
import { generateId } from "@/lib/utils"

const SYSTEM_PROMPT = `You are an elite LinkedIn growth strategist with 10+ years of experience helping B2B service businesses generate predictable revenue using LinkedIn.

You specialize in:
- Hyper-personalized outreach that converts
- Positioning that attracts premium clients
- Content that builds authority and generates inbound
- Closing frameworks that shorten sales cycles

Always respond with valid JSON matching the exact schema provided. Be specific, actionable, and niche-aware. Include real examples, specific numbers, and proven frameworks. Never be generic.`

function buildGrowthPrompt(input: GrowthInput, nicheContext: string): string {
  return `Generate a complete LinkedIn Growth OS for this business:

${nicheContext}

Business Type: ${input.business_type}
Service: ${input.service}
Target Client: ${input.target_client}
Offer Price: $${input.offer_price}
Revenue Goal: $${input.revenue_goal}/month
${input.current_clients ? `Current Clients: ${input.current_clients}` : ""}
${input.main_challenges?.length ? `Main Challenges: ${input.main_challenges.join(", ")}` : ""}

Generate a comprehensive growth system with this EXACT JSON structure:
{
  "positioning": {
    "unique_value_proposition": "...",
    "target_audience": "...",
    "differentiation": ["...", "...", "..."],
    "authority_signals": ["...", "...", "..."],
    "transformation_statement": "..."
  },
  "outreach_system": {
    "connection_request": "...",
    "initial_message": "...",
    "follow_up_1": "...",
    "follow_up_2": "...",
    "value_message": "...",
    "call_to_action": "...",
    "objection_handlers": {
      "not interested": "...",
      "too expensive": "...",
      "already have a system": "...",
      "too busy": "..."
    }
  },
  "content_strategy": {
    "content_pillars": ["...", "...", "...", "...", "..."],
    "post_formats": ["...", "...", "...", "...", "..."],
    "posting_frequency": "...",
    "sample_hooks": ["...", "...", "...", "...", "..."],
    "hashtag_strategy": ["...", "...", "...", "...", "..."]
  },
  "closing_framework": {
    "discovery_questions": ["...", "...", "...", "...", "..."],
    "presentation_flow": ["...", "...", "...", "...", "..."],
    "objection_responses": {
      "need to think about it": "...",
      "need to talk to my partner": "...",
      "not the right time": "..."
    },
    "closing_statement": "...",
    "follow_up_sequence": ["...", "...", "...", "..."]
  },
  "execution_plan": [
    {
      "day": 1,
      "focus": "...",
      "tasks": ["...", "...", "...", "..."],
      "time_estimate": "...",
      "kpi": "..."
    }
  ],
  "scripts": {
    "linkedin_headline": "...",
    "voice_message": "...",
    "email_followup": "...",
    "proposal_template": "..."
  }
}

Make every element specific to the niche (${NICHES[input.niche as NicheId]?.label ?? input.niche}), offer price ($${input.offer_price}), and revenue goal ($${input.revenue_goal}/mo). Use {{variable}} syntax for personalization placeholders.`
}

export async function generateGrowthSystem(
  input: GrowthInput,
  userId: string
): Promise<GrowthOutput> {
  const niche = NICHES[input.niche as NicheId]
  const nicheContext = buildNicheContext(niche, {
    service: input.service,
    target_client: input.target_client,
    offer_price: input.offer_price,
    revenue_goal: input.revenue_goal,
  })

  const rawOutput = await generateCompletion({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildGrowthPrompt(input, nicheContext) },
    ],
    temperature: 0.7,
    maxTokens: 4096,
    responseFormat: "json",
  })

  let parsed: Omit<GrowthOutput, "id" | "user_id" | "input" | "created_at" | "status">

  try {
    parsed = JSON.parse(rawOutput)
  } catch {
    throw new Error("AI returned invalid JSON. Please try again.")
  }

  const output: GrowthOutput = {
    id: generateId(),
    user_id: userId,
    input,
    positioning: parsed.positioning,
    outreach_system: parsed.outreach_system,
    content_strategy: parsed.content_strategy,
    closing_framework: parsed.closing_framework,
    execution_plan: parsed.execution_plan,
    scripts: parsed.scripts,
    created_at: new Date().toISOString(),
    status: "active",
  }

  return output
}

export function estimateMonthlyLeads(input: GrowthInput): {
  connections_per_day: number
  acceptance_rate: number
  reply_rate: number
  call_booking_rate: number
  close_rate: number
  estimated_clients_per_month: number
  estimated_revenue: number
} {
  const base = {
    connections_per_day: 20,
    acceptance_rate: 0.35,
    reply_rate: 0.25,
    call_booking_rate: 0.15,
    close_rate: 0.2,
  }

  const connectionsPerMonth = base.connections_per_day * 22
  const accepted = connectionsPerMonth * base.acceptance_rate
  const replies = accepted * base.reply_rate
  const calls = replies * base.call_booking_rate
  const clients = calls * base.close_rate
  const revenue = clients * input.offer_price

  return {
    ...base,
    estimated_clients_per_month: Math.ceil(clients),
    estimated_revenue: Math.ceil(revenue),
  }
}
