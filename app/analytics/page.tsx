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
} from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AnalyticsOSPage() {
  return (
    <div>
      <PageHeader
        title="Analytics OS"
        description="Complete visibility into your academic performance across every dimension."
      />

      <div className="p-6 space-y-6">
        {/* Top metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {TOP_METRICS.map((m) => {
            const Icon = m.icon
            return (
              <div key={m.label} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                    <Icon className="h-4.5 w-4.5 text-slate-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-0.5">{m.value}</div>
                <div className="text-xs text-slate-500">{m.label}</div>
              </div>
            )
          })}
        </div>

        {/* Dashboard sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {DASHBOARD_SECTIONS.map((section) => {
            const Icon = section.icon
            return (
              <Card key={section.title} className="border-slate-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-slate-400" />
                    <CardTitle className="text-sm font-semibold text-slate-900">
                      {section.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="py-10 text-center">
                    <Icon className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">{section.empty}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Semester overview */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-slate-400" />
              <CardTitle className="text-sm font-semibold text-slate-900">
                Semester Dashboard
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {SEMESTER_METRICS.map((m) => (
                <div key={m.label} className="rounded-lg bg-slate-50 border border-slate-100 p-4">
                  <div className="text-xl font-bold text-slate-900 mb-0.5">{m.value}</div>
                  <div className="text-[11px] text-slate-500">{m.label}</div>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-8 text-center">
              <BarChart2 className="h-8 w-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">
                Add courses and start studying to see your semester analytics
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const TOP_METRICS = [
  { label: "Current GPA", value: "—", icon: Award },
  { label: "Study hours / week", value: "—", icon: Clock },
  { label: "Exam avg. score", value: "—", icon: Target },
  { label: "Assignments done", value: "—", icon: CheckSquare },
]

const DASHBOARD_SECTIONS = [
  {
    title: "Learning Dashboard",
    icon: BookOpen,
    empty: "Upload materials to see learning analytics",
  },
  {
    title: "Exam Dashboard",
    icon: Target,
    empty: "Take mock exams to see performance data",
  },
  {
    title: "Assignment Dashboard",
    icon: CheckSquare,
    empty: "Submit assignments to see completion rates",
  },
  {
    title: "Productivity Dashboard",
    icon: TrendingUp,
    empty: "Track study sessions to see productivity trends",
  },
]

const SEMESTER_METRICS = [
  { label: "Courses active", value: "0" },
  { label: "Credits enrolled", value: "0" },
  { label: "Exams remaining", value: "0" },
  { label: "Graduation progress", value: "—" },
]
