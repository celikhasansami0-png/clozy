"use client"

import { useState } from "react"
import {
  FolderOpen,
  Plus,
  Calendar,
  Users,
  CheckSquare,
  AlertTriangle,
  MoreHorizontal,
} from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const PROJECT_FEATURES = [
  "AI project planning and milestone generation",
  "Task decomposition with time estimates",
  "Gantt chart generation",
  "Requirement tracking",
  "Team collaboration workspaces",
  "Progress reporting",
  "Risk management and alerts",
  "Automated status updates",
]

export default function ProjectOSPage() {
  const [activeTab, setActiveTab] = useState("projects")

  return (
    <div>
      <PageHeader
        title="Project OS"
        description="Plan, execute, and track semester-long engineering projects with AI assistance."
        actions={
          <Button className="bg-slate-900 hover:bg-slate-800 text-white gap-2">
            <Plus className="h-4 w-4" />
            New project
          </Button>
        }
      />

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-slate-100 p-1">
            <TabsTrigger value="projects" className="text-sm">Projects</TabsTrigger>
            <TabsTrigger value="tasks" className="text-sm">Tasks</TabsTrigger>
            <TabsTrigger value="milestones" className="text-sm">Milestones</TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {PROJECT_STATS.map((s) => {
                    const Icon = s.icon
                    return (
                      <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4">
                        <Icon className="h-4 w-4 text-slate-400 mb-2" />
                        <div className="text-2xl font-bold text-slate-900 mb-0.5">{s.value}</div>
                        <div className="text-xs text-slate-500">{s.label}</div>
                      </div>
                    )
                  })}
                </div>

                {/* Empty state */}
                <Card className="border-slate-200">
                  <CardContent className="pt-6">
                    <div className="py-14 text-center">
                      <FolderOpen className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                      <h3 className="text-sm font-semibold text-slate-700 mb-2">No projects yet</h3>
                      <p className="text-xs text-slate-400 mb-5 max-w-xs mx-auto">
                        Create a project and the AI will generate a full plan with milestones,
                        tasks, timelines, and risk assessments.
                      </p>
                      <Button variant="outline" className="border-slate-200 gap-2">
                        <Plus className="h-4 w-4" />
                        Create your first project
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-900">
                      Project OS features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2">
                      {PROJECT_FEATURES.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs text-slate-600">
                          <span className="h-1 w-1 rounded-full bg-slate-400 shrink-0 mt-1.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <div className="py-16 text-center">
              <CheckSquare className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-base font-semibold text-slate-900 mb-2">No tasks yet</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-5">
                Create a project first. The AI will decompose it into individual tasks
                with time estimates and priorities.
              </p>
              <Button
                onClick={() => setActiveTab("projects")}
                variant="outline"
                className="border-slate-200"
              >
                Create a project
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="milestones">
            <div className="py-16 text-center">
              <Calendar className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-base font-semibold text-slate-900 mb-2">No milestones yet</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-5">
                Milestones are automatically generated when you create a project.
                Each milestone has its own task list and deadline tracking.
              </p>
              <Button
                onClick={() => setActiveTab("projects")}
                variant="outline"
                className="border-slate-200"
              >
                Create a project
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

const PROJECT_STATS = [
  { label: "Active projects", value: 0, icon: FolderOpen },
  { label: "Team members", value: 0, icon: Users },
  { label: "Overdue tasks", value: 0, icon: AlertTriangle },
]
