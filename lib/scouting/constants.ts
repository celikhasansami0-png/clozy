import type {
  PipelineStage,
  IntentSignalType,
  SignalStrength,
  ReplyClassification,
  SequenceStep,
  FundingStage,
} from "@/types/scouting"

export const APP_NAME = "Scouting"
export const APP_TAGLINE = "Find them. Write for them. Win them."
export const APP_DESCRIPTION =
  "AI-powered LinkedIn outreach for SaaS teams. Define your ideal customer — Scouting finds them, researches them, writes for them, follows up, and stops only when they reply."

// ─── Navigation modules ─────────────────────────────────────────────────────

export const SCOUTING_MODULES = [
  { id: "scout", label: "Scout", href: "/scout", icon: "Radar", description: "Find & qualify leads" },
  { id: "craft", label: "Craft", href: "/craft", icon: "PenLine", description: "Research & write" },
  { id: "sequence", label: "Sequence", href: "/sequence", icon: "GitBranch", description: "Send & follow up" },
  { id: "inbox", label: "Inbox", href: "/inbox", icon: "Inbox", description: "Reply intelligence" },
  { id: "pipeline", label: "Pipeline", href: "/pipeline", icon: "KanbanSquare", description: "CRM & reports" },
] as const

// ─── Industries / ICP options ───────────────────────────────────────────────

export const INDUSTRIES = [
  "SaaS",
  "Fintech",
  "DevTools",
  "E-commerce",
  "Healthcare Tech",
  "AI / ML",
  "Cybersecurity",
  "MarTech",
  "HR Tech",
  "Data & Analytics",
]

export const FUNDING_STAGES: { value: FundingStage; label: string }[] = [
  { value: "bootstrapped", label: "Bootstrapped" },
  { value: "pre_seed", label: "Pre-seed" },
  { value: "seed", label: "Seed" },
  { value: "series_a", label: "Series A" },
  { value: "series_b_plus", label: "Series B+" },
]

export const GEOGRAPHIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "EU (Other)",
  "Australia",
  "Remote / Global",
]

// ─── Pipeline stages ────────────────────────────────────────────────────────

export const PIPELINE_STAGES: { id: PipelineStage; label: string }[] = [
  { id: "prospected", label: "Prospected" },
  { id: "connection_sent", label: "Connection Sent" },
  { id: "connected", label: "Connected" },
  { id: "messaged", label: "Messaged" },
  { id: "replied", label: "Replied" },
  { id: "meeting_booked", label: "Meeting Booked" },
  { id: "qualified", label: "Qualified" },
  { id: "closed_won", label: "Closed Won" },
  { id: "closed_lost", label: "Closed Lost" },
  { id: "nurture", label: "Nurture" },
]

export const STAGE_COLORS: Record<PipelineStage, string> = {
  prospected: "bg-slate-100 text-slate-600 border-slate-200",
  connection_sent: "bg-sky-50 text-sky-700 border-sky-200",
  connected: "bg-blue-50 text-blue-700 border-blue-200",
  messaged: "bg-indigo-50 text-indigo-700 border-indigo-200",
  replied: "bg-violet-50 text-violet-700 border-violet-200",
  meeting_booked: "bg-amber-50 text-amber-700 border-amber-200",
  qualified: "bg-teal-50 text-teal-700 border-teal-200",
  closed_won: "bg-emerald-50 text-emerald-700 border-emerald-200",
  closed_lost: "bg-red-50 text-red-600 border-red-200",
  nurture: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
}

// ─── Intent signals ─────────────────────────────────────────────────────────

export const INTENT_SIGNAL_META: Record<
  IntentSignalType,
  { label: string; icon: string; dot: string; pill: string }
