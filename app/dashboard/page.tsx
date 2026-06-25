"use client"

import Link from "next/link"
import {
  Brain,
  ClipboardCheck,
  FileText,
  FolderOpen,
  Microscope,
  Database,
  Briefcase,
  BarChart2,
  Zap,
  ArrowRight,
  BookOpen,
  TrendingUp,
  Target,
  Clock,
  Plus,
} from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"

export default function DashboardPage() {
  const { profile } = useAuth()
  const firstName = profile?.full_name?.split(" ")[0] ?? "there"

  return (
    <div>
      <PageHeader
        title={`Good morning, ${firstName}`}
        description="Here is your academic performance overview."
        actions={
          <Link href="/learn">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white gap-2">
              <Plus className="h-4 w-4" />
              Add material
            </Button>
          </Link>
        }
      />

      <div className="p-6 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {METRICS.map((m) => {
            const Icon = m.icon
            return (
              <div key={m.label} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                    <Icon className="h-4.5 w-4.5 text-slate-600" />
                  </div>
                  <span className="text-xs text-slate-400">{m.period}</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-0.5">{m.value}</div>
                <div className="text-xs text-slate-500">{m.label}</div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Focus */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-900">
                  Today&apos;s Focus
                </CardTitle>
                <Link href="/automation">
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500 gap-1">
                    View plan <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {TODAY_TASKS.map((task) => (
                  <div
                    key={task.title}
                    className="flex items-start gap-3 rounded-md p-2.5 hover:bg-slate-50 transition-colors"
                  >
                    <div className={`mt-0.5 h-3 w-3 shrink-0 rounded-full border-2 ${
                      task.done ? "bg-slate-900 border-slate-900" : "border-slate-300"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium ${task.done ? "line-through text-slate-400" : "text-slate-700"}`}>
                        {task.title}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{task.course}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px] h-5 bg-slate-100 text-slate-500 hover:bg-slate-100 shrink-0">
                      {task.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Exams */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-900">
                  Upcoming Exams
                </CardTitle>
                <Link href="/exam">
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500 gap-1">
                    Exam OS <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {UPCOMING_EXAMS.length === 0 ? (
                  <div className="py-6 text-center">
                    <ClipboardCheck className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No exams scheduled</p>
                    <Link href="/exam" className="mt-2 inline-block text-xs text-slate-600 hover:underline">
                      Add an exam →
                    </Link>
                  </div>
                ) : (
                  UPCOMING_EXAMS.map((exam) => (
                    <div key={exam.title} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-slate-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-900 truncate">{exam.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{exam.course}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold text-slate-900">{exam.daysLeft}d</p>
                        <p className={`text-[10px] font-medium ${
                          exam.readiness >= 70 ? "text-emerald-600" : exam.readiness >= 40 ? "text-amber-600" : "text-red-500"
                        }`}>
                          {exam.readiness}% ready
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Active Assignments */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-900">
                  Active Assignments
                </CardTitle>
                <Link href="/assignment">
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500 gap-1">
                    Assignment OS <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="py-6 text-center">
                <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No active assignments</p>
                <Link href="/assignment" className="mt-2 inline-block text-xs text-slate-600 hover:underline">
                  Start an assignment →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access to OS Modules */}
        <div>
          <h2 className="text-sm font-semibold text-slate-900 mb-3">OS Modules</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {MODULE_CARDS.map((mod) => {
              const Icon = mod.icon
              return (
                <Link key={mod.href} href={mod.href}>
                  <div className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group">
                    <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-slate-200 transition-colors">
                      <Icon className="h-4 w-4 text-slate-600" />
                    </div>
                    <p className="text-sm font-medium text-slate-900">{mod.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{mod.description}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

const METRICS = [
  { label: "Study hours", value: "—", period: "This week", icon: Clock },
  { label: "Exam readiness", value: "—", period: "Avg. across courses", icon: Target },
  { label: "Flashcards reviewed", value: "—", period: "Today", icon: BookOpen },
  { label: "Assignments done", value: "—", period: "This month", icon: TrendingUp },
]

const TODAY_TASKS = [
  { title: "Review Thermodynamics Ch. 4", course: "MECH 301", type: "Study", done: false },
  { title: "Complete Lab Report draft", course: "CHEM 210", type: "Assignment", done: false },
  { title: "Practice past exam questions", course: "MATH 201", type: "Exam prep", done: true },
]

const UPCOMING_EXAMS: { title: string; course: string; daysLeft: number; readiness: number }[] = []

const MODULE_CARDS = [
  { href: "/learn", label: "Learn OS", description: "Upload & study", icon: Brain },
  { href: "/exam", label: "Exam OS", description: "Mock exams", icon: ClipboardCheck },
  { href: "/assignment", label: "Assignment OS", description: "Academic writing", icon: FileText },
  { href: "/project", label: "Project OS", description: "Project management", icon: FolderOpen },
  { href: "/research", label: "Research OS", description: "Paper analysis", icon: Microscope },
  { href: "/knowledge", label: "Knowledge OS", description: "Second brain", icon: Database },
  { href: "/career", label: "Career OS", description: "Career roadmap", icon: Briefcase },
  { href: "/analytics", label: "Analytics OS", description: "Performance data", icon: BarChart2 },
  { href: "/automation", label: "Automation OS", description: "Auto-scheduling", icon: Zap },
]
