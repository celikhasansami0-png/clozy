export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ─── User & Auth ───────────────────────────────────────────────────────────

export type UserRole = "student" | "teaching_assistant" | "professor" | "academic_advisor" | "administrator" | "super_admin"
export type SubscriptionTier = "free" | "student_pro" | "team_pro" | "university"
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing" | "inactive"

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  university: string | null
  department: string | null
  role: UserRole
  created_at: string
  updated_at: string
  subscription_tier: SubscriptionTier
  subscription_status: SubscriptionStatus
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  language: SupportedLanguage
}

// ─── Internationalization ──────────────────────────────────────────────────

export type SupportedLanguage =
  | "en"
  | "tr"
  | "de"
  | "fr"
  | "es"
  | "ar"
  | "pt"
  | "it"
  | "ru"
  | "ja"
  | "zh"
  | "ko"

// ─── Courses ───────────────────────────────────────────────────────────────

export interface Course {
  id: string
  user_id: string
  title: string
  code: string | null
  professor: string | null
  semester: string | null
  credit_hours: number | null
  status: "active" | "completed" | "dropped"
  color: string
  created_at: string
  updated_at: string
}

// ─── Learn OS ──────────────────────────────────────────────────────────────

export type MaterialType =
  | "pdf"
  | "lecture_slides"
  | "handwritten_notes"
  | "video_transcript"
  | "youtube"
  | "textbook"
  | "custom"

export interface LearningMaterial {
  id: string
  user_id: string
  course_id: string | null
  title: string
  type: MaterialType
  file_url: string | null
  content: string | null
  topics: string[]
  processed: boolean
  created_at: string
  updated_at: string
}

export interface Flashcard {
  id: string
  user_id: string
  material_id: string | null
  course_id: string | null
  front: string
  back: string
  difficulty: "easy" | "medium" | "hard"
  next_review_at: string | null
  interval_days: number
  repetitions: number
  ease_factor: number
  created_at: string
  updated_at: string
}

export interface LearningSession {
  id: string
  user_id: string
  course_id: string | null
  duration_minutes: number
  topic: string | null
  mastery_score: number | null
  created_at: string
}

// ─── Exam OS ───────────────────────────────────────────────────────────────

export type QuestionType = "multiple_choice" | "short_answer" | "long_answer" | "true_false" | "fill_blank"
export type DifficultyLevel = "easy" | "medium" | "hard" | "very_hard"

export interface ExamQuestion {
  id: string
  exam_id: string
  question: string
  type: QuestionType
  options: string[] | null
  correct_answer: string
  explanation: string | null
  difficulty: DifficultyLevel
  topic: string | null
  marks: number
}

export interface Exam {
  id: string
  user_id: string
  course_id: string | null
  title: string
  type: "mock" | "past_paper" | "practice" | "oral" | "practical"
  duration_minutes: number | null
  total_marks: number | null
  questions: ExamQuestion[]
  status: "draft" | "ready" | "in_progress" | "completed"
  created_at: string
  updated_at: string
}

export interface ExamAttempt {
  id: string
  user_id: string
  exam_id: string
  score: number | null
  total_marks: number
  duration_minutes: number | null
  answers: Record<string, string>
  started_at: string
  completed_at: string | null
}

// ─── Assignment OS ─────────────────────────────────────────────────────────

export type AssignmentType =
  | "lab_report"
  | "research_report"
  | "technical_doc"
  | "case_study"
  | "essay"
  | "reflection"
  | "presentation"
  | "poster"

export type CitationFormat = "ieee" | "apa" | "mla" | "harvard" | "chicago" | "custom"

export interface Assignment {
  id: string
  user_id: string
  course_id: string | null
  title: string
  type: AssignmentType
  description: string | null
  citation_format: CitationFormat | null
  due_date: string | null
  word_count_target: number | null
  content: string | null
  status: "draft" | "in_progress" | "review" | "submitted"
  grade: string | null
  feedback: string | null
  created_at: string
  updated_at: string
}

// ─── Project OS ────────────────────────────────────────────────────────────

