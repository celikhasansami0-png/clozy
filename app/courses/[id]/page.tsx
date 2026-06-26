"use client"

import { use, useState } from "react"
import Link from "next/link"
import {
  Brain, ClipboardCheck, FileText, BookOpen, ArrowLeft,
  Loader2, Plus, GraduationCap, Calculator,
} from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCourses } from "@/hooks/use-courses"
import { useMaterials } from "@/hooks/use-materials"
import { useFlashcards } from "@/hooks/use-flashcards"
import { useAssignments } from "@/hooks/use-assignments"
import { useExams } from "@/hooks/use-exams"

const LETTER_GRADES = [
  { letter: "A+", gpa: 4.0 }, { letter: "A", gpa: 4.0 }, { letter: "A-", gpa: 3.7 },
  { letter: "B+", gpa: 3.3 }, { letter: "B", gpa: 3.0 }, { letter: "B-", gpa: 2.7 },
  { letter: "C+", gpa: 2.3 }, { letter: "C", gpa: 2.0 }, { letter: "C-", gpa: 1.7 },
  { letter: "D+", gpa: 1.3 }, { letter: "D", gpa: 1.0 }, { letter: "F", gpa: 0.0 },
]

export default function CourseDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [activeTab, setActiveTab] = useState("overview")
  const [gpaGrades, setGpaGrades] = useState<{ letter: string; credits: number }[]>([
    { letter: "A", credits: 3 },
  ])

  const { courses, loading: coursesLoading } = useCourses()
  const { materials, loading: materialsLoading } = useMaterials(id)
  const { flashcards, loading: flashcardsLoading } = useFlashcards(id)
  const { assignments, active: activeAssignments, loading: assignmentsLoading } = useAssignments(id)
  const { exams, loading: examsLoading } = useExams(id)

  const course = courses.find((c) => c.id === id)

  const isLoading = coursesLoading || materialsLoading || flashcardsLoading || assignmentsLoading || examsLoading

  const completedAssignments = assignments.filter((a) => a.status === "submitted")
  const dueForReview = flashcards.filter((f) => {
    if (!f.next_review_at) return true
    return new Date(f.next_review_at) <= new Date()
  })

  const computeGPA = () => {
    const total = gpaGrades.reduce((sum, g) => sum + g.credits, 0)
    if (total === 0) return 0
    const weighted = gpaGrades.reduce((sum, g) => {
      const entry = LETTER_GRADES.find((lg) => lg.letter === g.letter)
      return sum + (entry?.gpa ?? 0) * g.credits
    }, 0)
    return (weighted / total).toFixed(2)
  }

  if (!isLoading && !course) {
    return (
      <div className="p-6">
        <Link href="/courses">
          <Button variant="ghost" size="sm" className="gap-2 mb-4 text-slate-500">
            <ArrowLeft className="h-4 w-4" /> Back to courses
          </Button>
        </Link>
        <p className="text-sm text-slate-500">Course not found.</p>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={course ? course.title : "Loading…"}
        description={[course?.code, course?.professor ? `Prof. ${course.professor}` : null, course?.semester].filter(Boolean).join(" · ")}
        actions={
          <Link href="/courses">
            <Button variant="outline" size="sm" className="border-slate-200 gap-2">
              <ArrowLeft className="h-4 w-4" /> All courses
            </Button>
          </Link>
        }
      />

      {isLoading ? (
        <div className="p-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
      ) : (
        <div className="p-6 space-y-6">
          {/* Summary metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Materials", value: materials.length, icon: Brain, href: `/learn?course=${id}` },
              { label: "Flashcards", value: flashcards.length, icon: BookOpen, href: `/learn?course=${id}` },
              { label: "Assignments", value: assignments.length, icon: FileText, href: `/assignment` },
              { label: "Exams", value: exams.length, icon: ClipboardCheck, href: `/exam` },
            ].map((m) => {
              const Icon = m.icon
              return (
                <Link key={m.label} href={m.href}>
                  <div className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 mb-3">
                      <Icon className="h-4 w-4 text-slate-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 mb-0.5">{m.value}</div>
                    <div className="text-xs text-slate-500">{m.label}</div>
                  </div>
                </Link>
              )
            })}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-100 p-1 mb-6">
              <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
              <TabsTrigger value="materials" className="text-sm">Materials</TabsTrigger>
              <TabsTrigger value="assignments" className="text-sm">Assignments</TabsTrigger>
              <TabsTrigger value="exams" className="text-sm">Exams</TabsTrigger>
              <TabsTrigger value="gpa" className="text-sm">GPA Calculator</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-900">Flashcard progress</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {flashcards.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3">No flashcards yet for this course.</p>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>Due for review</span>
                          <span className="font-semibold text-slate-900">{dueForReview.length} / {flashcards.length}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className="bg-slate-900 h-2 rounded-full transition-all"
                            style={{ width: `${Math.round(((flashcards.length - dueForReview.length) / flashcards.length) * 100)}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-400">{flashcards.length - dueForReview.length} cards up to date</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-900">Assignments</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {assignments.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3">No assignments for this course.</p>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>Submitted</span>
                          <span className="font-semibold text-slate-900">{completedAssignments.length} / {assignments.length}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className="bg-emerald-500 h-2 rounded-full transition-all"
                            style={{ width: `${assignments.length > 0 ? Math.round((completedAssignments.length / assignments.length) * 100) : 0}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-400">{activeAssignments.length} active</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-900">Exams</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {exams.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3">No exams for this course.</p>
                    ) : (
                      <ul className="space-y-2">
                        {exams.slice(0, 3).map((e) => (
                          <li key={e.id} className="flex items-center justify-between text-xs">
                            <span className="text-slate-700 truncate">{e.title}</span>
                            <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-500 shrink-0 ml-2">{e.status}</Badge>
                          </li>
                        ))}
                        {exams.length > 3 && <li className="text-[11px] text-slate-400">+{exams.length - 3} more</li>}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="materials">
              <Card className="border-slate-200">
                <CardContent className="pt-6">
                  {materials.length === 0 ? (
                    <div className="py-12 text-center">
                      <Brain className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm text-slate-500 mb-3">No materials linked to this course.</p>
                      <Link href="/learn">
                        <Button variant="outline" size="sm" className="border-slate-200 gap-2">
                          <Plus className="h-4 w-4" /> Add material
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {materials.map((m) => (
                        <li key={m.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{m.title}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{m.type?.replace(/_/g, " ")}</p>
                          </div>
                          <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-500 shrink-0">{m.processed ? "processed" : "pending"}</Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assignments">
              <Card className="border-slate-200">
                <CardContent className="pt-6">
                  {assignments.length === 0 ? (
                    <div className="py-12 text-center">
                      <FileText className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm text-slate-500 mb-3">No assignments for this course.</p>
                      <Link href="/assignment">
                        <Button variant="outline" size="sm" className="border-slate-200 gap-2">
                          <Plus className="h-4 w-4" /> Create assignment
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {assignments.map((a) => (
                        <li key={a.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{a.title}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {a.type.replace(/_/g, " ")}
                              {a.due_date ? ` · due ${new Date(a.due_date).toLocaleDateString()}` : ""}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 shrink-0">{a.status}</Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="exams">
              <Card className="border-slate-200">
                <CardContent className="pt-6">
                  {exams.length === 0 ? (
                    <div className="py-12 text-center">
                      <ClipboardCheck className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm text-slate-500 mb-3">No exams for this course.</p>
                      <Link href="/exam">
                        <Button variant="outline" size="sm" className="border-slate-200 gap-2">
                          <Plus className="h-4 w-4" /> Create exam
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {exams.map((e) => (
                        <li key={e.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{e.title}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{e.type} · {e.questions?.length ?? 0} questions</p>
                          </div>
                          <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 shrink-0">{e.status}</Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gpa">
              <div className="max-w-lg">
                <Card className="border-slate-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-slate-600" />
                      <CardTitle className="text-sm font-semibold text-slate-900">GPA Calculator</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    <div className="space-y-2">
                      {gpaGrades.map((g, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <select
                            value={g.letter}
                            onChange={(e) => setGpaGrades((prev) => prev.map((x, j) => j === i ? { ...x, letter: e.target.value } : x))}
                            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                          >
                            {LETTER_GRADES.map((lg) => (
                              <option key={lg.letter} value={lg.letter}>{lg.letter} ({lg.gpa.toFixed(1)})</option>
                            ))}
                          </select>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={1}
                              max={6}
                              value={g.credits}
                              onChange={(e) => setGpaGrades((prev) => prev.map((x, j) => j === i ? { ...x, credits: parseInt(e.target.value) || 1 } : x))}
                              className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 text-center"
                            />
                            <span className="text-xs text-slate-400">cr</span>
                          </div>
                          <button
                            onClick={() => setGpaGrades((prev) => prev.filter((_, j) => j !== i))}
                            disabled={gpaGrades.length === 1}
                            className="text-slate-300 hover:text-red-400 disabled:opacity-30 transition-colors text-lg leading-none"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-200 gap-2 w-full"
                      onClick={() => setGpaGrades((prev) => [...prev, { letter: "A", credits: 3 }])}
                    >
                      <Plus className="h-3.5 w-3.5" /> Add course
                    </Button>

                    <div className="rounded-xl bg-slate-900 text-white p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <GraduationCap className="h-4 w-4" />
                        <span className="text-xs font-medium text-slate-300">Cumulative GPA</span>
                      </div>
                      <div className="text-4xl font-bold">{computeGPA()}</div>
                      <div className="text-xs text-slate-400 mt-1">
                        {gpaGrades.reduce((s, g) => s + g.credits, 0)} total credit hours
                      </div>
                    </div>

                    <div className="rounded-lg border border-slate-100 p-3">
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Grade scale</p>
                      <div className="grid grid-cols-4 gap-1">
                        {LETTER_GRADES.map((lg) => (
                          <div key={lg.letter} className="text-center">
                            <p className="text-xs font-medium text-slate-700">{lg.letter}</p>
                            <p className="text-[10px] text-slate-400">{lg.gpa.toFixed(1)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
