export type ProjectStatus = "In Progress" | "On Track" | "Delayed";

export type Project = {
  id: string;
  owner_id: string;
  name: string;
  color: string;
  status: ProjectStatus;
  phase: string;
  completion: number;
  client_access_token: string;
  created_at: string;
};

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "normal" | "high";

export type Task = {
  id: string;
  project_id: string | null;
  owner_id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  due_date: string | null;
  tag: string;
  blocked_by_task_id: string | null;
  created_at: string;
};

export type CrewMember = {
  id: string;
  owner_id: string;
  name: string;
  initials: string;
  role: string;
  created_at: string;
};

export const PROJECT_COLOR_PRESETS = [
  "#CC785C",
  "#6B8E63",
  "#5C7CA8",
  "#B8955C",
  "#8C6BA8",
  "#8C8980",
] as const;