> = {
  funding: {
    label: "Funding",
    icon: "Banknote",
    dot: "bg-emerald-500",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  hiring: {
    label: "Hiring",
    icon: "UserPlus",
    dot: "bg-emerald-500",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  content: {
    label: "Content",
    icon: "MessageSquare",
    dot: "bg-amber-500",
    pill: "bg-amber-50 text-amber-700 border-amber-200",
  },
  competitor: {
    label: "Competitor",
    icon: "Swords",
    dot: "bg-amber-500",
    pill: "bg-amber-50 text-amber-700 border-amber-200",
  },
  growth: {
    label: "Growth",
    icon: "TrendingUp",
    dot: "bg-sky-500",
    pill: "bg-sky-50 text-sky-700 border-sky-200",
  },
  tech: {
    label: "Tech",
    icon: "Cpu",
    dot: "bg-sky-500",
    pill: "bg-sky-50 text-sky-700 border-sky-200",
  },
}

export const SIGNAL_STRENGTH_WEIGHT: Record<SignalStrength, number> = {
  strong: 1,
  medium: 0.6,
  weak: 0.3,
}

// ─── Reply classification ───────────────────────────────────────────────────

export const REPLY_CLASS_META: Record<
  ReplyClassification,
  { label: string; emoji: string; pill: string; action: string }
> = {
  hot: {
    label: "Hot",
    emoji: "🔥",
    pill: "bg-red-50 text-red-600 border-red-200",
    action: "Book meeting immediately",
  },
  warm: {
    label: "Warm",
    emoji: "🟡",
    pill: "bg-amber-50 text-amber-700 border-amber-200",
    action: "Send case study + book meeting",
  },
  nurture: {
    label: "Nurture",
    emoji: "🔵",
    pill: "bg-sky-50 text-sky-700 border-sky-200",
    action: "Schedule re-engagement",
  },
  not_interested: {
    label: "Not Interested",
    emoji: "⛔",
    pill: "bg-slate-100 text-slate-500 border-slate-200",
    action: "Mark closed, do not contact",
  },
  unclear: {
    label: "Unclear",
    emoji: "❓",
    pill: "bg-violet-50 text-violet-700 border-violet-200",
    action: "Confirm interpretation",
  },
  out_of_office: {
    label: "Out of Office",
    emoji: "🚫",
    pill: "bg-gray-100 text-gray-500 border-gray-200",
    action: "Pause sequence, resume in 5 days",
  },
}

// ─── Default cold-outreach sequence ─────────────────────────────────────────

export const DEFAULT_SEQUENCE: SequenceStep[] = [
  {
    step: 1,
    type: "connection_request",
    label: "Connection Request",
    delayDays: 0,
    condition: "Sent on launch",
    charLimit: 300,
  },
  {
    step: 2,
    type: "message",
    label: "First Message",
    delayDays: 1,
    condition: "If connection accepted",
    charLimit: null,
  },
  {
    step: 3,
    type: "follow_up",
    label: "Follow-up 1",
    delayDays: 5,
    condition: "If no reply",
    charLimit: null,
  },
  {
    step: 4,
    type: "follow_up",
    label: "Follow-up 2",
    delayDays: 7,
    condition: "If no reply",
    charLimit: null,
  },
  {
    step: 5,
    type: "follow_up",
    label: "Final Follow-up",
    delayDays: 10,
    condition: "If no reply (optional)",
    charLimit: null,
  },
]

// ─── Safety limits ──────────────────────────────────────────────────────────

export const SAFETY = {
  maxConnectionsPerDay: 20,
  maxMessagesPerDay: 50,
  minGapMinutes: 3,
  delayVariance: 0.3,
}

// ─── Spam trigger words for the quality gate ────────────────────────────────

export const SPAM_TRIGGERS = [
  "guarantee",
  "free money",
  "act now",
  "limited time",
  "100%",
  "risk-free",
  "buy now",
  "click here",
  "cheap",
  "winner",
]

// ─── Pricing ────────────────────────────────────────────────────────────────

export const SCOUTING_PLANS = [
  {
    name: "Starter",
    price: 49,
    annualPrice: 39,
    description: "For founders running their first outbound motion",
    highlighted: false,
    features: [
      "2 active campaigns",
      "200 leads / month",
      "400 AI messages",
      "1 voice profile",
      "Basic intent signals",
      "Weekly reports",
    ],
    cta: "Start free trial",
  },
  {
    name: "Growth",
    price: 99,
    annualPrice: 79,
    description: "For teams scaling pipeline without hiring SDRs",
    highlighted: true,
    features: [
      "Unlimited campaigns",
      "1,000 leads / month",
      "Unlimited AI messages",
      "3 voice profiles",
      "All 6 intent signals",
      "A/B testing + CRM sync",
      "Up to 5 team members",
    ],
    cta: "Start free trial",
  },
]
