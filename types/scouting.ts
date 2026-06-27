/**
 * Scouting — AI-powered LinkedIn B2B outreach platform.
 * Core data models shared across the five modules:
 * SCOUT → CRAFT → SEQUENCE → INBOX → PIPELINE.
 */

// ─── ICP (Ideal Customer Profile) ───────────────────────────────────────────

export type FundingStage =
  | "bootstrapped"
  | "pre_seed"
  | "seed"
  | "series_a"
  | "series_b_plus"

export interface ICP {
  id: string
  user_id: string
  name: string
  industries: string[]
  employeeMin: number
  employeeMax: number
  fundingStages: FundingStage[]
  geographies: string[]
  jobTitles: string[]
  keywords: string[]
  exclusions: string[]
  createdAt: string
  updatedAt: string
}

// ─── Intent Signals ─────────────────────────────────────────────────────────

export type IntentSignalType =
  | "funding"
  | "hiring"
  | "content"
  | "competitor"
  | "growth"
  | "tech"

export type SignalStrength = "strong" | "medium" | "weak"

export interface IntentSignal {
  type: IntentSignalType
  strength: SignalStrength
  label: string
  detail: string
  detectedAt: string
}

// ─── Research Brief ─────────────────────────────────────────────────────────

export interface ResearchBrief {
  hooks: string[]
  companyContext: string
  personalContext: string
  recommendedAngle: string
  sources: string[]
  generatedAt: string
}

// ─── Lead ───────────────────────────────────────────────────────────────────

export type PipelineStage =
  | "prospected"
  | "connection_sent"
  | "connected"
  | "messaged"
  | "replied"
  | "meeting_booked"
  | "qualified"
  | "closed_won"
  | "closed_lost"
  | "nurture"

export type LeadStatus =
  | "active"
  | "replied"
  | "booked"
  | "closed_won"
  | "closed_lost"
  | "nurture"

export interface Lead {
  id: string
  userId: string
  campaignId: string | null

  // Contact
  firstName: string
  lastName: string
  title: string
  company: string
  companyDomain: string
  linkedinUrl: string
  avatarColor: string

  // Enrichment
  employeeCount: number
  fundingStage: FundingStage
  lastFundingDate: string | null
  location: string
  techStack: string[]
  lastActivity: string

  // Scoring (icp 0-40, intent 0-40, engagement 0-20 → total 0-100)
  icpScore: number
  intentScore: number
  engagementScore: number
  totalScore: number

  intentSignals: IntentSignal[]
  researchBrief: ResearchBrief | null

  stage: PipelineStage
  status: LeadStatus

  createdAt: string
  updatedAt: string
  lastContactedAt: string | null
}

// ─── Voice Profile ──────────────────────────────────────────────────────────

export type OpeningStyle = "question" | "statement" | "compliment" | "observation"

export interface VoiceProfile {
  id: string
  userId: string
  formalityLevel: 1 | 2 | 3 | 4 | 5
  avgMessageLength: number
  openingStyle: OpeningStyle
  usesHumor: boolean
  characteristicPhrases: string[]
  phrasesToAvoid: string[]
  signOffStyle: string
  trainingMessages: string[]
  version: number
  createdAt: string
  updatedAt: string
}

// ─── Messages & Sequences ───────────────────────────────────────────────────

export type MessageType =
  | "connection_request"
  | "message"
  | "follow_up"
  | "reply"

export type MessageDirection = "outbound" | "inbound"

export type MessageStatus = "draft" | "approved" | "sent" | "delivered" | "read"

export type QualityVerdict = "approve" | "warn" | "reject"

export interface MessageQuality {
  verdict: QualityVerdict
  reasons: string[]
}

export interface OutreachMessage {
  id: string
  leadId: string
  campaignId: string | null
  sequenceStep: number
  type: MessageType
  direction: MessageDirection
  content: string
  generatedBy: "ai" | "human" | "ai_edited"
  personalizationHooks: string[]
  confidence: number
  quality: MessageQuality | null
  variant: "A" | "B" | null
  status: MessageStatus
  charCount: number
  sentAt: string | null
  createdAt: string
}

export interface SequenceStep {
  step: number
  type: MessageType
  label: string
  delayDays: number
  condition: string
  charLimit: number | null
}

// ─── Campaigns ──────────────────────────────────────────────────────────────

export type CampaignStatus = "draft" | "active" | "paused" | "completed"

export type CampaignType =
  | "cold_outreach"
  | "warm_outreach"
  | "event_based"
  | "re_engagement"

export type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"

export interface Campaign {
  id: string
  userId: string
  name: string
  description: string
  type: CampaignType
  status: CampaignStatus
  icpId: string | null

  // Settings
  dailyConnectionLimit: number
  dailyMessageLimit: number
  activeHoursStart: string
  activeHoursEnd: string
  activeDays: DayOfWeek[]
  timezone: string

  sequence: SequenceStep[]

  // Stats
  totalLeads: number
  connectionsSent: number
  connectionsAccepted: number
  messagesSent: number
  repliesReceived: number
  meetingsBooked: number

  createdAt: string
  updatedAt: string
}

// ─── Inbox / Reply Intelligence ─────────────────────────────────────────────

export type ReplyClassification =
  | "hot"
  | "warm"
  | "nurture"
  | "not_interested"
  | "unclear"
  | "out_of_office"

export interface ConversationMessage {
  id: string
  direction: MessageDirection
  content: string
  timestamp: string
}

export interface Conversation {
  id: string
  leadId: string
  campaignId: string | null
  classification: ReplyClassification
  unread: boolean
  lastMessageAt: string
  messages: ConversationMessage[]
  suggestedReplies: SuggestedReply[]
}

export interface SuggestedReply {
  label: string
  tone: "aggressive" | "soft" | "clarifying"
  content: string
}

// ─── Analytics ──────────────────────────────────────────────────────────────

export interface CampaignMetrics {
  acceptanceRate: number
  replyRate: number
  positiveReplyRate: number
  meetingBookedRate: number
  totalLeads: number
  avgDaysToReply: number
  avgDaysToMeeting: number
}

export interface TimeseriesPoint {
  label: string
  replyRate: number
  meetings: number
  sent: number
}
