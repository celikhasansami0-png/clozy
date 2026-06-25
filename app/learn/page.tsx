"use client"

import { useState } from "react"
import {
  Brain, Upload, Video, FileText, Sparkles, ChevronRight, BookOpen,
  Target, Layers, RotateCcw, Trash2, Loader2, CheckCircle2,
} from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMaterials } from "@/hooks/use-materials"
import { useFlashcards } from "@/hooks/use-flashcards"
import { toast } from "sonner"
import type { MaterialType } from "@/types"

const MATERIAL_TYPES: { id: MaterialType; label: string; icon: typeof FileText; description: string }[] = [
  { id: "pdf", label: "PDF / Document", icon: FileText, description: "Textbooks, papers, notes" },
  { id: "lecture_slides", label: "Lecture Slides", icon: Layers, description: "PowerPoint, PDF slides" },
  { id: "youtube", label: "YouTube Lecture", icon: Video, description: "Paste a YouTube URL" },
  { id: "handwritten_notes", label: "Handwritten Notes", icon: BookOpen, description: "Photos of your notes" },
]

export default function LearnOSPage() {
  const [activeTab, setActiveTab] = useState("materials")
  const [addOpen, setAddOpen] = useState(false)
  const [generateOpen, setGenerateOpen] = useState(false)
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null)
  const [generatingFlashcards, setGeneratingFlashcards] = useState(false)
  const [form, setForm] = useState({ title: "", type: "pdf" as MaterialType, content: "" })
  const [reviewIndex, setReviewIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)

  const { materials, loading: matLoading, createMaterial, deleteMaterial } = useMaterials()
  const { flashcards, dueCards, loading: cardLoading, createFlashcard, submitReview } = useFlashcards()

  const handleAddMaterial = async () => {
    if (!form.title || !form.content) return
    try {
      await createMaterial({ title: form.title, type: form.type, content: form.content, file_url: null, topics: [], processed: false, course_id: null })
      setForm({ title: "", type: "pdf", content: "" })
      setAddOpen(false)
      toast.success("Material added!")
    } catch {
      toast.error("Failed to add material")
    }
  }

  const handleGenerateFlashcards = async () => {
    const material = materials.find((m) => m.id === selectedMaterialId)
    if (!material) return
    setGeneratingFlashcards(true)
    try {
      const res = await fetch("/api/ai/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: material.content, title: material.title, count: 10 }),
      })
      const { flashcards: generated } = await res.json()
      for (const card of generated) {
        await createFlashcard({ ...card, material_id: material.id, course_id: material.course_id, next_review_at: null, interval_days: 1, repetitions: 0, ease_factor: 2.5 })
      }
      toast.success(`${generated.length} flashcards generated!`)
      setGenerateOpen(false)
      setActiveTab("flashcards")
    } catch {
      toast.error("Failed to generate flashcards")
    } finally {
      setGeneratingFlashcards(false)
    }
  }

  const currentCard = dueCards[reviewIndex]

  const handleReview = async (quality: 0 | 3 | 5) => {
    if (!currentCard) return
    await submitReview(currentCard.id, quality)
    setShowAnswer(false)
    if (reviewIndex < dueCards.length - 1) setReviewIndex((i) => i + 1)
    else setReviewIndex(0)
  }

  return (
    <div>
      <PageHeader
        title="Learn OS"
        description="Transform any academic material into a personalized learning system."
        actions={
          <Button onClick={() => setAddOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white gap-2">
            <Upload className="h-4 w-4" />
            Add material
          </Button>
        }
      />

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-slate-100 p-1">
            <TabsTrigger value="materials" className="text-sm">Materials ({materials.length})</TabsTrigger>
            <TabsTrigger value="flashcards" className="text-sm">Flashcards {dueCards.length > 0 && `(${dueCards.length} due)`}</TabsTrigger>
            <TabsTrigger value="tutor" className="text-sm">AI Tutor</TabsTrigger>
            <TabsTrigger value="analytics" className="text-sm">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="materials">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Add a source</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {MATERIAL_TYPES.map((type) => {
                      const Icon = type.icon
                      return (
                        <button
                          key={type.id}
                          onClick={() => { setForm((f) => ({ ...f, type: type.id })); setAddOpen(true) }}
                          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-slate-300 hover:shadow-sm transition-all"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                            <Icon className="h-4 w-4 text-slate-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{type.label}</p>
                            <p className="text-xs text-slate-500">{type.description}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-300 ml-auto" />
                        </button>
                      )
                    })}
                  </div>
                </div>

                <Card className="border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-900">Your Materials</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {matLoading ? (
                      <div className="py-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
                    ) : materials.length === 0 ? (
                      <div className="py-10 text-center">
                        <Brain className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-sm font-medium text-slate-500 mb-1">No materials yet</p>
                        <p className="text-xs text-slate-400">Add your first material above to start learning</p>
                      </div>
                    ) : (
                      <ul className="space-y-2">
                        {materials.map((m) => (
                          <li key={m.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 group">
                            <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">{m.title}</p>
                              <p className="text-xs text-slate-400">{m.type.replace(/_/g, " ")} · {new Date(m.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="sm" variant="ghost" className="h-7 text-xs gap-1"
                                onClick={() => { setSelectedMaterialId(m.id); setGenerateOpen(true) }}>
                                <Sparkles className="h-3 w-3" /> Flashcards
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                                onClick={async () => { await deleteMaterial(m.id); toast.success("Deleted") }}>
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
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-900">What gets generated</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {[
                      { icon: Layers, label: "Topic extraction", desc: "Key concepts automatically identified" },
                      { icon: Brain, label: "Concept map", desc: "Visual knowledge graph" },
                      { icon: RotateCcw, label: "Flashcard deck", desc: "Active recall with spaced repetition" },
                      { icon: Target, label: "Exam readiness", desc: "How prepared you are" },
                    ].map((item) => {
                      const Icon = item.icon
                      return (
                        <div key={item.label} className="flex items-start gap-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 shrink-0">
                            <Icon className="h-3.5 w-3.5 text-slate-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-900">{item.label}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
                <Card className="border-slate-200 bg-slate-50">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-slate-600" />
                      <span className="text-xs font-semibold text-slate-700">AI Tutor included</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Once you add materials, ask the AI tutor anything about them. It adapts to your weak areas.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="flashcards">
            {cardLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
            ) : flashcards.length === 0 ? (
              <div className="py-16 text-center">
                <RotateCcw className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-base font-semibold text-slate-900 mb-2">No flashcards yet</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mb-5">Add a material and click Sparkles to generate flashcards automatically.</p>
                <Button variant="outline" className="border-slate-200 gap-2" onClick={() => setActiveTab("materials")}>
                  <Upload className="h-4 w-4" /> Go to Materials
                </Button>
              </div>
            ) : dueCards.length === 0 ? (
              <div className="py-16 text-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-base font-semibold text-slate-900 mb-2">All caught up!</h3>
                <p className="text-sm text-slate-500">No flashcards due for review. Total: {flashcards.length} cards.</p>
              </div>
            ) : (
              <div className="max-w-lg mx-auto">
                <p className="text-sm text-slate-500 text-center mb-6">{reviewIndex + 1} / {dueCards.length} due</p>
                <div
                  className="rounded-2xl border border-slate-200 bg-white p-10 text-center cursor-pointer shadow-sm hover:shadow-md transition-shadow min-h-[240px] flex flex-col items-center justify-center"
                  onClick={() => setShowAnswer((v) => !v)}
                >
                  {showAnswer ? (
                    <>
                      <p className="text-xs font-medium text-slate-400 mb-4 uppercase tracking-wider">Answer</p>
                      <p className="text-lg font-medium text-slate-900 leading-relaxed">{currentCard.back}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-medium text-slate-400 mb-4 uppercase tracking-wider">Question</p>
                      <p className="text-lg font-medium text-slate-900 leading-relaxed">{currentCard.front}</p>
                      <p className="text-xs text-slate-400 mt-6">Tap to reveal answer</p>
                    </>
                  )}
                </div>
                {showAnswer && (
                  <div className="flex gap-3 mt-6 justify-center">
                    <Button onClick={() => handleReview(0)} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">Again</Button>
                    <Button onClick={() => handleReview(3)} variant="outline" className="border-amber-200 text-amber-600 hover:bg-amber-50">Hard</Button>
                    <Button onClick={() => handleReview(5)} className="bg-slate-900 hover:bg-slate-800 text-white">Easy</Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tutor">
            <TutorTab materials={materials} />
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total materials", value: materials.length },
                { label: "Total flashcards", value: flashcards.length },
                { label: "Due for review", value: dueCards.length },
                { label: "Mastered cards", value: flashcards.filter((f) => f.repetitions >= 5).length },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="text-2xl font-bold text-slate-900 mb-0.5">{m.value}</div>
                  <div className="text-xs text-slate-500">{m.label}</div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Learning Material</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input placeholder="e.g. Thermodynamics Chapter 4" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as MaterialType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MATERIAL_TYPES.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Content (paste text or notes)</Label>
              <Textarea placeholder="Paste the content of your material here..." value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} className="h-40" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddMaterial} className="bg-slate-900 hover:bg-slate-800 text-white" disabled={!form.title || !form.content}>
              Add Material
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Generate Flashcards</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600">AI will generate 10 flashcards from <strong>{materials.find((m) => m.id === selectedMaterialId)?.title}</strong> using spaced repetition.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateOpen(false)}>Cancel</Button>
            <Button onClick={handleGenerateFlashcards} className="bg-slate-900 hover:bg-slate-800 text-white gap-2" disabled={generatingFlashcards}>
              {generatingFlashcards ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TutorTab({ materials }: { materials: { id: string; title: string; content: string | null }[] }) {
  const [question, setQuestion] = useState("")
  const [contextId, setContextId] = useState("")
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([])

  const ask = async () => {
    if (!question) return
    setLoading(true)
    const material = materials.find((m) => m.id === contextId)
    try {
      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, context: material?.content, history }),
      })
      const { answer } = await res.json()
      setHistory((h) => [...h, { role: "user", content: question }, { role: "assistant", content: answer }])
      setQuestion("")
    } catch {
      toast.error("Failed to get response")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {history.length === 0 && (
        <div className="py-8 text-center">
          <Brain className="h-12 w-12 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Ask your AI tutor anything about your materials</p>
        </div>
      )}
      {history.map((msg, i) => (
        <div key={i} className={`rounded-xl p-4 text-sm ${msg.role === "user" ? "bg-slate-900 text-white ml-12" : "bg-slate-100 text-slate-900 mr-12"}`}>
          {msg.content}
        </div>
      ))}
      {materials.length > 0 && (
        <Select value={contextId} onValueChange={setContextId}>
          <SelectTrigger className="border-slate-200"><SelectValue placeholder="Select material context (optional)" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">No specific material</SelectItem>
            {materials.map((m) => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}
          </SelectContent>
        </Select>
      )}
      <div className="flex gap-2">
        <Input placeholder="Ask a question..." value={question} onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && ask()} />
        <Button onClick={ask} disabled={loading || !question} className="bg-slate-900 hover:bg-slate-800 text-white gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ask"}
        </Button>
      </div>
    </div>
  )
}
