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
  niche?: string
  metadata?: Record<string, string | number>
  is_archived?: boolean
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

export interface DocumentRow {
  id: string
  project_id: string
  owner_id: string
  file_name: string
  file_path: string
  file_size: number
  file_type: string
  uploaded_by: string | null
  created_at: string
}

export interface NotificationRow {
  id: string
  owner_id: string
  title: string
  body: string
  type: string
  read: boolean
  link: string
  created_at: string
}

export interface ActivityLog {
  id: string
  project_id: string | null
  owner_id: string
  actor_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}
