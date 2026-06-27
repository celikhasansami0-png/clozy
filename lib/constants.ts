import type { SupportedLanguage } from "@/types"

export const APP_NAME = "Scouting"
export const APP_TAGLINE = "Find them. Write for them. Win them."
export const APP_DESCRIPTION = "AI-powered LinkedIn B2B outreach for SaaS teams. Scouting finds your ideal customers, researches them in real time, writes in your voice, and follows up until they reply."

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
    name: "Free Trial",
    tier: "free" as const,
    price: 0,
    interval: "month" as const,
    stripe_price_id: "",
    description: "14 days of full Growth access",
    features: [
      "Full Growth plan during trial",
      "All 6 intent signals",
      "Unlimited AI messages",
      "Real-time lead research",
      "Voice learning",
      "No credit card required",
    ],
    cta: "Start free trial",
    highlighted: false,
  },
  {
    id: "student_pro",
    name: "Starter",
    tier: "student_pro" as const,
    price: 49,
    interval: "month" as const,
    stripe_price_id: process.env.NEXT_PUBLIC_STRIPE_STUDENT_PRO_PRICE_ID ?? "",
    description: "For founders running their first outbound motion",
    features: [
      "2 active campaigns",
      "200 leads / month",
      "400 AI messages",
      "1 voice profile",
      "Basic intent signals (funding, hiring)",
      "Weekly reports",
    ],
    cta: "Choose Starter",
    highlighted: false,
  },
  {
    id: "team_pro",
    name: "Growth",
    tier: "team_pro" as const,
    price: 99,
    interval: "month" as const,
    stripe_price_id: process.env.NEXT_PUBLIC_STRIPE_TEAM_PRO_PRICE_ID ?? "",
    description: "For teams scaling pipeline without hiring SDRs",
    features: [
      "Unlimited campaigns",
      "1,000 leads / month",
      "Unlimited AI messages",
      "3 voice profiles",
      "All 6 intent signals",
      "A/B testing + CRM sync",
      "Up to 5 team members",
    ],
    cta: "Choose Growth",
    highlighted: true,
  },
]
