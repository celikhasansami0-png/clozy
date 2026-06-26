"use client"

import { useState } from "react"
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
  Loader2,
  CheckCircle2,
} from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useTasks } from "@/hooks/use-tasks"

type RuleId = "auto_schedule" | "auto_priority" | "auto_reminders" | "auto_revision" | "auto_exam_prep" | "auto_project" | "auto_notes"

const AUTOMATION_RULES: {
  id: RuleId
  label: string
  description: string
  icon: typeof Calendar
  runnable: boolean
}[] = [
  {
    id: "auto_schedule",
    label: "Auto Scheduling",
    description: "Automatically schedule study sessions based on exam dates and workload",
    icon: Calendar,
    runnable: true,
  },
  {
    id: "auto_priority",
    label: "Auto Prioritization",
    description: "Reprioritize tasks dynamically as deadlines approach",
    icon: CheckSquare,
    runnable: true,
  },
  {
    id: "auto_reminders",
    label: "Smart Reminders",
    description: "Context-aware reminders for exams, assignments, and review sessions",
    icon: Bell,
    runnable: false,
  },
  {
    id: "auto_revision",
    label: "Auto Revision Planning",
    description: "Generate optimal revision schedules using spaced repetition data",
    icon: RotateCcw,
    runnable: false,
  },
  {
    id: "auto_exam_prep",
    label: "Auto Exam Preparation",
    description: "Automatically create exam prep tasks 2 weeks before each exam",
    icon: ClipboardCheck,
    runnable: true,
  },
  {
    id: "auto_project",
    label: "Auto Project Planning",
    description: "Generate project plans and milestone schedules automatically",
    icon: FolderOpen,
    runnable: false,
  },
  {
    id: "auto_notes",
    label: "Auto Note Organization",
    description: "Organize notes by topic, course, and concept automatically",
    icon: StickyNote,
    runnable: false,
  },
]

export default function AutomationOSPage() {
  const [enabled, setEnabled] = useState<Set<RuleId>>(new Set())
  const [running, setRunning] = useState<RuleId | null>(null)
  const [results, setResults] = useState<Record<RuleId, number>>({} as Record<RuleId, number>)

  const { tasks, loading: tasksLoading, completeTask, refetch } = useTasks()

  const automatedTasks = tasks.filter((t) => t.description?.includes("Automation OS") || t.description?.includes("automation"))

  const toggleRule = (id: RuleId) => {
    setEnabled((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const runRule = async (id: RuleId) => {
    setRunning(id)
    try {
      const res = await fetch("/api/automation/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rule: id }),
      })
      const data = await res.json()
      const count = data.tasks_created ?? data.tasks_updated ?? 0
      setResults((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + count }))
      if (count > 0) {
        toast.success(`${data.message} — ${count} task${count !== 1 ? "s" : ""} ${data.tasks_created != null ? "created" : "updated"}`)
        refetch()
      } else {
        toast.success(data.message ?? "Done — no new tasks needed")
      }
    } catch {
      toast.error("Automation failed")
    } finally {
      setRunning(null)
    }
  }

  const totalTasksCreated = Object.values(results).reduce((a, b) => a + b, 0)

  return (
    <div>
      <PageHeader
        title="Automation OS"
        description="Reduce manual academic work with intelligent automation rules."
      />

      <div className="p-6 space-y-6">
        {/* Today's auto-generated plan */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <CardTitle className="text-sm font-semibold text-slate-900">
                Auto-Generated Tasks
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <div className="py-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-300" /></div>
            ) : automatedTasks.length === 0 ? (
              <div className="py-10 text-center">
                <Zap className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-600 mb-1">No automated tasks yet</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mb-5">
                  Enable automations below and run them. The system will generate study tasks based on your exams and assignments.
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {automatedTasks.slice(0, 8).map((task) => (
                  <li key={task.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 group">
                    <CheckCircle2
                      className={`h-4 w-4 shrink-0 cursor-pointer transition-colors ${task.status === "completed" ? "text-emerald-500" : "text-slate-200 hover:text-emerald-400"}`}
                      onClick={async () => {
                        if (task.status !== "completed") {
                          await completeTask(task.id)
                          toast.success("Task completed!")
                        }
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${task.status === "completed" ? "line-through text-slate-400" : "text-slate-900"}`}>
                        {task.title}
                      </p>
                      {task.due_date && (
                        <p className="text-[11px] text-slate-400">Due: {new Date(task.due_date + "T00:00:00").toLocaleDateString()}</p>
                      )}
                    </div>
                    <Badge variant="secondary" className={`text-[10px] shrink-0 ${
                      task.priority === "high" ? "bg-red-100 text-red-700" :
                      task.priority === "medium" ? "bg-amber-100 text-amber-700" :
                      "bg-slate-100 text-slate-600"
                    }`}>
                      {task.priority}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Automation rules */}
        <div>
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Available Automations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AUTOMATION_RULES.map((rule) => {
              const Icon = rule.icon
              const isEnabled = enabled.has(rule.id)
              const isRunning = running === rule.id
              const tasksFromRule = results[rule.id] ?? 0

              return (
                <div
                  key={rule.id}
                  className={`flex items-start gap-4 rounded-xl border bg-white p-5 transition-all ${isEnabled ? "border-slate-900 shadow-sm" : "border-slate-200 hover:border-slate-300"}`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${isEnabled ? "bg-slate-900" : "bg-slate-100"}`}>
                    <Icon className={`h-5 w-5 ${isEnabled ? "text-white" : "text-slate-600"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-slate-900">{rule.label}</p>
                      <button
                        onClick={() => toggleRule(rule.id)}
                        className={`relative h-5 w-9 rounded-full transition-colors shrink-0 ml-3 ${isEnabled ? "bg-slate-900" : "bg-slate-200 hover:bg-slate-300"}`}
                      >
                        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${isEnabled ? "translate-x-4" : "translate-x-1"}`} />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed mb-3">{rule.description}</p>
                    {rule.runnable && isEnabled && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-slate-200 gap-1.5"
                          disabled={isRunning}
                          onClick={() => runRule(rule.id)}
                        >
                          {isRunning ? <><Loader2 className="h-3 w-3 animate-spin" /> Running...</> : <><Zap className="h-3 w-3" /> Run now</>}
                        </Button>
                        {tasksFromRule > 0 && (
                          <span className="text-[11px] text-emerald-600 font-medium">+{tasksFromRule} tasks created</span>
                        )}
                      </div>
                    )}
                    {!rule.runnable && isEnabled && (
                      <span className="text-[11px] text-slate-400">Runs automatically in the background</span>
                    )}
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
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 mb-0.5">{enabled.size}</div>
                <div className="text-xs text-slate-500">Active rules</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 mb-0.5">{totalTasksCreated}</div>
                <div className="text-xs text-slate-500">Tasks auto-created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 mb-0.5">{automatedTasks.filter((t) => t.status === "completed").length}</div>
                <div className="text-xs text-slate-500">Tasks completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
