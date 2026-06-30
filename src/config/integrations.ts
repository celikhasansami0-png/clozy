// Client-safe integration metadata (no secrets). Used to render the cards on the
// Integrations page. Server-side OAuth config + rate limits live in
// src/lib/integrations.ts.

export type IntegrationId =
  | 'slack'
  | 'google_calendar'
  | 'gmail'

export interface IntegrationMeta {
  id: IntegrationId
  name: string
  description: string
  cap: string
  logo: string // short label used in the placeholder logo tile
  color: string
}

export const INTEGRATIONS: IntegrationMeta[] = [
  { id: 'slack',           name: 'Slack',           description: 'Send notifications for task assignments, overdue tasks, document approvals and project completion to a Slack channel.', cap: 'Up to 50 messages / day', logo: 'Sl', color: '#611F69' },
  { id: 'google_calendar', name: 'Google Calendar', description: 'Automatically create calendar events for tasks that are urgent, high priority, or due within 14 days.', cap: 'Up to 200 synced events', logo: 'GC', color: '#1A73E8' },
  { id: 'gmail',           name: 'Gmail',           description: 'Send a document or report directly from your connected Gmail account.', cap: 'Up to 50 emails / day', logo: 'Gm', color: '#EA4335' },
]
