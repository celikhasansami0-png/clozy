/**
 * Abstract AI layer — supports OpenAI and future model providers.
 * Switch provider by setting AI_PROVIDER env var.
 * Currently ships a high-fidelity mock for dev/demo.
 */

import { routeScoutingMock } from "@/lib/scouting/ai-mocks"

export interface AIMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface AICompletionOptions {
  messages: AIMessage[]
  temperature?: number
  maxTokens?: number
  responseFormat?: "text" | "json"
}

export interface AICompletionResult {
  content: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// ─── Provider Interface ───────────────────────────────────────────────────

interface AIProvider {
  complete(options: AICompletionOptions): Promise<AICompletionResult>
}

// ─── OpenAI Provider ─────────────────────────────────────────────────────

class OpenAIProvider implements AIProvider {
  private apiKey: string
  private model: string

  constructor(apiKey: string, model = "gpt-4o") {
    this.apiKey = apiKey
    this.model = model
  }

  async complete(options: AICompletionOptions): Promise<AICompletionResult> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: options.messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 4096,
        response_format: options.responseFormat === "json"
          ? { type: "json_object" }
          : { type: "text" },
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(`OpenAI API error: ${response.status} ${JSON.stringify(error)}`)
    }

    const data = await response.json()
    return {
      content: data.choices[0]?.message?.content ?? "",
      usage: data.usage,
    }
  }
}

// ─── Claude/Anthropic Provider ───────────────────────────────────────────

class AnthropicProvider implements AIProvider {
  private apiKey: string
  private model: string

  constructor(apiKey: string, model = "claude-sonnet-4-6") {
    this.apiKey = apiKey
    this.model = model
  }

  async complete(options: AICompletionOptions): Promise<AICompletionResult> {
    const systemMessage = options.messages.find((m) => m.role === "system")?.content
    const userMessages = options.messages.filter((m) => m.role !== "system")

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: options.maxTokens ?? 4096,
        system: systemMessage,
        messages: userMessages.map((m) => ({ role: m.role, content: m.content })),
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(`Anthropic API error: ${response.status} ${JSON.stringify(error)}`)
    }

    const data = await response.json()
    return {
      content: data.content[0]?.text ?? "",
      usage: {
        prompt_tokens: data.usage?.input_tokens ?? 0,
        completion_tokens: data.usage?.output_tokens ?? 0,
        total_tokens: (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0),
      },
    }
  }
}

// ─── Mock Provider (Demo/Dev) ─────────────────────────────────────────────

class MockProvider implements AIProvider {
  async complete(options: AICompletionOptions): Promise<AICompletionResult> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 700 + Math.random() * 500))

    const userMessage = options.messages.findLast((m) => m.role === "user")?.content ?? ""

    // Scouting module routing — returns contextual JSON for each AI endpoint
    const scoutingResult = routeScoutingMock(userMessage)
    if (scoutingResult !== null) {
      return {
        content: JSON.stringify(scoutingResult),
        usage: { prompt_tokens: 600, completion_tokens: 900, total_tokens: 1500 },
      }
    }

    // Return contextual mock responses based on the prompt
    if (userMessage.includes("growth system") || userMessage.includes("positioning")) {
      return {
        content: JSON.stringify(MOCK_GROWTH_OUTPUT),
        usage: { prompt_tokens: 500, completion_tokens: 1200, total_tokens: 1700 },
      }
    }

    return {
      content: "Mock AI response generated successfully.",
      usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
    }
  }
}

