"use client"

import { useState } from "react"
import {
  ClipboardCheck, Plus, Timer, TrendingUp, AlertTriangle, CheckCircle,
  Zap, BarChart2, FileQuestion, Loader2, Trash2, Sparkles,
} from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useExams } from "@/hooks/use-exams"
import { toast } from "sonner"
import type { Exam } from "@/types"

export default function ExamOSPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [addOpen, setAddOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [form, setForm] = useState({ title: "", type: "mock" as Exam["type"], topic: "", difficulty: "medium", question_count: 10 })

  const { exams, loading, createExam, deleteExam } = useExams()

  const handleGenerateMockExam = async () => {
    if (!form.title || !form.topic) return
    setGenerating(true)
    try {
      const res = await fetch("/api/ai/generate-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: form.topic, difficulty: form.difficulty, question_count: form.question_count, question_types: ["multiple_choice", "short_answer"] }),
      })
      const { questions } = await res.json()
      await createExam({
        title: form.title,
        type: form.type,
        course_id: null,
        duration_minutes: form.question_count * 2,
        total_marks: questions.reduce((sum: number, q: { marks: number }) => sum + (q.marks ?? 1), 0),
        questions: questions.map((q: object, i: number) => ({ id: String(i + 1), exam_id: "", ...q })),
        status: "ready",
      })
      toast.success("Mock exam generated!")
      setAddOpen(false)
      setForm({ title: "", type: "mock", topic: "", difficulty: "medium", question_count: 10 })
    } catch {
      toast.error("Failed to generate exam")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Exam OS"
        description="Maximize exam performance through pattern analysis, mock exams, and readiness scoring."
        actions={
          <Button onClick={() => setAddOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white gap-2">
            <Plus className="h-4 w-4" />
            Generate mock exam
          </Button>
        }
      />

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-slate-100 p-1">
            <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
            <TabsTrigger value="mock" className="text-sm">Mock Exams ({exams.length})</TabsTrigger>
            <TabsTrigger value="patterns" className="text-sm">Patterns</TabsTrigger>
            <TabsTrigger value="readiness" className="text-sm">Readiness</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-slate-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-semibold text-slate-900">Exam Readiness Dashboard</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      {[
                        { label: "Total exams", value: exams.length },
                        { label: "Ready", value: exams.filter((e) => e.status === "ready").length },
                        { label: "Completed", value: exams.filter((e) => e.status === "completed").length },
                        { label: "Mock exams", value: exams.filter((e) => e.type === "mock").length },
                        { label: "Practice exams", value: exams.filter((e) => e.type === "practice").length },
                        { label: "Total questions", value: exams.reduce((s, e) => s + (e.questions?.length ?? 0), 0) },
                      ].map((m) => (
                        <div key={m.label} className="rounded-lg bg-slate-50 border border-slate-100 p-4">
                          <div className="text-xl font-bold text-slate-900 mb-0.5">{m.value}</div>
                          <div className="text-[11px] text-slate-500">{m.label}</div>
                        </div>
                      ))}
                    </div>
                    {exams.length === 0 && (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
                        <ClipboardCheck className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm font-medium text-slate-600 mb-1">No exams yet</p>
                        <p className="text-xs text-slate-400 mb-4">Generate a mock exam to get started</p>
                        <Button onClick={() => setAddOpen(true)} variant="outline" size="sm" className="border-slate-200 gap-2">
                          <Sparkles className="h-3.5 w-3.5" /> Generate mock exam
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold text-slate-900">Your Exams</CardTitle>
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500" onClick={() => setAddOpen(true)}>
                        <Plus className="h-3.5 w-3.5 mr-1" /> New
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="py-6 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
                    ) : exams.length === 0 ? (
                      <div className="py-8 text-center">
                        <FileQuestion className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">No exams yet</p>
                      </div>
                    ) : (
                      <ul className="space-y-2">
                        {exams.map((exam) => (
                          <li key={exam.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 group">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">{exam.title}</p>
                              <p className="text-xs text-slate-400">{exam.type} · {exam.questions?.length ?? 0} questions · {exam.duration_minutes}min</p>
                            </div>
                            <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 shrink-0">{exam.status}</Badge>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100"
                              onClick={async () => { await deleteExam(exam.id); toast.success("Deleted") }}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-900">What Exam OS does</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-3">
                      {[
                        { icon: BarChart2, label: "Pattern extraction", desc: "Recurring question types" },
                        { icon: TrendingUp, label: "Difficulty analysis", desc: "Question difficulty distribution" },
                        { icon: Zap, label: "Exam prediction", desc: "Predict likely questions" },
                        { icon: Timer, label: "Mock exam generation", desc: "Timed, adaptive, oral" },
                        { icon: CheckCircle, label: "Formula memorization", desc: "Smart formula recall" },
                        { icon: AlertTriangle, label: "Risk assessment", desc: "Identify weak areas" },
                      ].map((f) => {
                        const Icon = f.icon
                        return (
                          <li key={f.label} className="flex items-start gap-3">
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 shrink-0 mt-0.5">
                              <Icon className="h-3.5 w-3.5 text-slate-600" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-900">{f.label}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{f.desc}</p>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="mock">
            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
            ) : exams.length === 0 ? (
              <div className="py-16 text-center">
                <Timer className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-base font-semibold text-slate-900 mb-2">No mock exams yet</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">Generate a timed, adaptive mock exam from any topic.</p>
                <Button onClick={() => setAddOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white gap-2">
                  <Sparkles className="h-4 w-4" /> Generate exam
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {exams.map((exam) => (
                  <Card key={exam.id} className="border-slate-200">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{exam.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{exam.questions?.length ?? 0} questions · {exam.duration_minutes} min · {exam.total_marks} marks</p>
                          <Badge variant="secondary" className="mt-2 text-[10px] bg-slate-100 text-slate-600">{exam.type}</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white" onClick={() => window.location.href = `/exam/${exam.id}/attempt`}>Start exam</Button>
                          <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-600 hover:bg-red-50"
                            onClick={async () => { await deleteExam(exam.id); toast.success("Deleted") }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="patterns">
            <div className="py-16 text-center">
              <BarChart2 className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-base font-semibold text-slate-900 mb-2">Pattern Analysis</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">Add past exam papers to unlock pattern extraction, difficulty analysis, and question clustering.</p>
            </div>
          </TabsContent>

          <TabsContent value="readiness">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { icon: TrendingUp, label: "Predicted Score", value: "—", description: "Based on mock exam performance" },
                { icon: CheckCircle, label: "Pass Probability", value: "—", description: "Likelihood of passing" },
                { icon: AlertTriangle, label: "Risk Factors", value: "—", description: "Areas requiring attention" },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                        <Icon className="h-4 w-4 text-slate-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-900">{item.label}</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 mb-1">{item.value}</div>
                    <p className="text-xs text-slate-500">{item.description}</p>
                  </div>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Generate Mock Exam</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Exam Title</Label>
              <Input placeholder="e.g. Thermodynamics Final Mock" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Topic / Subject</Label>
              <Input placeholder="e.g. Heat transfer, Carnot cycle" value={form.topic} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Difficulty</Label>
                <Select value={form.difficulty} onValueChange={(v) => setForm((f) => ({ ...f, difficulty: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Questions</Label>
                <Input type="number" min={5} max={30} value={form.question_count}
                  onChange={(e) => setForm((f) => ({ ...f, question_count: parseInt(e.target.value) || 10 }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleGenerateMockExam} className="bg-slate-900 hover:bg-slate-800 text-white gap-2" disabled={generating || !form.title || !form.topic}>
              {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
