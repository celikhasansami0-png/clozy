/**
 * Row mappers between Supabase rows (snake_case) and Scouting TS types (camelCase).
 * JSONB columns (intent_signals, research_brief, sequence, messages, etc.) pass through.
 */
import type {
  Lead,
  Campaign,
  Conversation,
  VoiceProfile,
  ICP,
  OutreachMessage,
} from "@/types/scouting"

type Row = Record<string, unknown>

// ─── Lead ─────────────────────────────────────────────────────────────────
export function rowToLead(r: Row): Lead {
  return {
    id: r.id as string,
    userId: r.user_id as string,
    campaignId: (r.campaign_id as string) ?? null,
    firstName: (r.first_name as string) ?? "",
    lastName: (r.last_name as string) ?? "",
    title: (r.title as string) ?? "",
    company: (r.company as string) ?? "",
    companyDomain: (r.company_domain as string) ?? "",
    linkedinUrl: (r.linkedin_url as string) ?? "",
    avatarColor: (r.avatar_color as string) ?? "bg-slate-500",
    employeeCount: (r.employee_count as number) ?? 0,
    fundingStage: (r.funding_stage as Lead["fundingStage"]) ?? "seed",
    lastFundingDate: (r.last_funding_date as string) ?? null,
    location: (r.location as string) ?? "",
    techStack: (r.tech_stack as string[]) ?? [],
    lastActivity: (r.last_activity as string) ?? "",
    icpScore: (r.icp_score as number) ?? 0,
    intentScore: (r.intent_score as number) ?? 0,
    engagementScore: (r.engagement_score as number) ?? 0,
    totalScore: (r.total_score as number) ?? 0,
    intentSignals: (r.intent_signals as Lead["intentSignals"]) ?? [],
    researchBrief: (r.research_brief as Lead["researchBrief"]) ?? null,
    stage: (r.stage as Lead["stage"]) ?? "prospected",
    status: (r.status as Lead["status"]) ?? "active",
    createdAt: (r.created_at as string) ?? "",
    updatedAt: (r.updated_at as string) ?? "",
    lastContactedAt: (r.last_contacted_at as string) ?? null,
  }
}

export function leadToRow(l: Partial<Lead>): Row {
  const row: Row = {}
  if (l.campaignId !== undefined) row.campaign_id = l.campaignId
  if (l.firstName !== undefined) row.first_name = l.firstName
  if (l.lastName !== undefined) row.last_name = l.lastName
  if (l.title !== undefined) row.title = l.title
  if (l.company !== undefined) row.company = l.company
  if (l.companyDomain !== undefined) row.company_domain = l.companyDomain
  if (l.linkedinUrl !== undefined) row.linkedin_url = l.linkedinUrl
  if (l.avatarColor !== undefined) row.avatar_color = l.avatarColor
  if (l.employeeCount !== undefined) row.employee_count = l.employeeCount
  if (l.fundingStage !== undefined) row.funding_stage = l.fundingStage
  if (l.lastFundingDate !== undefined) row.last_funding_date = l.lastFundingDate
  if (l.location !== undefined) row.location = l.location
  if (l.techStack !== undefined) row.tech_stack = l.techStack
  if (l.lastActivity !== undefined) row.last_activity = l.lastActivity
  if (l.icpScore !== undefined) row.icp_score = l.icpScore
  if (l.intentScore !== undefined) row.intent_score = l.intentScore
  if (l.engagementScore !== undefined) row.engagement_score = l.engagementScore
  if (l.totalScore !== undefined) row.total_score = l.totalScore
  if (l.intentSignals !== undefined) row.intent_signals = l.intentSignals
  if (l.researchBrief !== undefined) row.research_brief = l.researchBrief
  if (l.stage !== undefined) row.stage = l.stage
  if (l.status !== undefined) row.status = l.status
  if (l.lastContactedAt !== undefined) row.last_contacted_at = l.lastContactedAt
  return row
}

