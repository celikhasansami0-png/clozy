/**
 * High-fidelity mock outputs for the Scouting AI endpoints.
 * Used by the MockProvider in services/ai.ts when no live model key is set,
 * so the full product is demoable end-to-end without an API key.
 *
 * Each request embeds a marker (see MARKERS) plus a JSON `INPUT:` payload.
 * The MockProvider routes on the marker and returns a contextual response.
 */

export const MARKERS = {
  parseIcp: "SCOUTING_PARSE_ICP",
  generateLeads: "SCOUTING_GENERATE_LEADS",
  research: "SCOUTING_RESEARCH",
  sequence: "SCOUTING_SEQUENCE",
  classify: "SCOUTING_CLASSIFY",
  voice: "SCOUTING_VOICE",
} as const

function extractInput(prompt: string): Record<string, unknown> {
  const idx = prompt.indexOf("INPUT:")
  if (idx === -1) return {}
  try {
    return JSON.parse(prompt.slice(idx + "INPUT:".length).trim())
  } catch {
    return {}
  }
}

const FIRST_NAMES = ["Elena", "Jonas", "Aisha", "Diego", "Mei", "Caleb", "Nadia", "Theo", "Yuki", "Omar"]
const LAST_NAMES = ["Park", "Schneider", "Khan", "Romero", "Tanaka", "Brooks", "Petrov", "Lindqvist", "Adeyemi", "Costa"]
const COMPANIES = [
  ["Brightloop", "brightloop.io"],
  ["Cartograph", "cartograph.dev"],
  ["Nimbus Stack", "nimbusstack.com"],
  ["Verity AI", "verity.ai"],
  ["Foundry Metrics", "foundrymetrics.com"],
  ["Saltbox", "saltbox.io"],
  ["Querio", "querio.app"],
  ["Harborline", "harborline.co"],
]
const TITLES = ["Head of Growth", "VP of Sales", "Founder & CEO", "RevOps Lead", "Head of Sales"]
const COLORS = ["bg-indigo-500", "bg-rose-500", "bg-emerald-500", "bg-sky-500", "bg-amber-500", "bg-violet-500", "bg-teal-500", "bg-orange-500"]
const SIGNAL_BANK = [
  { type: "funding", strength: "strong", label: "Raised a recent round", detail: "Closed funding in the last 90 days" },
  { type: "hiring", strength: "strong", label: "Hiring sales roles", detail: "Multiple open AE / SDR roles" },
  { type: "content", strength: "medium", label: "Engaged on relevant content", detail: "Posted about an adjacent problem" },
  { type: "growth", strength: "medium", label: "Headcount growing", detail: "Team grew 20%+ in 6 months" },
  { type: "competitor", strength: "medium", label: "Engaged with a competitor", detail: "Interacted with a competitor post" },
  { type: "tech", strength: "weak", label: "Adopted complementary tool", detail: "Recently added a stack tool" },
]

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length]
}

export function mockParseIcp(prompt: string) {
  const { text } = extractInput(prompt) as { text?: string }
  const lower = (text ?? "").toLowerCase()
  const industries: string[] = []
  if (lower.includes("saas")) industries.push("SaaS")
  if (lower.includes("fintech")) industries.push("Fintech")
  if (lower.includes("devtool") || lower.includes("dev tool")) industries.push("DevTools")
  if (industries.length === 0) industries.push("SaaS")

  const fundingStages: string[] = []
  if (lower.includes("series a")) fundingStages.push("series_a")
  if (lower.includes("seed")) fundingStages.push("seed")
  if (lower.includes("series b")) fundingStages.push("series_b_plus")
  if (fundingStages.length === 0) fundingStages.push("series_a")

  const jobTitles: string[] = []
  if (lower.includes("vp")) jobTitles.push("VP of Sales")
  if (lower.includes("growth")) jobTitles.push("Head of Growth")
  if (lower.includes("founder")) jobTitles.push("Founder")
  if (jobTitles.length === 0) jobTitles.push("Head of Growth", "VP of Sales")

  const keywords: string[] = []
  if (lower.includes("hiring")) keywords.push("hiring sales reps")
  if (lower.includes("salesforce")) keywords.push("uses Salesforce")
  if (lower.includes("aws")) keywords.push("built on AWS")

  return {
    name: `${industries[0]} — ${jobTitles[0]}`,
    industries,
    employeeMin: lower.includes("enterprise") ? 200 : 30,
    employeeMax: lower.includes("enterprise") ? 1000 : 200,
    fundingStages,
    geographies: lower.includes("europe") ? ["EU (Other)"] : ["United States"],
    jobTitles,
    keywords,
    exclusions: [] as string[],
  }
}

