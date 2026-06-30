export type JobStatus = 'In Progress' | 'On Track' | 'Delayed' | 'Complete'
export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'urgent' | 'high' | 'normal'
export type DocStatus = 'Approved' | 'Under Review' | 'Pending' | 'Rejected'

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

// Unified Document record. Merges the old `permits` tracking (number/type/status/
// submitted_date/notes) with the file-upload feature (file_* fields). A document
// may be metadata-only, file-only, or both.
export interface Doc {
  id: string
  project_id: string
  owner_id: string
  doc_number: string
  type: string
  status: DocStatus
  submitted_date: string | null
  notes: string
  file_name: string | null
  file_path: string | null
  file_size: number | null
  file_type: string | null
  uploaded_by: string | null
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
