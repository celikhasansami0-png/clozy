// Doppio configuration — fully industry-agnostic.
//
// The previous per-niche industry configuration map has been removed entirely.
// Doppio makes no industry-specific assumptions: every account uses the single
// GENERIC_MODULE below, and no UI label, stage, metric, or widget is ever
// swapped based on industry. The optional free-text "industry" a user enters at
// onboarding is stored for display only and never drives behaviour.

export interface ModuleConfig {
  name: string
  icon: string
  stages: string[]
  metrics: string[]
  terminology: { project: string; task: string; team: string; schedule: string }
  dashboardWidgets: string[]
}

// The single fixed module used everywhere. `stages` serve as generic project
// phases and task tags.
export const GENERIC_MODULE: ModuleConfig = {
  name: 'General',
  icon: '◆',
  stages: ['Planning', 'In Progress', 'Review', 'On Hold', 'Complete'],
  metrics: [],
  terminology: { project: 'Project', task: 'Task', team: 'Team', schedule: 'Schedule' },
  dashboardWidgets: ['activeProjects', 'urgentTasks', 'documentStatus', 'teamAvailability'],
}

// Generic document types (no industry assumptions).
export const DOCUMENT_TYPES = ['Agreement', 'Certificate', 'Report', 'Invoice', 'Contract', 'Other']

// Kept for API compatibility — Doppio has no niche-specific project fields.
export interface ProjectField { key: string; label: string; type: 'number' | 'text' }
export function getProjectFields(): ProjectField[] {
  return []
}

// Simple pluralizer for nav labels (Project → Projects).
export function plural(word: string): string {
  if (/s$/i.test(word)) return word
  if (/y$/i.test(word)) return word.slice(0, -1) + 'ies'
  return word + 's'
}
