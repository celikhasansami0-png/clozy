import type { SupportedLanguage } from "@/types"

export const APP_NAME = "Engineering Autopilot OS"
export const APP_TAGLINE = "Your Academic Operating System"
export const APP_DESCRIPTION = "Upload your academic material and the system will teach, train, organize, simulate, evaluate and optimize your entire academic journey."

export const OS_MODULES = [
  {
    id: "learn",
    label: "Learn OS",
    description: "Transform content into personalized learning",
    href: "/learn",
    icon: "Brain",
  },
  {
    id: "exam",
    label: "Exam OS",
    description: "Maximize exam performance",
    href: "/exam",
    icon: "ClipboardCheck",
  },
  {
    id: "assignment",
    label: "Assignment OS",
    description: "Automate academic writing",
    href: "/assignment",
    icon: "FileText",
  },
  {
    id: "project",
    label: "Project OS",
    description: "Manage semester-long projects",
    href: "/project",
    icon: "FolderOpen",
  },
  {
    id: "research",
    label: "Research OS",
    description: "Support technical research",
    href: "/research",
    icon: "Microscope",
  },
  {
    id: "knowledge",
    label: "Knowledge OS",
    description: "Your academic second brain",
    href: "/knowledge",
    icon: "Database",
  },
  {
    id: "career",
    label: "Career OS",
    description: "Connect academics to outcomes",
    href: "/career",
    icon: "Briefcase",
  },
]

export const SYSTEM_MODULES = [
  {
    id: "analytics",
    label: "Analytics OS",
    description: "Academic performance visibility",
    href: "/analytics",
    icon: "BarChart2",
  },
  {
    id: "automation",
    label: "Automation OS",
    description: "Reduce manual academic work",
    href: "/automation",
    icon: "Zap",
  },
]

export const SUPPORTED_LANGUAGES: { code: SupportedLanguage; label: string; nativeLabel: string }[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "tr", label: "Turkish", nativeLabel: "Türkçe" },
  { code: "de", label: "German", nativeLabel: "Deutsch" },
  { code: "fr", label: "French", nativeLabel: "Français" },
  { code: "es", label: "Spanish", nativeLabel: "Español" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية" },
  { code: "pt", label: "Portuguese", nativeLabel: "Português" },
  { code: "it", label: "Italian", nativeLabel: "Italiano" },
  { code: "ru", label: "Russian", nativeLabel: "Русский" },
  { code: "ja", label: "Japanese", nativeLabel: "日本語" },
  { code: "zh", label: "Chinese", nativeLabel: "中文" },
  { code: "ko", label: "Korean", nativeLabel: "한국어" },
]

export const USER_ROLES = [
  { id: "student", label: "Student" },
  { id: "teaching_assistant", label: "Teaching Assistant" },
  { id: "professor", label: "Professor" },
  { id: "academic_advisor", label: "Academic Advisor" },
  { id: "administrator", label: "Administrator" },
  { id: "super_admin", label: "Super Administrator" },
] as const

export const CITATION_FORMATS = [
  { id: "ieee", label: "IEEE" },
  { id: "apa", label: "APA" },
  { id: "mla", label: "MLA" },
  { id: "harvard", label: "Harvard" },
  { id: "chicago", label: "Chicago" },
  { id: "custom", label: "Custom" },
] as const

export const ASSIGNMENT_TYPES = [
  { id: "lab_report", label: "Lab Report" },
  { id: "research_report", label: "Research Report" },
  { id: "technical_doc", label: "Technical Documentation" },
  { id: "case_study", label: "Case Study" },
  { id: "essay", label: "Essay" },
  { id: "reflection", label: "Reflection Paper" },
  { id: "presentation", label: "Presentation Script" },
  { id: "poster", label: "Poster Draft" },
] as const

export const DIFFICULTY_LEVELS = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
  { id: "very_hard", label: "Very Hard" },
] as const

export const PRICING_PLANS = [
  {
    id: "free",
    name: "Free",
    tier: "free" as const,
    price: 0,
    interval: "month" as const,
    stripe_price_id: "",
    description: "Try every premium feature once",
    features: [
      "1 lesson generation credit",
      "1 exam generation credit",
      "1 assignment generation credit",
      "1 project generation credit",
      "1 research analysis credit",
      "1 translation credit",
      "1 semester planning credit",
      "1 portfolio generation credit",
    ],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    id: "student_pro",
    name: "Student Pro",
    tier: "student_pro" as const,
    price: 19,
    interval: "month" as const,
    stripe_price_id: process.env.NEXT_PUBLIC_STRIPE_STUDENT_PRO_PRICE_ID ?? "",
    description: "Unlimited academic usage",
    features: [
      "Unlimited AI tutoring",
      "Unlimited exam generation",
      "Unlimited assignments",
      "Unlimited projects",
      "Unlimited research analysis",
      "All 10 OS modules",
      "Knowledge graph",
      "Career OS",
      "Spaced repetition system",
      "Priority support",
    ],
    cta: "Start Student Pro",
    highlighted: true,
  },
  {
    id: "team_pro",
    name: "Team Pro",
    tier: "team_pro" as const,
    price: 49,
    interval: "month" as const,
    stripe_price_id: process.env.NEXT_PUBLIC_STRIPE_TEAM_PRO_PRICE_ID ?? "",
    description: "Everything in Student Pro + collaboration",
    features: [
      "Everything in Student Pro",
      "Team project workspaces",
      "Shared knowledge systems",
      "Collaborative assignments",
      "Team analytics dashboard",
      "Up to 10 members",
    ],
    cta: "Start Team Pro",
    highlighted: false,
  },
]
