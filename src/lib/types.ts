export type JobStatus = 'In Progress' | 'On Track' | 'Delayed' | 'Complete'
export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'urgent' | 'high' | 'normal'
export type PermitStatus = 'Approved' | 'Under Review' | 'Pending' | 'Rejected'

export interface Job {
  id: string
  name: string
  color: string
  status: JobStatus
  phase: string
  completion: number
  owner_id: string
  created_at: string
}

export interface Task {
  id: string
  job_id: string
  title: string
  status: TaskStatus
  priority: TaskPriority
  assignee_id: string | null
  due_date: string | null
  tag: string
  created_at: string
  assignee?: CrewMember
}

export interface Permit {
  id: string
  job_id: string
  permit_number: string
  type: string
  status: PermitStatus
  submitted_date: string
  notes: string
  created_at: string
  job?: Job
}

export interface CrewMember {
  id: string
  name: string
  initials: string
  role: string
  owner_id: string
  created_at: string
}