export function mockGenerateLeads(prompt: string) {
  const input = extractInput(prompt) as { count?: number; icp?: { jobTitles?: string[]; fundingStages?: string[] } }
  const count = Math.min(input.count ?? 8, 12)
  const leads = Array.from({ length: count }).map((_, i) => {
    const icpScore = 40 - (i % 5) * 2
    const sigCount = i % 3 === 0 ? 3 : i % 3 === 1 ? 2 : 1
    const signals = Array.from({ length: sigCount }).map((__, j) => ({
      ...pick(SIGNAL_BANK, i + j),
      detectedAt: new Date().toISOString(),
    }))
    const intentScore = Math.min(40, signals.reduce((s, sg) => s + (sg.strength === "strong" ? 16 : sg.strength === "medium" ? 9 : 4), 0))
    const engagementScore = 11 + (i % 9)
    return {
      firstName: pick(FIRST_NAMES, i),
      lastName: pick(LAST_NAMES, i + 3),
      title: input.icp?.jobTitles?.[i % (input.icp.jobTitles.length || 1)] ?? pick(TITLES, i),
      company: pick(COMPANIES, i)[0],
      companyDomain: pick(COMPANIES, i)[1],
      avatarColor: pick(COLORS, i),
      employeeCount: 25 + ((i * 17) % 160),
      fundingStage: input.icp?.fundingStages?.[0] ?? "series_a",
      location: pick(["San Francisco, CA", "Austin, TX", "New York, NY", "London, UK", "Berlin, DE", "Remote (US)"], i),
      techStack: pick([["Salesforce", "Outreach"], ["HubSpot", "Apollo"], ["Pipedrive", "Clay"]], i),
      lastActivity: pick(["Posted 2 days ago", "Commented yesterday", "Hiring update this week", "No recent activity"], i),
      intentSignals: signals,
      icpScore,
      intentScore,
      engagementScore,
      totalScore: icpScore + intentScore + engagementScore,
    }
  })
  return { leads }
}

export function mockResearch(prompt: string) {
  const input = extractInput(prompt) as { firstName?: string; company?: string; title?: string }
  const name = input.firstName ?? "the lead"
  const company = input.company ?? "their company"
  return {
    hooks: [
      `${company} shows strong recent buying signals — time the outreach to that momentum`,
      `${name} has been publicly active about the exact problem your product solves`,
      `Their sales org is in a scaling phase, which raises urgency for outbound leverage`,
    ],
    companyContext: `${company} is in an active growth phase with recent funding and hiring signals, indicating budget and intent to expand their sales motion.`,
    personalContext: `${name} (${input.title ?? "decision maker"}) is engaged on LinkedIn around go-to-market and sales efficiency topics.`,
    recommendedAngle: `Lead with a specific observation about ${company}'s recent activity, then connect Scouting to faster, higher-quality outbound during their scaling phase. Keep it human, no pitch in the first touch.`,
    sources: [
      `linkedin.com/in/${name.toLowerCase()}`,
      `${input.company ? input.company.toLowerCase().replace(/\s+/g, "") : "company"}.com/careers`,
      "techcrunch.com",
    ],
  }
}

export function mockSequence(prompt: string) {
  const input = extractInput(prompt) as { firstName?: string; company?: string; hook?: string }
  const name = input.firstName ?? "there"
  const company = input.company ?? "your team"
  const hook = input.hook ?? `noticed ${company} is scaling fast`
  const messages = [
    {
      sequenceStep: 1,
      type: "connection_request",
      content: `Hey ${name} — ${hook}. I help teams like ${company} turn that momentum into pipeline without the spray-and-pray. Mind if I connect?`,
      personalizationHooks: [hook],
      confidence: 92,
    },
    {
      sequenceStep: 2,
      type: "message",
      content: `Thanks for connecting, ${name}! Quick one — with everything happening at ${company} right now, how are you handling outbound research and personalization? Most teams at this stage are doing it manually and it doesn't scale. Happy to share what's working for similar teams — no pitch.`,
      personalizationHooks: [hook, "scaling-phase outbound pain"],
      confidence: 88,
    },
    {
      sequenceStep: 3,
      type: "follow_up",
      content: `Following up, ${name} — one stat that surprised me: teams using researched, personalized outreach see 3-4x the reply rate of templated sequences. We help you get there without adding headcount. Worth a 15-min look?`,
      personalizationHooks: ["social proof", "reply-rate angle"],
      confidence: 84,
    },
    {
      sequenceStep: 4,
      type: "follow_up",
      content: `${name}, I'll keep this short — if outbound isn't a priority this quarter, no worries at all. If it is, I'd love to show you a side-by-side of how we'd approach ${company}'s ICP. Want me to send it over?`,
      personalizationHooks: ["breakup framing"],
      confidence: 81,
    },
    {
      sequenceStep: 5,
      type: "follow_up",
      content: `Last note from me, ${name} — leaving the door open. Whenever outbound moves up the list at ${company}, I'm one message away. Wishing you a strong quarter either way.`,
      personalizationHooks: ["door-open close"],
      confidence: 79,
    },
  ]
  return { messages }
}