// ─── Campaign ─────────────────────────────────────────────────────────────
export function rowToCampaign(r: Row): Campaign {
  return {
    id: r.id as string,
    userId: r.user_id as string,
    name: (r.name as string) ?? "",
    description: (r.description as string) ?? "",
    type: (r.type as Campaign["type"]) ?? "cold_outreach",
    status: (r.status as Campaign["status"]) ?? "draft",
    icpId: (r.icp_id as string) ?? null,
    dailyConnectionLimit: (r.daily_connection_limit as number) ?? 20,
    dailyMessageLimit: (r.daily_message_limit as number) ?? 50,
    activeHoursStart: (r.active_hours_start as string) ?? "09:00",
    activeHoursEnd: (r.active_hours_end as string) ?? "18:00",
    activeDays: (r.active_days as Campaign["activeDays"]) ?? ["mon", "tue", "wed", "thu", "fri"],
    timezone: (r.timezone as string) ?? "America/New_York",
    sequence: (r.sequence as Campaign["sequence"]) ?? [],
    totalLeads: (r.total_leads as number) ?? 0,
    connectionsSent: (r.connections_sent as number) ?? 0,
    connectionsAccepted: (r.connections_accepted as number) ?? 0,
    messagesSent: (r.messages_sent as number) ?? 0,
    repliesReceived: (r.replies_received as number) ?? 0,
    meetingsBooked: (r.meetings_booked as number) ?? 0,
    createdAt: (r.created_at as string) ?? "",
    updatedAt: (r.updated_at as string) ?? "",
  }
}

export function campaignToRow(c: Partial<Campaign>): Row {
  const row: Row = {}
  if (c.name !== undefined) row.name = c.name
  if (c.description !== undefined) row.description = c.description
  if (c.type !== undefined) row.type = c.type
  if (c.status !== undefined) row.status = c.status
  if (c.icpId !== undefined) row.icp_id = c.icpId
  if (c.dailyConnectionLimit !== undefined) row.daily_connection_limit = c.dailyConnectionLimit
  if (c.dailyMessageLimit !== undefined) row.daily_message_limit = c.dailyMessageLimit
  if (c.activeHoursStart !== undefined) row.active_hours_start = c.activeHoursStart
  if (c.activeHoursEnd !== undefined) row.active_hours_end = c.activeHoursEnd
  if (c.activeDays !== undefined) row.active_days = c.activeDays
  if (c.timezone !== undefined) row.timezone = c.timezone
  if (c.sequence !== undefined) row.sequence = c.sequence
  if (c.totalLeads !== undefined) row.total_leads = c.totalLeads
  if (c.connectionsSent !== undefined) row.connections_sent = c.connectionsSent
  if (c.connectionsAccepted !== undefined) row.connections_accepted = c.connectionsAccepted
  if (c.messagesSent !== undefined) row.messages_sent = c.messagesSent
  if (c.repliesReceived !== undefined) row.replies_received = c.repliesReceived
  if (c.meetingsBooked !== undefined) row.meetings_booked = c.meetingsBooked
  return row
}

// ─── Voice Profile ────────────────────────────────────────────────────────
export function rowToVoiceProfile(r: Row): VoiceProfile {
  return {
    id: r.id as string,
    userId: r.user_id as string,
    formalityLevel: (r.formality_level as VoiceProfile["formalityLevel"]) ?? 3,
    avgMessageLength: (r.avg_message_length as number) ?? 300,
    openingStyle: (r.opening_style as VoiceProfile["openingStyle"]) ?? "observation",
    usesHumor: (r.uses_humor as boolean) ?? false,
    characteristicPhrases: (r.characteristic_phrases as string[]) ?? [],
    phrasesToAvoid: (r.phrases_to_avoid as string[]) ?? [],
    signOffStyle: (r.sign_off_style as string) ?? "",
    trainingMessages: (r.training_messages as string[]) ?? [],
    version: (r.version as number) ?? 1,
    createdAt: (r.created_at as string) ?? "",
    updatedAt: (r.updated_at as string) ?? "",
  }
}

export function voiceProfileToRow(v: Partial<VoiceProfile>): Row {
  const row: Row = {}
  if (v.formalityLevel !== undefined) row.formality_level = v.formalityLevel
  if (v.avgMessageLength !== undefined) row.avg_message_length = v.avgMessageLength
  if (v.openingStyle !== undefined) row.opening_style = v.openingStyle
  if (v.usesHumor !== undefined) row.uses_humor = v.usesHumor
  if (v.characteristicPhrases !== undefined) row.characteristic_phrases = v.characteristicPhrases
  if (v.phrasesToAvoid !== undefined) row.phrases_to_avoid = v.phrasesToAvoid
  if (v.signOffStyle !== undefined) row.sign_off_style = v.signOffStyle
  if (v.trainingMessages !== undefined) row.training_messages = v.trainingMessages
  if (v.version !== undefined) row.version = v.version
  return row
}