export type ProjectStatus = "planning" | "in_progress" | "review" | "completed" | "paused"
export type MilestoneStatus = "pending" | "in_progress" | "completed" | "overdue"

export interface Project {
  id: string
  user_id: string
  course_id: string | null
  title: string
  description: string | null
  status: ProjectStatus
  start_date: string | null
  end_date: string | null
  team_members: string[]
  tags: string[]
  created_at: string
  updated_at: string
}

export interface Milestone {
  id: string
  project_id: string
  user_id: string
  title: string
  description: string | null
  status: MilestoneStatus
  due_date: string | null
  completed_at: string | null
  order_index: number
  created_at: string
  updated_at: string
}

// ─── Research OS ───────────────────────────────────────────────────────────

export interface ResearchPaper {
  id: string
  user_id: string
  title: string
  authors: string[]
  publication_year: number | null
  journal: string | null
  doi: string | null
  abstract: string | null
  summary: string | null
  key_findings: string[]
  tags: string[]
  file_url: string | null
  created_at: string
  updated_at: string
}

// ─── Knowledge OS ──────────────────────────────────────────────────────────

export interface KnowledgeNote {
  id: string
  user_id: string
  course_id: string | null
  title: string
  content: string
  tags: string[]
  linked_note_ids: string[]
  created_at: string
  updated_at: string
}

// ─── Career OS ─────────────────────────────────────────────────────────────

export interface CareerProfile {
  id: string
  user_id: string
  target_role: string | null
  target_industry: string | null
  skills: string[]
  internship_experiences: Json[]
  projects_portfolio: Json[]
  created_at: string
  updated_at: string
}

// ─── Analytics ─────────────────────────────────────────────────────────────

export interface AcademicAnalytics {
  gpa: number | null
  courses_active: number
  courses_completed: number
  exams_taken: number
  exams_average_score: number
  assignments_submitted: number
  assignments_pending: number
  study_hours_this_week: number
  flashcards_reviewed_today: number
  exam_readiness_score: number
}

// ─── Tasks (Academic) ──────────────────────────────────────────────────────

export type AcademicTaskType =
  | "study"
  | "assignment"
  | "exam_prep"
  | "project_task"
  | "research"
  | "review_flashcards"
  | "attend_lecture"
  | "custom"

export type TaskStatus = "pending" | "in_progress" | "completed" | "skipped"
export type TaskPriority = "low" | "medium" | "high"

export interface AcademicTask {
  id: string
  user_id: string
  course_id: string | null
  title: string
  description: string | null
  type: AcademicTaskType
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

// ─── Usage Limits ──────────────────────────────────────────────────────────

export interface UsageLimits {
  id: string
  user_id: string
  month: string
  lessons_generated: number
  exams_generated: number
  assignments_generated: number
  projects_generated: number
  research_analyses: number
  translations: number
  semester_plans: number
  portfolios_generated: number
  reset_at: string
}

export const PLAN_LIMITS: Record<SubscriptionTier, {
  lessons_per_month: number
  exams_per_month: number
  assignments_per_month: number
  projects_max: number
  research_per_month: number
  unlimited: boolean
  collaboration: boolean
  team_members: number
}> = {
  free: {
    lessons_per_month: 1,
    exams_per_month: 1,
    assignments_per_month: 1,
    projects_max: 1,
    research_per_month: 1,
    unlimited: false,
    collaboration: false,
    team_members: 1,
  },
  student_pro: {
    lessons_per_month: -1,
    exams_per_month: -1,
    assignments_per_month: -1,
    projects_max: -1,
    research_per_month: -1,
    unlimited: true,
    collaboration: false,
    team_members: 1,
  },
  team_pro: {
    lessons_per_month: -1,
    exams_per_month: -1,
    assignments_per_month: -1,
    projects_max: -1,
    research_per_month: -1,
    unlimited: true,
    collaboration: true,
    team_members: 10,
  },
  university: {
    lessons_per_month: -1,
    exams_per_month: -1,
    assignments_per_month: -1,
    projects_max: -1,
    research_per_month: -1,
    unlimited: true,
    collaboration: true,
    team_members: -1,
  },
}
