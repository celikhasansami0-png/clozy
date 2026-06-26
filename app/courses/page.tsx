"use client"

import { useState } from "react"
import {
  BookOpen, Plus, Trash2, Loader2, GraduationCap, Clock, CheckCircle, XCircle,
} from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCourses } from "@/hooks/use-courses"
import { toast } from "sonner"
import type { Course } from "@/types"

const COURSE_COLORS = [
  { label: "Slate", value: "#64748b" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Indigo", value: "#6366f1" },
  { label: "Purple", value: "#a855f7" },
  { label: "Rose", value: "#f43f5e" },
  { label: "Orange", value: "#f97316" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Emerald", value: "#10b981" },
  { label: "Teal", value: "#14b8a6" },
  { label: "Cyan", value: "#06b6d4" },
]

const STATUS_CONFIG: Record<Course["status"], { label: string; icon: typeof Clock; color: string }> = {
  active: { label: "Active", icon: Clock, color: "bg-blue-100 text-blue-700" },
  completed: { label: "Completed", icon: CheckCircle, color: "bg-emerald-100 text-emerald-700" },
  dropped: { label: "Dropped", icon: XCircle, color: "bg-slate-100 text-slate-500" },
}

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState("active")
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({
    title: "", code: "", professor: "", semester: "", credit_hours: 3, color: "#3b82f6", status: "active" as Course["status"],
  })

  const { courses, activeCourses, completedCourses, loading, createCourse, updateCourse, deleteCourse } = useCourses()

  const handleCreate = async () => {
    if (!form.title) return
    try {
      await createCourse({
        title: form.title,
        code: form.code || null,
        professor: form.professor || null,
        semester: form.semester || null,
        credit_hours: form.credit_hours,
        color: form.color,
        status: form.status,
      })
      toast.success("Course added!")
      setForm({ title: "", code: "", professor: "", semester: "", credit_hours: 3, color: "#3b82f6", status: "active" })
      setAddOpen(false)
    } catch {
      toast.error("Failed to add course")
    }
  }

  const totalCredits = activeCourses.reduce((s, c) => s + (c.credit_hours ?? 0), 0)
  const droppedCourses = courses.filter((c) => c.status === "dropped")

  const displayCourses = activeTab === "active" ? activeCourses
    : activeTab === "completed" ? completedCourses
    : droppedCourses

  return (
    <div>
      <PageHeader
        title="Courses"
        description="Manage your courses and track progress across all modules."
        actions={
          <Button onClick={() => setAddOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white gap-2">
            <Plus className="h-4 w-4" />
            Add course
          </Button>
        }
      />

      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <BookOpen className="h-4 w-4 text-slate-400 mb-2" />
            <div className="text-2xl font-bold text-slate-900 mb-0.5">{activeCourses.length}</div>
            <div className="text-xs text-slate-500">Active courses</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <GraduationCap className="h-4 w-4 text-slate-400 mb-2" />
            <div className="text-2xl font-bold text-slate-900 mb-0.5">{totalCredits}</div>
            <div className="text-xs text-slate-500">Credit hours</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <CheckCircle className="h-4 w-4 text-slate-400 mb-2" />
            <div className="text-2xl font-bold text-slate-900 mb-0.5">{completedCourses.length}</div>
            <div className="text-xs text-slate-500">Completed</div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-slate-100 p-1">
            <TabsTrigger value="active" className="text-sm">Active ({activeCourses.length})</TabsTrigger>
            <TabsTrigger value="completed" className="text-sm">Completed ({completedCourses.length})</TabsTrigger>
            <TabsTrigger value="dropped" className="text-sm">Dropped ({droppedCourses.length})</TabsTrigger>
          </TabsList>

          {(["active", "completed", "dropped"] as const).map((tab) => (
            <TabsContent key={tab} value={tab}>
              {loading ? (
                <div className="py-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
              ) : displayCourses.length === 0 ? (
                <div className="py-16 text-center">
                  <BookOpen className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">No {tab} courses</h3>
                  <p className="text-xs text-slate-400 mb-5 max-w-xs mx-auto">
                    {tab === "active" ? "Add your current semester courses to connect them with Learn OS, Exam OS, and Assignment OS." : `No ${tab} courses yet.`}
                  </p>
                  {tab === "active" && (
                    <Button onClick={() => setAddOpen(true)} variant="outline" className="border-slate-200 gap-2">
                      <Plus className="h-4 w-4" /> Add first course
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayCourses.map((course) => {
                    const cfg = STATUS_CONFIG[course.status]
                    return (
                      <Card key={course.id} className="border-slate-200 overflow-hidden group">
                        <div className="h-1.5" style={{ backgroundColor: course.color }} />
                        <CardContent className="pt-4 pb-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">{course.title}</p>
                              {course.code && <p className="text-xs text-slate-400 mt-0.5">{course.code}</p>}
                            </div>
                            <Badge className={`text-[10px] shrink-0 ml-2 ${cfg.color}`}>{cfg.label}</Badge>
                          </div>
                          <div className="space-y-1 mb-4">
                            {course.professor && (
                              <p className="text-xs text-slate-500">Prof. {course.professor}</p>
                            )}
                            {course.semester && (
                              <p className="text-xs text-slate-500">{course.semester}</p>
                            )}
                            {course.credit_hours && (
                              <p className="text-xs text-slate-500">{course.credit_hours} credit hours</p>
                            )}
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {course.status === "active" && (
                              <Button size="sm" variant="outline" className="h-7 text-xs flex-1 border-slate-200"
                                onClick={() => updateCourse(course.id, { status: "completed" }).then(() => toast.success("Marked completed"))}>
                                Complete
                              </Button>
                            )}
                            {course.status !== "dropped" && (
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                                onClick={() => deleteCourse(course.id).then(() => toast.success("Removed"))}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Course</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Course name</Label>
              <Input placeholder="e.g. Thermodynamics I" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Course code</Label>
                <Input placeholder="ME 301" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Credit hours</Label>
                <Input type="number" min={1} max={6} value={form.credit_hours}
                  onChange={(e) => setForm((f) => ({ ...f, credit_hours: parseInt(e.target.value) || 3 }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Professor (optional)</Label>
              <Input placeholder="Prof. Smith" value={form.professor} onChange={(e) => setForm((f) => ({ ...f, professor: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Semester</Label>
                <Input placeholder="Fall 2025" value={form.semester} onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as Course["status"] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="dropped">Dropped</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {COURSE_COLORS.map((c) => (
                  <button key={c.value} title={c.label}
                    onClick={() => setForm((f) => ({ ...f, color: c.value }))}
                    className={`h-7 w-7 rounded-full transition-all ${form.color === c.value ? "ring-2 ring-offset-2 ring-slate-900 scale-110" : "hover:scale-105"}`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} className="bg-slate-900 hover:bg-slate-800 text-white" disabled={!form.title}>Add Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