export function mockClassify(prompt: string) {
  const input = extractInput(prompt) as { reply?: string }
  const reply = (input.reply ?? "").toLowerCase()
  let classification = "unclear"
  if (/out of office|ooo|on vacation|away until|limited access/.test(reply)) classification = "out_of_office"
  else if (/no thanks|not interested|remove me|unsubscribe|stop/.test(reply)) classification = "not_interested"
  else if (/yes|let'?s talk|book|calendar|send me|interested|this week|demo/.test(reply)) classification = "hot"
  else if (/tell me more|what does|how does|maybe|curious|what's the/.test(reply)) classification = "warm"
  else if (/not (right )?now|check back|next quarter|q[1-4]|later|circle/.test(reply)) classification = "nurture"

  const suggestedReplies =
    classification === "hot"
      ? [
          { label: "Book the meeting", tone: "aggressive", content: "Love it — here's my calendar: cal.com/you/30. Grab any slot and I'll come prepared with specific ideas." },
          { label: "Value first", tone: "soft", content: "Great! I'll send a quick 2-min overview tailored to you, then we can lock a time. What's your #1 priority right now?" },
        ]
      : classification === "warm"
        ? [
            { label: "Differentiate + book", tone: "aggressive", content: "Good question — short version: we research each lead live and write in your voice, so it's replies not volume. Easier to show — 15 min this week?" },
            { label: "Send proof", tone: "soft", content: "Happy to break it down. I'll send a quick example so you can see the difference vs templated sequences." },
            { label: "Clarify", tone: "clarifying", content: "Depends what's frustrating today — is it reply rates, personalization time, or list quality?" },
          ]
        : classification === "nurture"
          ? [{ label: "Schedule re-engage", tone: "soft", content: "Totally understand — I'll check back when the timing's better. I'll send the occasional useful benchmark in the meantime." }]
          : classification === "out_of_office"
            ? [{ label: "Auto-pause", tone: "soft", content: "No rush — enjoy the time off. I'll follow up when you're back." }]
            : classification === "not_interested"
              ? [{ label: "Graceful close", tone: "soft", content: "Totally fair — thanks for the quick reply. I'll close the loop here. Door's open if anything changes." }]
              : [{ label: "Clarify", tone: "clarifying", content: "Want to make sure I read that right — are you open to a quick chat, or is now not the time?" }]

  return { classification, suggestedReplies, reasoning: `Detected intent based on reply language.` }
}

export function mockVoice(prompt: string) {
  const input = extractInput(prompt) as { messages?: string[] }
  const samples = input.messages ?? []
  const joined = samples.join(" ").toLowerCase()
  const avgLen = samples.length ? Math.round(samples.reduce((s, m) => s + m.length, 0) / samples.length) : 280
  return {
    formalityLevel: joined.includes("hey") || joined.includes("quick") ? 2 : 3,
    avgMessageLength: avgLen,
    openingStyle: joined.includes("noticed") || joined.includes("saw") ? "observation" : "question",
    usesHumor: joined.includes("!") || joined.includes("haha"),
    characteristicPhrases: ["quick one", "noticed you", "worth a chat?"].filter(() => true),
    phrasesToAvoid: ["I hope this email finds you well", "circle back", "synergy"],
    signOffStyle: "Cheers",
    summary:
      "Casual, observation-led opener. Short and punchy. Leads with a specific signal, asks a low-friction question, avoids corporate filler.",
  }
}

export function routeScoutingMock(prompt: string): unknown | null {
  if (prompt.includes(MARKERS.parseIcp)) return mockParseIcp(prompt)
  if (prompt.includes(MARKERS.generateLeads)) return mockGenerateLeads(prompt)
  if (prompt.includes(MARKERS.research)) return mockResearch(prompt)
  if (prompt.includes(MARKERS.sequence)) return mockSequence(prompt)
  if (prompt.includes(MARKERS.classify)) return mockClassify(prompt)
  if (prompt.includes(MARKERS.voice)) return mockVoice(prompt)
  return null
}
