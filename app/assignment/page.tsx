"use client"

import { useState } from "react"
import {
  FileText,
  Plus,
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
} from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const ASSIGNMENT_TYPES = [
  { id: "lab_report", label: "Lab Report", description: "Structured scientific report" },
  { id: "research_report", label: "Research Report", description: "Academic research document" },
  { id: "technical_doc", label: "Technical Documentation", description: "Engineering documentation" },
  { id: "case_study", label: "Case Study", description: "In-depth analysis" },
  { id: "essay", label: "Essay", description: "Argumentative or analytical writing" },
  { id: "reflection", label: "Reflection Paper", description: "Personal academic reflection" },
  { id: "presentation", label: "Presentation Script", description: "Slide deck narration" },
  { id: "poster", label: "Poster Draft", description: "Academic conference poster" },
]

const CITATION_FORMATS = [
  "IEEE", "APA", "MLA", "Harvard", "Chicago", "Custom",
]

export default function AssignmentOSPage() {
  const [activeTab, setActiveTab] = useState("assignments")
  const [selectedType, setSelectedType] = useState<string | null>(null)

  return (
    <div>
      <PageHeader
        title="Assignment OS"
        description="AI-powered academic writing for every assignment type and citation format."
        actions={
          <Button className="bg-slate-900 hover:bg-slate-800 text-white gap-2">
            <Plus className="h-4 w-4" />
            New assignment
          </Button>
        }
      />

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-slate-100 p-1">
            <TabsTrigger value="assignments" className="text-sm">Assignments</TabsTrigger>
            <TabsTrigger value="new" className="text-sm">New Assignment</TabsTrigger>
            <TabsTrigger value="templates" className="text-sm">Formatting Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {/* Status overview */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {STATUS_CARDS.map((s) => {
                    const Icon = s.icon
                    return (
                      <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className={`h-4 w-4 ${s.color}`} />
                          <span className="text-xs font-medium text-slate-600">{s.label}</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{s.count}</div>
                      </div>
                    )
                  })}
                </div>

                {/* Assignment list empty state */}
                <Card className="border-slate-200">
                  <CardContent className="pt-6">
                    <div className="py-12 text-center">
                      <FileText className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                      <h3 className="text-sm font-semibold text-slate-700 mb-2">No assignments yet</h3>
                      <p className="text-xs text-slate-400 mb-5 max-w-xs mx-auto">
                        Create your first assignment and let the AI generate a complete draft
                        in your required format.
                      </p>
                      <Button
                        onClick={() => setActiveTab("new")}
                        variant="outline"
                        className="border-slate-200 gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Create assignment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-900">
                      Supported formats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      {CITATION_FORMATS.map((f) => (
                        <Badge key={f} variant="secondary" className="text-xs bg-slate-100 text-slate-600 hover:bg-slate-100">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-900">
                      Assignment types
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2">
                      {ASSIGNMENT_TYPES.slice(0, 5).map((t) => (
                        <li key={t.id} className="flex items-center gap-2 text-xs text-slate-600">
                          <span className="h-1 w-1 rounded-full bg-slate-400 shrink-0" />
                          {t.label}
                        </li>
                      ))}
                      <li className="text-xs text-slate-400">+ {ASSIGNMENT_TYPES.length - 5} more types</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="new">
            <div className="max-w-2xl">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Select assignment type</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {ASSIGNMENT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all ${
                      selectedType === type.id
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <p className={`text-sm font-medium ${selectedType === type.id ? "text-white" : "text-slate-900"}`}>
                        {type.label}
                      </p>
                      <p className={`text-xs mt-0.5 ${selectedType === type.id ? "text-slate-300" : "text-slate-500"}`}>
                        {type.description}
                      </p>
                    </div>
                    <ChevronRight className={`h-4 w-4 shrink-0 ${selectedType === type.id ? "text-slate-300" : "text-slate-300"}`} />
                  </button>
                ))}
              </div>

              {selectedType && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-4 w-4 text-slate-600" />
                    <span className="text-sm font-semibold text-slate-900">Generate assignment</span>
                  </div>
                  <div className="space-y-3 mb-5">
                    <input
                      type="text"
                      placeholder="Assignment title"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                    <textarea
                      rows={3}
                      placeholder="Describe the assignment requirements..."
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <select className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900">
                        <option value="">Citation format</option>
                        {CITATION_FORMATS.map((f) => (
                          <option key={f} value={f.toLowerCase()}>{f}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Word count target"
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                  </div>
                  <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white gap-2">
                    <Sparkles className="h-4 w-4" />
                    Generate assignment draft
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="templates">
            <div className="py-16 text-center">
              <FileText className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-base font-semibold text-slate-900 mb-2">Formatting Templates</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                IEEE, APA, MLA, Harvard, Chicago, and custom university templates are built in.
                Contact your institution admin to add custom templates.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

const STATUS_CARDS = [
  { label: "In progress", count: 0, icon: Clock, color: "text-amber-500" },
  { label: "Under review", count: 0, icon: AlertCircle, color: "text-blue-500" },
  { label: "Submitted", count: 0, icon: CheckCircle, color: "text-emerald-500" },
]
