import Link from "next/link"
import {
  ArrowRight,
  Brain,
  ClipboardCheck,
  FileText,
  FolderOpen,
  Database,
  Briefcase,
  BarChart2,
  Zap,
  GraduationCap,
  Microscope,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
              <GraduationCap className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-semibold text-slate-900 text-[15px] tracking-tight">
              Engineering Autopilot OS
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-slate-600">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 mb-10">
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          AI-Native Academic Operating System
        </div>

        <h1 className="text-6xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-6 max-w-4xl mx-auto">
          Your entire academic
          <br />
          journey on autopilot
        </h1>

        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
          Upload your academic material and the system will teach, train, organize, simulate,
          evaluate and optimize your entire academic journey.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link href="/auth/signup">
            <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white gap-2 h-12 px-8 text-[15px]">
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" variant="outline" className="h-12 px-8 text-[15px] border-slate-200">
              Sign in
            </Button>
          </Link>
        </div>

        <p className="mt-5 text-sm text-slate-400">
          Free forever · No credit card required · Every feature unlocked once
        </p>
      </section>

      {/* OS Modules Grid */}
      <section className="border-t border-slate-200 bg-slate-50/50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Ten systems. One operating system.
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Replace fragmented tools with a unified AI-powered execution layer for your academic life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {OS_MODULES.map((mod) => {
              const Icon = mod.icon
              return (
                <div
                  key={mod.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 hover:shadow-sm transition-all"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                    <Icon className="h-4.5 w-4.5 text-slate-700" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm mb-1">{mod.label}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{mod.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      <section className="mx-auto max-w-6xl px-6 py-20 space-y-24">
        {FEATURE_SECTIONS.map((section, i) => {
          const Icon = section.icon
          return (
            <div
              key={section.title}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${i % 2 === 1 ? "lg:grid-flow-dense" : ""}`}
            >
              <div className={i % 2 === 1 ? "lg:col-start-2" : ""}>
                <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 mb-4">
                  <Icon className="h-3.5 w-3.5" />
                  {section.module}
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4 leading-tight">
                  {section.title}
                </h2>
                <p className="text-slate-500 leading-relaxed mb-6">
                  {section.description}
                </p>
                <ul className="space-y-2.5">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <ChevronRight className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`rounded-2xl border border-slate-200 bg-slate-50 h-72 flex items-center justify-center ${i % 2 === 1 ? "lg:col-start-1" : ""}`}>
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-200">
                    <Icon className="h-6 w-6 text-slate-500" />
                  </div>
                  <span className="text-sm font-medium text-slate-400">{section.module}</span>
                </div>
              </div>
            </div>
          )
        })}
      </section>

      {/* Pricing */}
      <section className="border-t border-slate-200 bg-slate-50/50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Start free. Scale when you need.
            </h2>
            <p className="text-slate-500">
              Every premium feature has a free trial credit. Upgrade only when ready.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl p-7 text-left ${
                  plan.highlighted
                    ? "bg-slate-900 text-white border border-slate-900"
                    : "bg-white border border-slate-200"
                }`}
              >
                <div className="mb-5">
                  <h3 className={`font-semibold mb-1 ${plan.highlighted ? "text-white" : "text-slate-900"}`}>
                    {plan.name}
                  </h3>
                  <div className={`text-3xl font-bold mb-1 ${plan.highlighted ? "text-white" : "text-slate-900"}`}>
                    {plan.price === 0 ? "Free" : `$${plan.price}`}
                    {plan.price > 0 && (
                      <span className={`text-base font-normal ml-1 ${plan.highlighted ? "text-slate-400" : "text-slate-400"}`}>
                        /mo
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${plan.highlighted ? "text-slate-400" : "text-slate-500"}`}>
                    {plan.description}
                  </p>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className={`text-sm flex items-start gap-2 ${plan.highlighted ? "text-slate-300" : "text-slate-600"}`}>
                      <span className={`mt-0.5 ${plan.highlighted ? "text-slate-400" : "text-slate-400"}`}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup" className="block">
                  <Button
                    className={`w-full ${
                      plan.highlighted
                        ? "bg-white text-slate-900 hover:bg-slate-100"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
          Built for engineers who want to graduate better.
        </h2>
        <p className="text-slate-500 mb-10 max-w-xl mx-auto text-lg">
          Join engineering students using Autopilot OS to complete demanding degrees with maximum efficiency and minimum cognitive overhead.
        </p>
        <Link href="/auth/signup">
          <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white gap-2 h-13 px-10 text-[15px]">
            Get started for free
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200">
        <div className="mx-auto max-w-6xl px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-900">
              <GraduationCap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-600">Engineering Autopilot OS</span>
          </div>
          <p className="text-sm text-slate-400">
            The academic OS for engineering students.
          </p>
        </div>
      </footer>
    </div>
  )
}

const OS_MODULES = [
  { id: "learn", label: "Learn OS", description: "Personalized learning from any material", icon: Brain },
  { id: "exam", label: "Exam OS", description: "Mock exams, patterns, readiness scores", icon: ClipboardCheck },
  { id: "assignment", label: "Assignment OS", description: "AI-powered academic writing", icon: FileText },
  { id: "project", label: "Project OS", description: "Semester project management", icon: FolderOpen },
  { id: "research", label: "Research OS", description: "Paper analysis & literature review", icon: Microscope },
  { id: "knowledge", label: "Knowledge OS", description: "Your academic second brain", icon: Database },
  { id: "career", label: "Career OS", description: "Resume, portfolio, career roadmap", icon: Briefcase },
  { id: "analytics", label: "Analytics OS", description: "Academic performance visibility", icon: BarChart2 },
  { id: "collab", label: "Collaboration OS", description: "Team workspaces & shared knowledge", icon: FolderOpen },
  { id: "automation", label: "Automation OS", description: "Auto-scheduling & smart planning", icon: Zap },
]

const FEATURE_SECTIONS = [
  {
    module: "Learn OS",
    icon: Brain,
    title: "Upload once. Learn everything.",
    description: "Drop in PDFs, lecture slides, handwritten notes, or YouTube links. The system extracts topics, builds concept maps, generates flashcards, and adapts to your weaknesses.",
    bullets: [
      "PDF, slide, handwritten note, and video ingestion",
      "Automatic topic extraction and concept mapping",
      "Spaced repetition flashcard generation",
      "Adaptive tutoring based on your weak areas",
      "Exam readiness score updated in real time",
    ],
  },
  {
    module: "Exam OS",
    icon: ClipboardCheck,
    title: "Know the exam before you walk in.",
    description: "Feed the system past exams and it learns your professor's patterns. It predicts what's coming, generates targeted mock exams, and tells you your pass probability.",
    bullets: [
      "Past exam pattern recognition and clustering",
      "Professor behavior analysis",
      "Predicted score and pass/fail probability",
      "Timed, adaptive, oral and practical exam simulations",
      "Formula memorization system",
    ],
  },
  {
    module: "Assignment OS",
    icon: FileText,
    title: "Technical writing, automated.",
    description: "From lab reports to case studies. The system follows IEEE, APA, MLA and your university's custom templates — and generates complete, citation-accurate drafts.",
    bullets: [
      "Lab reports, research reports, technical docs",
      "IEEE, APA, MLA, Harvard, Chicago formatting",
      "Custom university template support",
      "Presentation scripts and poster drafts",
      "Plagiarism-aware generation",
    ],
  },
  {
    module: "Knowledge OS",
    icon: Database,
    title: "Your academic second brain.",
    description: "Every concept you encounter gets stored, linked, and searchable. Cross-course intelligence surfaces connections between subjects you didn't know were related.",
    bullets: [
      "Semantic search across all your materials",
      "Automatic concept linking and knowledge graph",
      "Cross-course intelligence",
      "Long-term memory that survives semesters",
      "Personal academic database",
    ],
  },
]

const PRICING = [
  {
    name: "Free",
    price: 0,
    description: "One lifetime trial credit per feature",
    highlighted: false,
    features: [
      "1 lesson generation",
      "1 exam generation",
      "1 assignment generation",
      "1 project generation",
      "1 research analysis",
    ],
    cta: "Get started free",
  },
  {
    name: "Student Pro",
    price: 19,
    description: "Unlimited academic usage",
    highlighted: true,
    features: [
      "Unlimited AI tutoring",
      "Unlimited exam generation",
      "Unlimited assignments & projects",
      "All 10 OS modules",
      "Knowledge graph + Career OS",
    ],
    cta: "Start Student Pro",
  },
  {
    name: "Team Pro",
    price: 49,
    description: "Student Pro + collaboration",
    highlighted: false,
    features: [
      "Everything in Student Pro",
      "Team project workspaces",
      "Shared knowledge systems",
      "Collaborative assignments",
      "Up to 10 team members",
    ],
    cta: "Start Team Pro",
  },
]
