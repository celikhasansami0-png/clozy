"use client"

import { useState } from "react"
import {
  Plus,
  Check,
  Circle,
  Zap,
  Link as LinkIcon,
  FileText,
  Mail,
  Phone,
  PhoneCall,
  Send,
  CheckSquare,
  UserPlus,
  MessageSquare,
  Trash2,
  Calendar,
} from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTasks } from "@/hooks/use-tasks"
import type { Task, TaskStatus, TaskType } from "@/types"
import { cn, relativeTime } from "@/lib/utils"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TASK_TYPES } from "@/lib/constants"

const TASK_ICONS: Record<TaskType, React.ElementType> = {
  send_connection_request: UserPlus,
  send_follow_up: MessageSquare,
  post_content: FileText,
  review_replies: Mail,
  book_call: Phone,
  send_proposal: Send,
  follow_up_call: PhoneCall,
  custom: CheckSquare,
}

const PRIORITY_COLORS: Record<Task["priority"], string> = {
  low: "text-slate-400",
  medium: "text-amber-500",
  high: "text-red-500",
}

function TaskItem({
  task,
  onComplete,
  onDelete,
}: {
  task: Task
  onComplete: (id: string) => void
  onDelete: (id: string) => void
}) {
  const Icon = TASK_ICONS[task.type] ?? CheckSquare
  const isCompleted = task.status === "completed"

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3.5 transition-all",
        isCompleted && "opacity-60"
      )}
    >
      {/* Checkbox */}
      <button
        onClick={() => !isCompleted && onComplete(task.id)}
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          isCompleted
            ? "border-emerald-500 bg-emerald-500"
            : "border-slate-300 hover:border-indigo-400"
        )}
      >
        {isCompleted && <Check className="h-3 w-3 text-white" />}
      </button>

      {/* Icon */}
      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
        <Icon className="h-4 w-4 text-slate-400" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium text-slate-900", isCompleted && "line-through text-slate-400")}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <Badge
            variant={
              task.priority === "high" ? "danger" : task.priority === "medium" ? "warning" : "secondary"
            }
            className="text-[10px] h-4 px-1.5"
          >
            {task.priority}
          </Badge>
          {task.day_number && (
            <span className="text-[10px] text-slate-400">Day {task.day_number}</span>
          )}
          {task.due_date && (
            <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
              <Calendar className="h-2.5 w-2.5" />
              {new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 rounded-md p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

function AddTaskDialog({ open, onClose, onSubmit }: {
  open: boolean
  onClose: () => void
  onSubmit: (task: Partial<Task>) => Promise<void>
}) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "custom" as TaskType,
    priority: "medium" as Task["priority"],
    due_date: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({
        title: form.title,
        description: form.description || null,
        type: form.type,
        status: "pending",
        priority: form.priority,
        due_date: form.due_date || null,
      })
      onClose()
      setForm({ title: "", description: "", type: "custom", priority: "medium", due_date: "" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Task Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Send 20 connection requests"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional details..."
              className="h-16"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as TaskType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TASK_TYPES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as Task["priority"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Due Date</Label>
            <Input
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
              Add Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function TasksPage() {
  const { tasks, loading, createTask, completeTask, deleteTask, completedCount, pendingCount } = useTasks()
  const [showAddForm, setShowAddForm] = useState(false)

  const completionRate = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0

  const todaysTasks = tasks.filter((t) => {
    if (!t.due_date) return false
    const today = new Date().toDateString()
    return new Date(t.due_date).toDateString() === today
  })

  const upcomingTasks = tasks.filter((t) => {
    if (!t.due_date || t.status === "completed") return false
    return new Date(t.due_date) > new Date()
  })

  const allPending = tasks.filter((t) => t.status === "pending")
  const allCompleted = tasks.filter((t) => t.status === "completed")

  const handleComplete = async (id: string) => {
    try {
      await completeTask(id)
      toast.success("Task completed!")
    } catch {
      toast.error("Failed to complete task")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id)
      toast.success("Task deleted")
    } catch {
      toast.error("Failed to delete task")
    }
  }

  const handleAdd = async (task: Partial<Task>) => {
    try {
      await createTask({
        title: task.title!,
        description: task.description ?? null,
        type: task.type!,
        status: "pending",
        priority: task.priority!,
        due_date: task.due_date ?? null,
        completed_at: null,
        day_number: null,
        toolkit_id: undefined,
        lead_id: undefined,
      })
      toast.success("Task added!")
    } catch {
      toast.error("Failed to add task")
    }
  }

  return (
    <div>
      <PageHeader
        title="Execution Plan"
        description="Your daily LinkedIn growth tasks and activities."
        actions={
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Progress */}
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Overall Progress</p>
              <p className="text-xs text-slate-400">{completedCount} of {tasks.length} tasks completed</p>
            </div>
            <span className="text-2xl font-bold text-slate-900">{completionRate.toFixed(0)}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
          <div className="flex gap-4 mt-3">
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900">{pendingCount}</p>
              <p className="text-[11px] text-slate-400">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-600">{completedCount}</p>
              <p className="text-[11px] text-slate-400">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-amber-600">{todaysTasks.length}</p>
              <p className="text-[11px] text-slate-400">Due Today</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
            <Zap className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500 mb-1">No tasks yet</p>
            <p className="text-xs text-slate-400 mb-4">
              Generate a growth system to auto-create your execution plan,
              <br />or add tasks manually.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                onClick={() => setShowAddForm(true)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" /> Add Task
              </Button>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="today">
            <TabsList>
              <TabsTrigger value="today">Today ({todaysTasks.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({allPending.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({allCompleted.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="space-y-2 mt-4">
              {todaysTasks.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">No tasks due today.</p>
              ) : (
                todaysTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onComplete={handleComplete}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-2 mt-4">
              {allPending.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">All tasks completed!</p>
              ) : (
                allPending.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onComplete={handleComplete}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-2 mt-4">
              {allCompleted.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">No completed tasks yet.</p>
              ) : (
                allCompleted.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onComplete={handleComplete}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <AddTaskDialog
        open={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={handleAdd}
      />
    </div>
  )
}
