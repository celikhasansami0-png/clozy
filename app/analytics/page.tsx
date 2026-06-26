"use client"

import {
  BarChart2,
  TrendingUp,
  Target,
  BookOpen,
  Clock,
  CheckSquare,
  Award,
  GraduationCap,
  Loader2,
  RotateCcw,
  FileText,
} from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAnalytics } from "@/hooks/use-analytics"
import { Button } from "@/components/ui/button"

export default function AnalyticsOSPage() {
  const { overview, loading, refetch } = useAnalytics()

  const topMetrics = [
    { label: "Current GPA", value: overview?.gpa != null ? overview.gpa.toFixed(2) : "—", icon: Award },
    { label: "Study hours / week", value: overview ? String(overview.study_hours_this_week) : "—", icon: Clock },
    { label: "Exam avg. score", value: overview?.exams_average_score ? `${overview.exams_average_score}%` : "—", icon: Target },
    { label: "Assignments done", value: overview ? String(overview.assignments_submitted) : "—", icon: CheckSquare },
  ]

  const semesterMetrics = [
    { label: "Courses active", value: overview ? String(overview.courses_active) : "0" },
    { label: "Courses completed", value: overview ? String(overview.courses_completed) : "0" },
    { label: "Exams taken", value: overview ? String(overview.exams_taken) : "0" },
    { label: "Assignments pending", value: overview ? String(overview.assignments_pending) : "0" },
  ]

  return (
    <div>
      <PageHeader
        title="Analytics OS"
        description="Complete visibility into your academic performance across every dimension."
        actions={
          <Button variant="outline" className="border-slate-200 gap-2" onClick={refetch}>
            <RotateCcw className="h-4 w-4" />
            Refresh
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Top metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {topMetrics.map((m) => {
            const Icon = m.icon
            return (
              <div key={m.label} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                    <Icon className="h-4 w-4 text-slate-600" />
                  </div>
                  {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-300" />}
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-0.5">{m.value}</div>
                <div className="text-xs text-slate-500">{m.label}</div>
              </div>
            )
          })}
        </div>

        {/* Dashboard sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Learning */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-slate-400" />
                <CardTitle className="text-sm font-semibold text-slate-900">Learning Dashboard</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-300" /></div>
              ) : overview ? (
                <div className="space-y-3">
                  <MetricRow label="Flashcards reviewed today" value={overview.flashcards_reviewed_today} />
                  <MetricRow label="Study hours this week" value={`${overview.study_hours_this_week}h`} />
                  <MetricRow label="Active courses" value={overview.courses_active} />
                  <div className="pt-2 text-[11px] text-slate-400">
                    Add learning sessions via Learn OS timer to track study time.
                  </div>
                </div>
              ) : (
                <EmptyState icon={BookOpen} message="Upload materials to see learning analytics" />
              )}
            </CardContent>
          </Card>

          {/* Exams */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-slate-400" />
                <CardTitle className="text-sm font-semibold text-slate-900">Exam Dashboard</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-300" /></div>
              ) : overview ? (
                <div className="space-y-3">
                  <MetricRow label="Exams taken" value={overview.exams_taken} />
                  <MetricRow
                    label="Average score"
                    value={overview.exams_taken > 0 ? `${overview.exams_average_score}%` : "—"}
                  />
                  <MetricRow
                    label="Exam readiness"
                    value={overview.exam_readiness_score > 0 ? `${overview.exam_readiness_score}%` : "—"}
                  />
                  <div className="pt-2 text-[11px] text-slate-400">
                    Take mock exams in Exam OS to build your performance history.
                  </div>
                </div>
              ) : (
                <EmptyState icon={Target} message="Take mock exams to see performance data" />
              )}
            </CardContent>
          </Card>

          {/* Assignments */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-slate-400" />
                <CardTitle className="text-sm font-semibold text-slate-900">Assignment Dashboard</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-300" /></div>
              ) : overview ? (
                <div className="space-y-3">
                  <MetricRow label="Submitted" value={overview.assignments_submitted} highlight="emerald" />
                  <MetricRow label="Pending" value={overview.assignments_pending} highlight={overview.assignments_pending > 3 ? "red" : "default"} />
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                    {overview.assignments_submitted + overview.assignments_pending > 0 && (
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.round(overview.assignments_submitted / (overview.assignments_submitted + overview.assignments_pending) * 100)}%` }}
                      />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {overview.assignments_submitted + overview.assignments_pending > 0
                      ? `${Math.round(overview.assignments_submitted / (overview.assignments_submitted + overview.assignments_pending) * 100)}% completion rate`
                      : "No assignments yet"}
                  </div>
                </div>
              ) : (
                <EmptyState icon={CheckSquare} message="Submit assignments to see completion rates" />
              )}
            </CardContent>
          </Card>

          {/* Productivity */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-slate-400" />
                <CardTitle className="text-sm font-semibold text-slate-900">Productivity Dashboard</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-300" /></div>
              ) : overview ? (
                <div className="space-y-3">
                  <MetricRow label="Study hours this week" value={`${overview.study_hours_this_week}h`} />
                  <MetricRow label="Courses active" value={overview.courses_active} />
                  <MetricRow label="Courses completed" value={overview.courses_completed} highlight="emerald" />
                  <div className="pt-2 text-[11px] text-slate-400">
                    Use the study timer in Learn OS to track your sessions automatically.
                  </div>
                </div>
              ) : (
                <EmptyState icon={TrendingUp} message="Track study sessions to see productivity trends" />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Semester overview */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-slate-400" />
              <CardTitle className="text-sm font-semibold text-slate-900">Semester Dashboard</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {semesterMetrics.map((m) => (
                <div key={m.label} className="rounded-lg bg-slate-50 border border-slate-100 p-4">
                  {loading ? (
                    <div className="h-7 w-8 bg-slate-200 rounded animate-pulse mb-0.5" />
                  ) : (
                    <div className="text-xl font-bold text-slate-900 mb-0.5">{m.value}</div>
                  )}
                  <div className="text-[11px] text-slate-500">{m.label}</div>
                </div>
              ))}
            </div>
            {!loading && overview && (overview.courses_active > 0 || overview.exams_taken > 0) ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InsightCard
                  icon={FileText}
                  title="Learning progress"
                  value={`${overview.flashcards_reviewed_today} cards`}
                  subtitle="reviewed today"
                />
                <InsightCard
                  icon={Target}
                  title="Exam performance"
                  value={overview.exams_taken > 0 ? `${overview.exams_average_score}%` : "No exams yet"}
                  subtitle="average score"
                />
                <InsightCard
                  icon={Clock}
                  title="Study time"
                  value={`${overview.study_hours_this_week}h`}
                  subtitle="this week"
                />
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-8 text-center">
                <BarChart2 className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">
                  Add courses and start studying to see your semester analytics
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MetricRow({
  label,
  value,
  highlight,
}: {
  label: string
  value: string | number
  highlight?: "emerald" | "red" | "default"
}) {
  const colorClass =
    highlight === "emerald" ? "text-emerald-600" :
    highlight === "red" ? "text-red-600" :
    "text-slate-900"

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`text-sm font-semibold ${colorClass}`}>{value}</span>
    </div>
  )
}

function EmptyState({ icon: Icon, message }: { icon: typeof BookOpen; message: string }) {
  return (
    <div className="py-10 text-center">
      <Icon className="h-8 w-8 text-slate-200 mx-auto mb-3" />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  )
}

function InsightCard({ icon: Icon, title, value, subtitle }: { icon: typeof FileText; title: string; value: string; subtitle: string }) {
  return (
    <div className="rounded-lg bg-slate-50 border border-slate-100 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">{title}</span>
      </div>
      <div className="text-xl font-bold text-slate-900">{value}</div>
      <div className="text-[11px] text-slate-400 mt-0.5">{subtitle}</div>
    </div>
  )
}
