"use client"

import Link from "next/link"
import {
  Brain, ClipboardCheck, FileText, FolderOpen, Microscope, Database, Briefcase,
  BarChart2, Zap, ArrowRight, BookOpen, TrendingUp, Target, Clock, Plus, Flame,
} from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { useTasks } from "@/hooks/use-tasks"
import { useExams } from "@/hooks/use-exams"
import { useAssignments } from "@/hooks/use-assignments"
import { useFlashcards } from "@/hooks/use-flashcards"
import { useGamification, BADGES } from "@/hooks/use-gamification"

export default function DashboardPage() {
  const { profile } = useAuth()
  const firstName = profile?.full_name?.split(" ")[0] ?? "there"

  const gamification = useGamification()
  const { tasks, todaysTasks, completedCount } = useTasks()
  const { exams } = useExams()
  const { assignments, active: activeAssignments } = useAssignments()
  const { flashcards } = useFlashcards()

  const now = new Date()
  const dueToday = tasks.filter((t) => {
    if (!t.due_date || t.status === "completed") return false
    return new Date(t.due_date).toDateString() === now.toDateString()
  })

  const upcomingExams = exams
    .filter((e) => e.status === "ready")
    .slice(0, 3)

  const dueForReview = flashcards.filter((f) => {
    if (!f.next_review_at) return true
    return new Date(f.next_review_at) <= now
  })

  const metrics = [
    { label: "Tasks due today", value: dueToday.length, period: "Today", icon: Clock },
    { label: "Exam readiness", value: upcomingExams.length > 0 ? `${upcomingExams.length} upcoming` : "—", period: "Scheduled exams", icon: Target },
    { label: "Cards to review", value: dueForReview.length, period: "Due for review", icon: BookOpen },
    { label: "Assignments done", value: completedCount, period: "Total completed", icon: TrendingUp },
  ]

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m) => {
            const Icon = m.icon
            return (
              <div key={m.label} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                    <Icon className="h-4 w-4 text-slate-600" />
                  </div>
                  <span className="text-xs text-slate-400">{m.period}</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-0.5">{m.value}</div>
                <div className="text-xs text-slate-500">{m.label}</div>
              </div>
            )
          })}
        </div>

        {/* Gamification streak + XP bar */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${gamification.streak > 0 ? "bg-orange-100" : "bg-slate-100"}`}>
              <Flame className={`h-5 w-5 ${gamification.streak > 0 ? "text-orange-500" : "text-slate-400"}`} />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 leading-none">{gamification.streak} day{gamification.streak !== 1 ? "s" : ""}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Study streak</p>
            </div>
          </div>

          <div className="flex-1 min-w-0 sm:px-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-700">Level {gamification.level}</span>
              <span className="text-[11px] text-slate-400">{gamification.xp} XP · {gamification.xpToNextLevel} to next</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-slate-900 h-2 rounded-full transition-all"
                style={{ width: `${Math.round((1 - gamification.xpToNextLevel / 200) * 100)}%` }}
              />
            </div>
          </div>

          {gamification.badges.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {gamification.badges.slice(0, 4).map((badgeId) => {
                const badge = Object.values(BADGES).find((b) => b.id === badgeId)
                if (!badge) return null
                return (
                  <span key={badgeId} title={badge.label} className="text-lg cursor-default" role="img" aria-label={badge.label}>
                    {badge.emoji}
                  </span>
                )
              })}
              {gamification.badges.length > 4 && (
                <span className="text-[11px] text-slate-400">+{gamification.badges.length - 4}</span>
              )}
            </div>
          )}

          {!gamification.todayActive && (
            <div className="text-[11px] text-slate-400 shrink-0">
              <span className="text-amber-600 font-medium">Study today</span> to keep your streak!
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-900">Today&apos;s Focus</CardTitle>
                <Link href="/automation">
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500 gap-1">
                    View plan <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {todaysTasks.length === 0 && dueForReview.length === 0 ? (
                <div className="py-6 text-center">
                  <Clock className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No tasks due today</p>
                  <Link href="/automation" className="mt-2 inline-block text-xs text-slate-600 hover:underline">
                    Set up daily plan →
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {dueForReview.length > 0 && (
                    <div className="flex items-start gap-3 rounded-md p-2.5 hover:bg-slate-50 transition-colors">
                      <div className="mt-0.5 h-3 w-3 shrink-0 rounded-full border-2 border-slate-300" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-700">Review {dueForReview.length} flashcard{dueForReview.length !== 1 ? "s" : ""}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Spaced repetition due</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px] h-5 bg-slate-100 text-slate-500 hover:bg-slate-100 shrink-0">Study</Badge>
                    </div>
                  )}
                  {todaysTasks.slice(0, 4).map((task) => (
                    <div key={task.id} className="flex items-start gap-3 rounded-md p-2.5 hover:bg-slate-50 transition-colors">
                      <div className={`mt-0.5 h-3 w-3 shrink-0 rounded-full border-2 ${
                        task.status === "completed" ? "bg-slate-900 border-slate-900" : "border-slate-300"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium ${task.status === "completed" ? "line-through text-slate-400" : "text-slate-700"}`}>
                          {task.title}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{task.type ?? "Task"}</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px] h-5 bg-slate-100 text-slate-500 hover:bg-slate-100 shrink-0">
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-900">Upcoming Exams</CardTitle>
                <Link href="/exam">
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500 gap-1">
                    Exam OS <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {upcomingExams.length === 0 ? (
                <div className="py-6 text-center">
                  <ClipboardCheck className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No exams scheduled</p>
                  <Link href="/exam" className="mt-2 inline-block text-xs text-slate-600 hover:underline">
                    Add an exam →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingExams.map((exam) => (
                    <div key={exam.id} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-slate-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-900 truncate">{exam.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{exam.type} · {exam.questions?.length ?? 0} questions</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 shrink-0">{exam.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-900">Active Assignments</CardTitle>
                <Link href="/assignment">
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500 gap-1">
                    Assignment OS <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {activeAssignments.length === 0 ? (
                <div className="py-6 text-center">
                  <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No active assignments</p>
                  <Link href="/assignment" className="mt-2 inline-block text-xs text-slate-600 hover:underline">
                    Start an assignment →
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeAssignments.slice(0, 4).map((a) => (
                    <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-slate-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-900 truncate">{a.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {a.type.replace(/_/g, " ")}
                          {a.due_date ? ` · due ${new Date(a.due_date).toLocaleDateString()}` : ""}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 shrink-0">{a.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

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
