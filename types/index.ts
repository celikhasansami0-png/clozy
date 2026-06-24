export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ─── User & Auth ───────────────────────────────────────────────────────────

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  company: string | null
  linkedin_url: string | null
  created_at: string
  updated_at: string
  subscription_tier: SubscriptionTier
  subscription_status: SubscriptionStatus
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
}

export type SubscriptionTier = "free" | "pro" | "enterprise"
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing" | "inactive"

// ─── Niches ────────────────────────────────────────────────────────────────

export type NicheId =
  | "med_spa"
  | "agencies"
  | "saas_founders"
  | "coaches"
  | "real_estate"
  | "consultants"
  | "ecommerce"
  | "financial_advisors"
  | "law_firms"
  | "recruiters"

export interface Niche {
  id: NicheId
  label: string
  description: string
  tone: "professional" | "casual" | "authoritative" | "empathetic" | "bold"
  icon: string
  color: string
  outreachStyle: string
  contentFocus: string[]
  painPoints: string[]
  ctaApproach: string
}

// ─── Growth Generator ──────────────────────────────────────────────────────

export interface GrowthInput {
  business_type: string
  niche: NicheId
  service: string
  target_client: string
  offer_price: number
  revenue_goal: number
  current_clients?: number
  main_challenges?: string[]
}

export interface PositioningMap {
  unique_value_proposition: string
  target_audience: string
  differentiation: string[]
  authority_signals: string[]
  transformation_statement: string
}

export interface OutreachSystem {
  connection_request: string
  initial_message: string
  follow_up_1: string
  follow_up_2: string
  value_message: string
  call_to_action: string
  objection_handlers: Record<string, string>
}

export interface ContentStrategy {
  content_pillars: string[]
  post_formats: string[]
  posting_frequency: string
  sample_hooks: string[]
  hashtag_strategy: string[]
}

export interface ClosingFramework {
  discovery_questions: string[]
  presentation_flow: string[]
  objection_responses: Record<string, string>
  closing_statement: string
  follow_up_sequence: string[]
}

export interface ExecutionDay {
  day: number
  focus: string
  tasks: string[]
  time_estimate: string
  kpi: string
}

export interface GrowthOutput {
  id: string
  user_id: string
  input: GrowthInput
  positioning: PositioningMap
  outreach_system: OutreachSystem
  content_strategy: ContentStrategy
  closing_framework: ClosingFramework
  execution_plan: ExecutionDay[]
  scripts: Record<string, string>
  created_at: string
  status: "draft" | "active" | "archived"
}

// ─── Toolkit / Report ──────────────────────────────────────────────────────

export interface Toolkit {
  id: string
  user_id: string
  title: string
  niche: NicheId
  growth_output: GrowthOutput
  status: "draft" | "active" | "archived"
  created_at: string
  updated_at: string
}

// ─── CRM / Leads ───────────────────────────────────────────────────────────

export type LeadStage =
  | "new"
  | "contacted"
  | "replied"
  | "booked"
  | "closed"
  | "lost"

export interface Lead {
  id: string
  user_id: string
  toolkit_id?: string
  name: string
  company: string | null
  linkedin_url: string | null
  email: string | null
  phone: string | null
  stage: LeadStage
  notes: string | null
  deal_value: number | null
  tags: string[]
  last_contact_at: string | null
  created_at: string
  updated_at: string
}

export interface LeadActivity {
  id: string
  lead_id: string
  user_id: string
  type: "note" | "message_sent" | "reply_received" | "meeting_booked" | "status_change"
  content: string
  metadata: Json
  created_at: string
}

// ─── Tasks ─────────────────────────────────────────────────────────────────

export type TaskType =
  | "send_connection_request"
  | "send_follow_up"
  | "post_content"
  | "review_replies"
  | "book_call"
  | "send_proposal"
  | "follow_up_call"
  | "custom"

export type TaskStatus = "pending" | "in_progress" | "completed" | "skipped"
export type TaskPriority = "low" | "medium" | "high"

export interface Task {
  id: string
  user_id: string
  toolkit_id?: string
  lead_id?: string
  title: string
  description: string | null
  type: TaskType
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  completed_at: string | null
  day_number: number | null
  created_at: string
  updated_at: string
}

// ─── Templates ─────────────────────────────────────────────────────────────

export type TemplateType =
  | "outreach_message"
  | "follow_up"
  | "content_post"
  | "closing_script"
  | "connection_request"
  | "objection_handler"

export interface Template {
  id: string
  user_id: string | null
  title: string
  description: string | null
  type: TemplateType
  niche: NicheId | "all"
  content: string
  variables: string[]
  is_system: boolean
  is_public: boolean
  usage_count: number
  tags: string[]
  created_at: string
  updated_at: string
}

// ─── Analytics ─────────────────────────────────────────────────────────────

export interface AnalyticsOverview {
  total_leads: number
  new_leads_this_month: number
  reply_rate: number
  conversion_rate: number
  pipeline_value: number
  active_campaigns: number
  meetings_booked: number
  deals_closed: number
  leads_by_stage: Record<LeadStage, number>
  leads_by_month: { month: string; count: number }[]
  revenue_by_month: { month: string; value: number }[]
}

// ─── Usage Limits ──────────────────────────────────────────────────────────

export interface UsageLimits {
  id: string
  user_id: string
  month: string
  toolkits_generated: number
  leads_count: number
  templates_used: number
  reports_generated: number
  reset_at: string
}

export const PLAN_LIMITS: Record<SubscriptionTier, {
  toolkits_per_month: number
  leads_max: number
  templates_access: boolean
  advanced_reports: boolean
  ai_scripts: boolean
  export: boolean
  team_members: number
}> = {
  free: {
    toolkits_per_month: 2,
    leads_max: 25,
    templates_access: false,
    advanced_reports: false,
    ai_scripts: false,
    export: false,
    team_members: 1,
  },
  pro: {
    toolkits_per_month: -1, // unlimited
    leads_max: -1,
    templates_access: true,
    advanced_reports: true,
    ai_scripts: true,
    export: true,
    team_members: 5,
  },
  enterprise: {
    toolkits_per_month: -1,
    leads_max: -1,
    templates_access: true,
    advanced_reports: true,
    ai_scripts: true,
    export: true,
    team_members: -1,
  },
}

// ─── Billing ───────────────────────────────────────────────────────────────

export interface PricingPlan {
  id: string
  name: string
  tier: SubscriptionTier
  price: number
  interval: "month" | "year"
  stripe_price_id: string
  features: string[]
  highlighted?: boolean
  cta: string
}