const MOCK_GROWTH_OUTPUT = {
  positioning: {
    unique_value_proposition: "We help service business owners generate 3-5 qualified calls per week using a systemized LinkedIn outreach engine — without paid ads, cold calling, or posting daily.",
    target_audience: "B2B service business owners doing $10K-$50K/month who want to predictably scale to 7 figures",
    differentiation: [
      "Done-with-you execution framework (not just strategy)",
      "Niche-specific scripts tested with 100+ clients",
      "Results in 21 days or we keep working for free",
    ],
    authority_signals: [
      "Generated $2.4M in pipeline for clients in 2024",
      "Featured in Forbes, Entrepreneur, and Business Insider",
      "500+ clients served across 12 industries",
    ],
    transformation_statement: "From struggling with inconsistent revenue to booking 4-6 high-ticket calls per week on autopilot",
  },
  outreach_system: {
    connection_request: "Hi {{name}}, I help {{niche}} owners scale past 7 figures without paid ads. Your work at {{company}} caught my attention — I think there's a big opportunity here. Mind if I connect?",
    initial_message: "Hey {{name}}, thanks for connecting! Quick question — are you currently happy with how many qualified leads you're generating each week, or is that something you're actively working to improve?",
    follow_up_1: "Hi {{name}}, wanted to follow up on my last message. I've been helping {{niche}} owners generate 3-5 qualified discovery calls per week using LinkedIn. Would it be worth a 15-min call to see if there's a fit?",
    follow_up_2: "Hey {{name}}, last note from me — I'm launching a new cohort for {{niche}} businesses next week. Only taking 3 clients. If growing your pipeline is a priority, let me know. Happy to share what's working.",
    value_message: "Hi {{name}}, I put together a quick breakdown of the 3-step LinkedIn system we're using to help {{niche}} owners generate clients. Would you want me to send it over?",
    call_to_action: "Would you be open to a 20-minute strategy call this week? No pitch — just want to share what's working for other {{niche}} businesses.",
    objection_handlers: {
      "not interested": "Totally fair — when would be a better time to revisit? Most of my clients said the same thing before seeing the results.",
      "too expensive": "Understood. What if I could show you how this generates $X in new revenue within 60 days — would the investment still feel too high?",
      "already have a system": "That's great! Curious — what's your current cost per acquisition? Most of my clients come to me because they want to lower that number.",
      "too busy": "That's exactly why I built this — it only takes 30 minutes per day once set up. Can we find 20 min this week to walk through it?",
    },
  },
  content_strategy: {
    content_pillars: ["Client Results & Case Studies", "Industry Insights & Data", "Behind-the-Scenes Process", "Contrarian Takes", "Frameworks & How-Tos"],
    post_formats: ["Story-based case study", "Numbered list insight", "Question + answer", "Controversial opinion", "Before/after transformation"],
    posting_frequency: "3-4 times per week (Mon, Wed, Thu, Fri)",
    sample_hooks: [
      "I helped a {{niche}} owner go from $8K to $52K/month in 90 days. Here's exactly what we did:",
      "Most {{niche}} owners waste $5,000/month on leads. Here's why and how to fix it:",
      "Controversial take: LinkedIn outreach doesn't work. (Unless you do this.)",
      "I just reviewed 100 LinkedIn profiles of {{niche}} owners. Only 3% had these 5 elements:",
      "The #1 reason {{niche}} owners struggle to hit consistent $20K months:",
    ],
    hashtag_strategy: ["#LinkedInMarketing", "#B2BSales", "#BusinessGrowth", "#ClientAcquisition", "#ServiceBusiness"],
  },
  closing_framework: {
    discovery_questions: [
      "What does your current client acquisition process look like?",
      "How many new clients are you looking to add each month?",
      "What's your biggest bottleneck right now — leads, conversions, or fulfillment?",
      "What have you tried before, and why didn't it work?",
      "If we could solve [main pain point] in the next 90 days, what would that mean for your business?",
    ],
    presentation_flow: [
      "Confirm their problem (mirror what they told you)",
      "Present the 3-step system with before/after framing",
      "Share a relevant case study with specific numbers",
      "Walk through what working together looks like",
      "Present investment and ROI calculation",
    ],
    objection_responses: {
      "need to think about it": "Totally — what specifically do you want to think through? I want to make sure you have everything you need to make the right decision.",
      "need to talk to my partner": "Of course. When can the three of us get on a call together?",
      "not the right time": "I hear you. What would need to be true for the timing to be right?",
    },
    closing_statement: "Based on everything you've shared, it sounds like [SOLUTION] is a good fit. The next step would be [ONBOARDING]. Are you ready to move forward today?",
    follow_up_sequence: [
      "Day 1: Send recap email with proposal",
      "Day 2: Text or voice message asking if they have questions",
      "Day 5: Share relevant case study",
      "Day 7: Final follow-up with deadline or bonus",
    ],
  },
  execution_plan: [
    { day: 1, focus: "Profile Optimization", tasks: ["Optimize LinkedIn headline", "Rewrite About section with value prop", "Add social proof to featured section", "Update banner image"], time_estimate: "2-3 hours", kpi: "Profile completeness score > 90%" },
    { day: 2, focus: "Target List Building", tasks: ["Define ideal client avatar in detail", "Build list of 50 qualified prospects", "Research each prospect's pain points", "Prepare personalized connection notes"], time_estimate: "2 hours", kpi: "50 qualified prospects identified" },
    { day: 3, focus: "First Connection Wave", tasks: ["Send 20 personalized connection requests", "Engage with 10 target prospects' content", "Comment on 5 industry leader posts", "Post first content piece"], time_estimate: "1.5 hours", kpi: "20 connection requests sent" },
    { day: 4, focus: "Content Creation Day", tasks: ["Write 3 posts for the week", "Create 1 case study post", "Engage with new connections' content", "Respond to all comments"], time_estimate: "2 hours", kpi: "3 posts scheduled" },
    { day: 5, focus: "Outreach Activation", tasks: ["Message accepted connections (Day 3)", "Send 20 new connection requests", "Follow up with Day 3 messages", "Book 1 discovery call"], time_estimate: "1.5 hours", kpi: "1 discovery call booked" },
    { day: 6, focus: "Review & Optimize", tasks: ["Review response rates from week", "Tweak message templates based on replies", "Send follow-up messages to non-responders", "Plan next week's content"], time_estimate: "1 hour", kpi: "Message optimization complete" },
    { day: 7, focus: "Discovery Call Day", tasks: ["Run discovery call(s)", "Send follow-up proposals", "Add new leads to CRM", "Post weekend reflection content"], time_estimate: "2 hours", kpi: "1+ discovery call completed" },
  ],
  scripts: {
    linkedin_headline: "I help {{niche}} owners generate 3-5 qualified calls/week using LinkedIn | {{X}} clients | {{result}}",
    voice_message: "Hey {{name}}, {{your_name}} here — saw you're a {{niche}} owner. Just wanted to reach out personally because I've been working with a handful of businesses just like yours and getting some great results. Would love to share what's working. Would you be open to a quick call this week?",
    email_followup: "Subject: Quick thought on {{company}}\n\nHey {{name}},\n\nFollowing up from our LinkedIn conversation.\n\nI put together a quick breakdown of how we've been helping {{niche}} owners add $15-30K/month in new revenue using LinkedIn.\n\nWould it be valuable if I sent it over?\n\nBest,\n{{your_name}}",
    proposal_template: "{{name}},\n\nBased on our conversation, here's what I'm proposing:\n\n**The Goal:** Help you add {{X}} new clients per month\n**The System:** 3-phase LinkedIn acquisition engine\n**The Timeline:** 60-90 days to full implementation\n**The Investment:** ${{price}}\n**The Guarantee:** {{guarantee}}\n\nReady to move forward? Reply 'YES' and I'll send the agreement.\n\n{{your_name}}",
  },
}

// ─── Factory ──────────────────────────────────────────────────────────────

function createAIProvider(): AIProvider {
  const explicit = process.env.AI_PROVIDER
  const provider = explicit ?? (
    process.env.ANTHROPIC_API_KEY ? "anthropic" :
    process.env.OPENAI_API_KEY ? "openai" :
    "mock"
  )

  switch (provider) {
    case "openai":
      return new OpenAIProvider(
        process.env.OPENAI_API_KEY!,
        process.env.OPENAI_MODEL ?? "gpt-4o"
      )
    case "anthropic":
      return new AnthropicProvider(
        process.env.ANTHROPIC_API_KEY!,
        process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6"
      )
    default:
      return new MockProvider()
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────

let aiProvider: AIProvider | null = null

export function getAIProvider(): AIProvider {
  if (!aiProvider) {
    aiProvider = createAIProvider()
  }
  return aiProvider
}

export async function generateCompletion(options: AICompletionOptions): Promise<string> {
  const provider = getAIProvider()
  const result = await provider.complete(options)
  return result.content
}
