"use client"

import { useState, useEffect } from "react"
import {
  FolderOpen, Plus, Calendar, Users, CheckSquare, AlertTriangle, Trash2, Loader2,
} from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProjects } from "@/hooks/use-projects"
import { useTasks } from "@/hooks/use-tasks"
import { toast } from "sonner"
import type { Project, Milestone } from "@/types"

const STATUS_COLORS: Record<Project["status"], string> = {
  planning: "bg-slate-100 text-slate-600",
  in_progress: "bg-blue-100 text-blue-700",
  review: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  paused: "bg-slate-100 text-slate-500",
}

export default function ProjectOSPage() {
  const [activeTab, setActiveTab] = useState("projects")
  const [addOpen, setAddOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [form, setForm] = useState({ title: "", description: "", status: "planning" as Project["status"], start_date: "", end_date: "" })

  const { projects, loading, createProject, updateProject, deleteProject, fetchMilestones } = useProjects()
  const { tasks } = useTasks()

  useEffect(() => {
    if (selectedProject) {
      fetchMilestones(selectedProject.id).then(setMilestones)
    }
  }, [selectedProject, fetchMilestones])

  const handleCreate = async () => {
    if (!form.title) return
    try {
      await createProject({
        title: form.title,
        description: form.description || null,
        status: form.status,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        team_members: [],
        tags: [],
        course_id: null,
      })
      setForm({ title: "", description: "", status: "planning", start_date: "", end_date: "" })
      setAddOpen(false)
      toast.success("Project created!")
    } catch {
      toast.error("Failed to create project")
    }
  }

  const overdueTasks = tasks.filter((t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "completed")

  return (
    <div>
      <PageHeader
        title="Project OS"
        description="Plan, execute, and track semester-long engineering projects with AI assistance."
        actions={
          <Button onClick={() => setAddOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white gap-2">
            <Plus className="h-4 w-4" />
            New project
          </Button>
        }
      />

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-slate-100 p-1">
            <TabsTrigger value="projects" className="text-sm">Projects ({projects.length})</TabsTrigger>
            <TabsTrigger value="tasks" className="text-sm">Tasks ({tasks.length})</TabsTrigger>
            <TabsTrigger value="milestones" className="text-sm">Milestones</TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <FolderOpen className="h-4 w-4 text-slate-400 mb-2" />
                    <div className="text-2xl font-bold text-slate-900 mb-0.5">{projects.filter((p) => p.status === "in_progress").length}</div>
                    <div className="text-xs text-slate-500">Active projects</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <Users className="h-4 w-4 text-slate-400 mb-2" />
                    <div className="text-2xl font-bold text-slate-900 mb-0.5">{projects.reduce((s, p) => s + p.team_members.length, 0)}</div>
                    <div className="text-xs text-slate-500">Team members</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <AlertTriangle className="h-4 w-4 text-slate-400 mb-2" />
                    <div className="text-2xl font-bold text-slate-900 mb-0.5">{overdueTasks.length}</div>
                    <div className="text-xs text-slate-500">Overdue tasks</div>
                  </div>
                </div>

                <Card className="border-slate-200">
                  <CardContent className="pt-6">
                    {loading ? (
                      <div className="py-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
                    ) : projects.length === 0 ? (
                      <div className="py-14 text-center">
                        <FolderOpen className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-sm font-semibold text-slate-700 mb-2">No projects yet</h3>
                        <p className="text-xs text-slate-400 mb-5 max-w-xs mx-auto">Create a project and the AI will generate a full plan with milestones, tasks, and timelines.</p>
                        <Button onClick={() => setAddOpen(true)} variant="outline" className="border-slate-200 gap-2">
                          <Plus className="h-4 w-4" /> Create your first project
                        </Button>
                      </div>
                    ) : (
                      <ul className="space-y-3">
                        {projects.map((p) => (
                          <li key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 group cursor-pointer"
                            onClick={() => { setSelectedProject(p); setActiveTab("milestones") }}>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">{p.title}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{p.description?.slice(0, 60) ?? "No description"}</p>
                              {(p.start_date || p.end_date) && (
                                <p className="text-xs text-slate-400 mt-1">
                                  {p.start_date ? new Date(p.start_date).toLocaleDateString() : "?"} → {p.end_date ? new Date(p.end_date).toLocaleDateString() : "?"}
                                </p>
                              )}
                            </div>
                            <Badge className={`text-[10px] shrink-0 ${STATUS_COLORS[p.status]}`}>{p.status.replace(/_/g, " ")}</Badge>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                              <select
                                className="text-xs border border-slate-200 rounded px-1 py-0.5 bg-white"
                                value={p.status}
                                onChange={(e) => updateProject(p.id, { status: e.target.value as Project["status"] })}
                              >
                                <option value="planning">Planning</option>
                                <option value="in_progress">In Progress</option>
                                <option value="review">Review</option>
                                <option value="completed">Completed</option>
                                <option value="paused">Paused</option>
                              </select>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                                onClick={async () => { await deleteProject(p.id); toast.success("Deleted") }}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="border-slate-200">
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Project OS features</CardTitle></CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2">
                      {["AI project planning and milestone generation", "Task decomposition with time estimates", "Gantt chart generation", "Requirement tracking", "Team collaboration workspaces", "Progress reporting", "Risk management and alerts"].map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs text-slate-600">
                          <span className="h-1 w-1 rounded-full bg-slate-400 shrink-0 mt-1.5" />{f}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            {tasks.length === 0 ? (
              <div className="py-16 text-center">
                <CheckSquare className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-base font-semibold text-slate-900 mb-2">No tasks yet</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mb-5">Create tasks from the Automation OS or within a project.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                    <div className={`h-3 w-3 rounded-full border-2 shrink-0 ${t.status === "completed" ? "bg-slate-900 border-slate-900" : "border-slate-300"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{t.title}</p>
                      {t.due_date && <p className="text-xs text-slate-400">Due {new Date(t.due_date).toLocaleDateString()}</p>}
                    </div>
                    <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600">{t.priority}</Badge>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="milestones">
            {selectedProject ? (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedProject(null)}>← Back</Button>
                  <h3 className="text-sm font-semibold text-slate-900">{selectedProject.title} — Milestones</h3>
                </div>
                {milestones.length === 0 ? (
                  <div className="py-8 text-center">
                    <Calendar className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No milestones yet for this project</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {milestones.map((m) => (
                      <li key={m.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100">
                        <div className={`h-3 w-3 rounded-full border-2 shrink-0 ${m.status === "completed" ? "bg-slate-900 border-slate-900" : "border-slate-300"}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{m.title}</p>
                          {m.due_date && <p className="text-xs text-slate-400">Due {new Date(m.due_date).toLocaleDateString()}</p>}
                        </div>
                        <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600">{m.status}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div className="py-16 text-center">
                <Calendar className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-base font-semibold text-slate-900 mb-2">Select a project</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mb-5">Click on a project to view its milestones.</p>
                <Button onClick={() => setActiveTab("projects")} variant="outline" className="border-slate-200">View projects</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Project</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input placeholder="e.g. Autonomous Robot Design" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea placeholder="Project overview and goals..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="h-24" />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as Project["status"] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Start date</Label>
                <Input type="date" value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>End date</Label>
                <Input type="date" value={form.end_date} onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} className="bg-slate-900 hover:bg-slate-800 text-white" disabled={!form.title}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
