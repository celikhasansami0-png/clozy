// Client-safe integration metadata (no secrets). Used to render the cards on the
// Integrations page. Server-side OAuth config + rate limits live in
// src/lib/integrations.ts.

export type IntegrationId =
  | 'slack'
  | 'google_calendar'
  | 'gmail'
  | 'outlook'
  | 'docusign'
  | 'cloud_storage'

export interface IntegrationMeta {
  id: IntegrationId
  name: string
  description: string
  cap: string
  logo: string // short label used in the placeholder logo tile
  color: string
}

export const INTEGRATIONS: IntegrationMeta[] = [
  { id: 'slack',           name: 'Slack',                description: 'Send notifications for task assignments, overdue tasks, document status changes and project completion to a Slack channel.', cap: 'Up to 50 messages / day', logo: 'Sl', color: '#611F69' },
  { id: 'google_calendar', name: 'Google Calendar',      description: 'Sync tasks that are urgent, high priority, or due within 14 days to your calendar.', cap: 'Up to 200 synced events', logo: 'GC', color: '#1A73E8' },
  { id: 'gmail',           name: 'Gmail',                description: 'Send a document or report directly from your connected Gmail account.', cap: 'Up to 50 emails / day', logo: 'Gm', color: '#EA4335' },
  { id: 'outlook',         name: 'Microsoft Outlook',    description: 'Send mail and sync your calendar with a Microsoft 365 account.', cap: 'Up to 50 emails / day · 200 events', logo: 'Ms', color: '#0078D4' },
  { id: 'docusign',        name: 'DocuSign',             description: 'Send a document from the Documents section for e-signature.', cap: 'Up to 30 requests / month', logo: 'Ds', color: '#D4AF37' },
  { id: 'cloud_storage',   name: 'Dropbox & Google Drive', description: 'Attach files from cloud storage to a project’s Documents instead of uploading from disk.', cap: 'Same 10MB / 50-doc limits apply', logo: 'Cs', color: '#0061FF' },
]
