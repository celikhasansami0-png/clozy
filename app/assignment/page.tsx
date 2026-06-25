"use client"

import { useState } from "react"
import {
  FileText, Plus, Sparkles, Clock, CheckCircle, AlertCircle, ChevronRight, Loader2, Trash2,
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
import { useAssignments } from "@/hooks/use-assignments"
import { toast } from "sonner"
import type { AssignmentType, CitationFormat } from "@/types"

const ASSIGNMENT_TYPES: { id: AssignmentType; label: string; description: string }[] = [
  { id: "lab_report", label: "Lab Report", description: "Structured scientific report" },
  { id: "research_report", label: "Research Report", description: "Academic research document" },
  { id: "technical_doc", label: "Technical Documentation", description: "Engineering documentation" },
  { id: "case_study", label: "Case Study", description: "In-depth analysis" },
  { id: "essay", label: "Essay", description: "Argumentative or analytical writing" },
  { id: "reflection", label: "Reflection Paper", description: "Personal academic reflection" },
  { id: "presentation", label: "Presentation Script", description: "Slide deck narration" },
  { id: "poster", label: "Poster Draft", description: "Academic conference poster" },
]

const CITATION_FORMATS = ["ieee", "apa", "mla", "harvard", "chicago", "custom"] as const

export default function AssignmentOSPage() {
  const [activeTab, setActiveTab] = useState("assignments")
  const [selectedType, setSelectedType] = useState<AssignmentType | null>(null)
  const [generating, setGenerating] = useState(false)
  const [viewContent, setViewContent] = useState<{ title: string; content: string } | null>(null)
  const [form, setForm] = useState({
    title: "", description: "", citation_format: "ieee" as CitationFormat,
    word_count: 1000, due_date: "",
  })

  const { assignments, active, submitted, loading, createAssignment, updateAssignment, deleteAssignment } = useAssignments()

  const handleGenerate = async () => {
    if (!selectedType || !form.title) return
    setGenerating(true)
    try {
      const res = await fetch("/api/ai/generate-assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selectedType, title: form.title, description: form.description, word_count: form.word_count, citation_format: form.citation_format }),
      })
      const { content } = await res.json()
      const assignment = await createAssignment({
        title: form.title,
        type: selectedType,
        description: form.description || null,
        citation_format: form.citation_format,
        due_date: form.due_date || null,
        word_count_target: form.word_count,
        content,
        status: "draft",
        grade: null,
        feedback: null,
        course_id: null,
      })
      toast.success("Assignment draft generated!")
      setViewContent({ title: assignment.title, content })
      setSelectedType(null)
      setForm({ title: "", description: "", citation_format: "ieee", word_count: 1000, due_date: "" })
      setActiveTab("assignments")
    } catch {
      toast.error("Failed to generate assignment")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Assignment OS"
        description="AI-powered academic writing for every assignment type and citation format."
        actions={
          <Button onClick={() => setActiveTab("new")} className="bg-slate-900 hover:bg-slate-800 text-white gap-2">
            <Plus className="h-4 w-4" />
            New assignment
          </Button>
        }
      />

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-slate-100 p-1">
            <TabsTrigger value="assignments" className="text-sm">Assignments ({assignments.length})</TabsTrigger>
            <TabsTrigger value="new" className="text-sm">New Assignment</TabsTrigger>
            <TabsTrigger value="templates" className="text-sm">Formats</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-2 mb-2"><Clock className="h-4 w-4 text-amber-500" /><span className="text-xs font-medium text-slate-600">In progress</span></div>
                    <div className="text-2xl font-bold text-slate-900">{active.filter((a) => a.status === "in_progress").length}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-2 mb-2"><AlertCircle className="h-4 w-4 text-blue-500" /><span className="text-xs font-medium text-slate-600">Draft</span></div>
                    <div className="text-2xl font-bold text-slate-900">{active.filter((a) => a.status === "draft").length}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-2 mb-2"><CheckCircle className="h-4 w-4 text-emerald-500" /><span className="text-xs font-medium text-slate-600">Submitted</span></div>
                    <div className="text-2xl font-bold text-slate-900">{submitted.length}</div>
                  </div>
                </div>

                <Card className="border-slate-200">
                  <CardContent className="pt-6">
                    {loading ? (
                      <div className="py-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
                    ) : assignments.length === 0 ? (
                      <div className="py-12 text-center">
                        <FileText className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-sm font-semibold text-slate-700 mb-2">No assignments yet</h3>
                        <p className="text-xs text-slate-400 mb-5 max-w-xs mx-auto">Create your first assignment and let the AI generate a complete draft.</p>
                        <Button onClick={() => setActiveTab("new")} variant="outline" className="border-slate-200 gap-2">
                          <Plus className="h-4 w-4" /> Create assignment
                        </Button>
                      </div>
                    ) : (
                      <ul className="space-y-2">
                        {assignments.map((a) => (
                          <li key={a.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 group border border-slate-100">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">{a.title}</p>
                              <p className="text-xs text-slate-400">{a.type.replace(/_/g, " ")} · {a.citation_format?.toUpperCase()} {a.due_date ? `· due ${new Date(a.due_date).toLocaleDateString()}` : ""}</p>
                            </div>
                            <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 shrink-0">{a.status}</Badge>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {a.content && (
                                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setViewContent({ title: a.title, content: a.content! })}>View</Button>
                              )}
                              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => updateAssignment(a.id, { status: "submitted" }).then(() => toast.success("Marked submitted"))}>Submit</Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                                onClick={async () => { await deleteAssignment(a.id); toast.success("Deleted") }}>
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
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Supported formats</CardTitle></CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      {CITATION_FORMATS.map((f) => (
                        <Badge key={f} variant="secondary" className="text-xs bg-slate-100 text-slate-600">{f.toUpperCase()}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-slate-200">
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-900">Assignment types</CardTitle></CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2">
                      {ASSIGNMENT_TYPES.map((t) => (
                        <li key={t.id} className="flex items-center gap-2 text-xs text-slate-600">
                          <span className="h-1 w-1 rounded-full bg-slate-400 shrink-0" />{t.label}
                        </li>
                      ))}
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
                      selectedType === type.id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <p className={`text-sm font-medium ${selectedType === type.id ? "text-white" : "text-slate-900"}`}>{type.label}</p>
                      <p className={`text-xs mt-0.5 ${selectedType === type.id ? "text-slate-300" : "text-slate-500"}`}>{type.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>

              {selectedType && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-slate-600" />
                    <span className="text-sm font-semibold text-slate-900">Generate assignment</span>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Title</Label>
                    <Input placeholder="Assignment title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Requirements / Description</Label>
                    <Textarea rows={3} placeholder="Describe the assignment requirements..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Citation format</Label>
                      <Select value={form.citation_format} onValueChange={(v) => setForm((f) => ({ ...f, citation_format: v as CitationFormat }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CITATION_FORMATS.map((f) => <SelectItem key={f} value={f}>{f.toUpperCase()}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Word count target</Label>
                      <Input type="number" placeholder="1000" value={form.word_count} onChange={(e) => setForm((f) => ({ ...f, word_count: parseInt(e.target.value) || 1000 }))} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Due date (optional)</Label>
                    <Input type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} />
                  </div>
                  <Button onClick={handleGenerate} className="w-full bg-slate-900 hover:bg-slate-800 text-white gap-2" disabled={generating || !form.title}>
                    {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate assignment draft</>}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="templates">
            <div className="py-16 text-center">
              <FileText className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-base font-semibold text-slate-900 mb-2">Formatting Templates</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">IEEE, APA, MLA, Harvard, Chicago, and custom university templates are built in.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* View content dialog */}
      <Dialog open={!!viewContent} onOpenChange={() => setViewContent(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{viewContent?.title}</DialogTitle></DialogHeader>
          <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed">{viewContent?.content}</pre>
          <DialogFooter>
            <Button onClick={() => { navigator.clipboard.writeText(viewContent?.content ?? ""); toast.success("Copied!") }} variant="outline">Copy</Button>
            <Button onClick={() => setViewContent(null)} className="bg-slate-900 hover:bg-slate-800 text-white">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