// ─── ICP ──────────────────────────────────────────────────────────────────
export function rowToIcp(r: Row): ICP {
  return {
    id: r.id as string,
    user_id: r.user_id as string,
    name: (r.name as string) ?? "",
    industries: (r.industries as string[]) ?? [],
    employeeMin: (r.employee_min as number) ?? 0,
    employeeMax: (r.employee_max as number) ?? 10000,
    fundingStages: (r.funding_stages as ICP["fundingStages"]) ?? [],
    geographies: (r.geographies as string[]) ?? [],
    jobTitles: (r.job_titles as string[]) ?? [],
    keywords: (r.keywords as string[]) ?? [],
    exclusions: (r.exclusions as string[]) ?? [],
    createdAt: (r.created_at as string) ?? "",
    updatedAt: (r.updated_at as string) ?? "",
  }
}

export function icpToRow(i: Partial<ICP>): Row {
  const row: Row = {}
  if (i.name !== undefined) row.name = i.name
  if (i.industries !== undefined) row.industries = i.industries
  if (i.employeeMin !== undefined) row.employee_min = i.employeeMin
  if (i.employeeMax !== undefined) row.employee_max = i.employeeMax
  if (i.fundingStages !== undefined) row.funding_stages = i.fundingStages
  if (i.geographies !== undefined) row.geographies = i.geographies
  if (i.jobTitles !== undefined) row.job_titles = i.jobTitles
  if (i.keywords !== undefined) row.keywords = i.keywords
  if (i.exclusions !== undefined) row.exclusions = i.exclusions
  return row
}

// ─── Conversation ─────────────────────────────────────────────────────────
export function rowToConversation(r: Row): Conversation {
  return {
    id: r.id as string,
    leadId: r.lead_id as string,
    campaignId: (r.campaign_id as string) ?? null,
    classification: (r.classification as Conversation["classification"]) ?? "unclear",
    unread: (r.unread as boolean) ?? true,
    lastMessageAt: (r.last_message_at as string) ?? "",
    messages: (r.messages as Conversation["messages"]) ?? [],
    suggestedReplies: (r.suggested_replies as Conversation["suggestedReplies"]) ?? [],
  }
}

export function conversationToRow(c: Partial<Conversation>): Row {
  const row: Row = {}
  if (c.leadId !== undefined) row.lead_id = c.leadId
  if (c.campaignId !== undefined) row.campaign_id = c.campaignId
  if (c.classification !== undefined) row.classification = c.classification
  if (c.unread !== undefined) row.unread = c.unread
  if (c.lastMessageAt !== undefined) row.last_message_at = c.lastMessageAt
  if (c.messages !== undefined) row.messages = c.messages
  if (c.suggestedReplies !== undefined) row.suggested_replies = c.suggestedReplies
  return row
}

// ─── Message ──────────────────────────────────────────────────────────────
export function rowToMessage(r: Row): OutreachMessage {
  const content = (r.content as string) ?? ""
  return {
    id: r.id as string,
    leadId: r.lead_id as string,
    campaignId: (r.campaign_id as string) ?? null,
    sequenceStep: (r.sequence_step as number) ?? 1,
    type: (r.type as OutreachMessage["type"]) ?? "message",
    direction: (r.direction as OutreachMessage["direction"]) ?? "outbound",
    content,
    generatedBy: (r.generated_by as OutreachMessage["generatedBy"]) ?? "ai",
    personalizationHooks: (r.personalization_hooks as string[]) ?? [],
    confidence: (r.confidence as number) ?? 0,
    quality: (r.quality as OutreachMessage["quality"]) ?? null,
    variant: (r.variant as OutreachMessage["variant"]) ?? null,
    status: (r.status as OutreachMessage["status"]) ?? "draft",
    charCount: content.length,
    sentAt: (r.sent_at as string) ?? null,
    createdAt: (r.created_at as string) ?? "",
  }
}

export function messageToRow(m: Partial<OutreachMessage>): Row {
  const row: Row = {}
  if (m.leadId !== undefined) row.lead_id = m.leadId
  if (m.campaignId !== undefined) row.campaign_id = m.campaignId
  if (m.sequenceStep !== undefined) row.sequence_step = m.sequenceStep
  if (m.type !== undefined) row.type = m.type
  if (m.direction !== undefined) row.direction = m.direction
  if (m.content !== undefined) row.content = m.content
  if (m.generatedBy !== undefined) row.generated_by = m.generatedBy
  if (m.personalizationHooks !== undefined) row.personalization_hooks = m.personalizationHooks
  if (m.confidence !== undefined) row.confidence = m.confidence
  if (m.quality !== undefined) row.quality = m.quality
  if (m.variant !== undefined) row.variant = m.variant
  if (m.status !== undefined) row.status = m.status
  if (m.sentAt !== undefined) row.sent_at = m.sentAt
  return row
}
