// Rule-based AI helpers (no API key required) — shared, pure, client-safe.
import type { Task, Permit, CrewMember } from './types'

const DAY = 24 * 60 * 60 * 1000

/** Risk alerts: open tasks whose deadline is within `withinDays` (or overdue). */
export function riskAlerts(tasks: Task[], withinDays = 3, now: Date = new Date()) {
  const horizon = now.getTime() + withinDays * DAY
  return tasks
    .filter((t) => t.status !== 'done' && t.due_date)
    .map((t) => {
      const due = new Date(t.due_date as string).getTime()
      const days = Math.round((due - now.getTime()) / DAY)
      return { task: t, daysLeft: days }
    })
    .filter((r) => new Date(r.task.due_date as string).getTime() <= horizon)
    .sort((a, b) => a.daysLeft - b.daysLeft)
}

/** Auto-assign: suggest the team member with the fewest open (non-done) tasks. */
export function suggestAssignee(crew: CrewMember[], tasks: Task[]): CrewMember | null {
  if (crew.length === 0) return null
  const load = new Map<string, number>()
  for (const c of crew) load.set(c.id, 0)
  for (const t of tasks) {
    if (t.status !== 'done' && t.assignee_id && load.has(t.assignee_id)) {
      load.set(t.assignee_id, (load.get(t.assignee_id) || 0) + 1)
    }
  }
  return [...crew].sort((a, b) => (load.get(a.id) || 0) - (load.get(b.id) || 0))[0]
}

/** Permit agent: flag permits in "Under Review" longer than `days` days. */
export function flaggedPermits(permits: Permit[], days = 14, now: Date = new Date()) {
  const cutoff = now.getTime() - days * DAY
  return permits
    .filter((p) => p.status === 'Under Review' && p.submitted_date)
    .map((p) => {
      const submitted = new Date(p.submitted_date as string).getTime()
      return { permit: p, daysInReview: Math.round((now.getTime() - submitted) / DAY) }
    })
    .filter((r) => new Date(r.permit.submitted_date as string).getTime() <= cutoff)
    .sort((a, b) => b.daysInReview - a.daysInReview)
}
