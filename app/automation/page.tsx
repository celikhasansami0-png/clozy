"use client"

import {
  Zap,
  Calendar,
  Bell,
  RotateCcw,
  ClipboardCheck,
  FolderOpen,
  StickyNote,
  CheckSquare,
  Clock,
  Settings,
} from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const AUTOMATION_RULES = [
  {
    id: "auto_schedule",
    label: "Auto Scheduling",
    description: "Automatically schedule study sessions based on exam dates and workload",
    icon: Calendar,
    status: "available",
  },
  {
    id: "auto_priority",
    label: "Auto Prioritization",
    description: "Reprioritize tasks dynamically as deadlines approach",
    icon: CheckSquare,
    status: "available",
  },
  {
    id: "auto_reminders",
    label: "Smart Reminders",
    description: "Context-aware reminders for exams, assignments, and review sessions",
    icon: Bell,
    status: "available",
  },
  {
    id: "auto_revision",
    label: "Auto Revision Planning",
    description: "Generate optimal revision schedules using spaced repetition data",
    icon: RotateCcw,
    status: "available",
  },
  {
    id: "auto_exam_prep",
    label: "Auto Exam Preparation",
    description: "Automatically create exam prep plans 2 weeks before each exam",
    icon: ClipboardCheck,
    status: "available",
  },
  {
    id: "auto_project",
    label: "Auto Project Planning",
    description: "Generate project plans and milestone schedules automatically",
    icon: FolderOpen,
    status: "available",
  },
  {
    id: "auto_notes",
    label: "Auto Note Organization",
    description: "Organize notes by topic, course, and concept automatically",
    icon: StickyNote,
    status: "available",
  },
]

export default function AutomationOSPage() {
  return (
    <div>
      <PageHeader
        title="Automation OS"
        description="Reduce manual academic work with intelligent automation rules."
        actions={
          <Button className="bg-slate-900 hover:bg-slate-800 text-white gap-2">
            <Settings className="h-4 w-4" />
            Configure automations
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Today's automated plan */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <CardTitle className="text-sm font-semibold text-slate-900">
                Today&apos;s Auto-Generated Plan
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="py-10 text-center">
              <Zap className="h-10 w-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600 mb-1">No automated plan yet</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mb-5">
                Enable automations below and add your courses and exams.
                The system will generate your daily academic plan automatically.
              </p>
              <Button variant="outline" size="sm" className="border-slate-200 gap-2">
                <Calendar className="h-3.5 w-3.5" />
                Add courses to get started
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Automation rules */}
        <div>
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Available Automations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AUTOMATION_RULES.map((rule) => {
              const Icon = rule.icon
              return (
                <div
                  key={rule.id}
                  className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 transition-all"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 shrink-0">
                    <Icon className="h-5 w-5 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-slate-900">{rule.label}</p>
                      <button className="relative h-5 w-9 rounded-full bg-slate-200 transition-colors hover:bg-slate-300 shrink-0 ml-3">
                        <span className="absolute left-1 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{rule.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Automation stats */}
        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="pt-5">
            <div className="grid grid-cols-3 gap-4">
              {AUTOMATION_STATS.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl font-bold text-slate-900 mb-0.5">{s.value}</div>
                  <div className="text-xs text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const AUTOMATION_STATS = [
  { label: "Hours saved this week", value: "0" },
  { label: "Tasks auto-scheduled", value: "0" },
  { label: "Reminders sent", value: "0" },
]
