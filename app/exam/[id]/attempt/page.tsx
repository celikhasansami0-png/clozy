"use client"

import { useState, useEffect, useCallback, use } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronLeft, ChevronRight, Flag, CheckCircle, Clock, AlertTriangle, Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { useExams } from "@/hooks/use-exams"
import { toast } from "sonner"
import type { Exam, ExamQuestion } from "@/types"

type Phase = "loading" | "intro" | "attempt" | "results"

type AttemptResults = {
  score: number
  total: number
  correct: number
  wrong: number
  answers: Record<string, string>
  timeTaken: number
}

export default function ExamAttemptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>("loading")
  const [exam, setExam] = useState<Exam | null>(null)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [flagged, setFlagged] = useState<Set<string>>(new Set())
  const [timeLeft, setTimeLeft] = useState(0)
  const [startedAt] = useState(new Date().toISOString())
  const [results, setResults] = useState<AttemptResults | null>(null)

  const { submitAttempt } = useExams()
  const supabase = createClient()

  useEffect(() => {
    supabase.from("exams").select("*").eq("id", id).single().then(({ data }) => {
      if (data) {
        setExam(data as Exam)
        setTimeLeft((data.duration_minutes ?? 30) * 60)
        setPhase("intro")
      } else {
        toast.error("Exam not found")
        router.push("/exam")
      }
    })
  }, [id, supabase, router])

  const handleSubmit = useCallback(async () => {
    if (!exam) return
    const timeTaken = Math.round(((exam.duration_minutes ?? 30) * 60 - timeLeft) / 60)
    let score = 0
    let correct = 0

    exam.questions.forEach((q) => {
      const userAnswer = answers[q.id]
      if (userAnswer && userAnswer.trim().toLowerCase() === q.correct_answer?.trim().toLowerCase()) {
        score += q.marks ?? 1
        correct++
      }
    })

    try {
      await submitAttempt({
        exam_id: exam.id,
        score,
        total_marks: exam.total_marks ?? exam.questions.reduce((s, q) => s + (q.marks ?? 1), 0),
        duration_minutes: timeTaken,
        answers,
        started_at: startedAt,
        completed_at: new Date().toISOString(),
      })
    } catch {
      // attempt save failed but still show results
    }

    setResults({
      score,
      total: exam.total_marks ?? exam.questions.reduce((s, q) => s + (q.marks ?? 1), 0),
      correct,
      wrong: exam.questions.length - correct,
      answers,
      timeTaken,
    })
    setPhase("results")
  }, [exam, answers, timeLeft, startedAt, submitAttempt])

  // Countdown timer
  useEffect(() => {
    if (phase !== "attempt") return
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(interval); handleSubmit(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [phase, handleSubmit])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0")
    const s = (seconds % 60).toString().padStart(2, "0")
    return `${m}:${s}`
  }

  const toggleFlag = (qId: string) => setFlagged((prev) => {
    const next = new Set(prev)
    next.has(qId) ? next.delete(qId) : next.add(qId)
    return next
  })

  if (phase === "loading") {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
  }

  if (phase === "intro" && exam) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-slate-200">
          <CardHeader className="pb-4 text-center">
            <CardTitle className="text-lg font-bold text-slate-900">{exam.title}</CardTitle>
            <p className="text-sm text-slate-500 mt-1">{exam.type.replace(/_/g, " ")}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                <div className="text-lg font-bold text-slate-900">{exam.questions.length}</div>
                <div className="text-[11px] text-slate-500">Questions</div>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                <div className="text-lg font-bold text-slate-900">{exam.duration_minutes ?? 30}</div>
                <div className="text-[11px] text-slate-500">Minutes</div>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                <div className="text-lg font-bold text-slate-900">{exam.total_marks ?? exam.questions.reduce((s, q) => s + (q.marks ?? 1), 0)}</div>
                <div className="text-[11px] text-slate-500">Total marks</div>
              </div>
            </div>
            <div className="rounded-lg border border-amber-100 bg-amber-50 p-3 text-xs text-amber-700">
              <AlertTriangle className="h-3.5 w-3.5 inline mr-1.5" />
              Once you start, the timer begins. You can navigate between questions and flag them for review.
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 border-slate-200" onClick={() => router.push("/exam")}>
                Cancel
              </Button>
              <Button className="flex-1 bg-slate-900 hover:bg-slate-800 text-white" onClick={() => setPhase("attempt")}>
                Start Exam
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (phase === "results" && exam && results) {
    const pct = Math.round((results.score / results.total) * 100)
    const passed = pct >= 50
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${passed ? "bg-emerald-100" : "bg-red-100"}`}>
              {passed
                ? <CheckCircle className="h-8 w-8 text-emerald-600" />
                : <AlertTriangle className="h-8 w-8 text-red-500" />}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">{passed ? "Well done!" : "Keep practicing"}</h1>
            <p className="text-slate-500 text-sm">{exam.title}</p>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: "Score", value: `${results.score}/${results.total}` },
              { label: "Percentage", value: `${pct}%` },
              { label: "Correct", value: results.correct },
              { label: "Time taken", value: `${results.timeTaken}min` },
            ].map((m) => (
              <div key={m.label} className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                <div className="text-xl font-bold text-slate-900 mb-0.5">{m.value}</div>
                <div className="text-[11px] text-slate-500">{m.label}</div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {exam.questions.map((q, i) => {
              const userAnswer = results.answers[q.id]
              const isCorrect = userAnswer?.trim().toLowerCase() === q.correct_answer?.trim().toLowerCase()
              return (
                <Card key={q.id} className={`border ${isCorrect ? "border-emerald-200 bg-emerald-50/30" : "border-red-200 bg-red-50/30"}`}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full shrink-0 text-xs font-bold mt-0.5 ${isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 mb-2">{q.question}</p>
                        {q.options && (
                          <div className="space-y-1 mb-2">
                            {q.options.map((opt) => (
                              <div key={opt} className={`text-xs px-2 py-1 rounded ${
                                opt === q.correct_answer ? "bg-emerald-100 text-emerald-800 font-medium" :
                                opt === userAnswer ? "bg-red-100 text-red-700" : "text-slate-500"
                              }`}>{opt}</div>
                            ))}
                          </div>
                        )}
                        {!q.options && (
                          <div className="space-y-1 mb-2">
                            <p className="text-xs text-slate-500">Your answer: <span className={isCorrect ? "text-emerald-700 font-medium" : "text-red-600"}>{userAnswer || "(not answered)"}</span></p>
                            <p className="text-xs text-emerald-700">Correct: <span className="font-medium">{q.correct_answer}</span></p>
                          </div>
                        )}
                        {q.explanation && (
                          <p className="text-xs text-slate-500 bg-slate-50 rounded px-2 py-1.5 border border-slate-100">{q.explanation}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="flex justify-center gap-3 mt-8">
            <Button variant="outline" className="border-slate-200" onClick={() => router.push("/exam")}>Back to Exams</Button>
            <Button className="bg-slate-900 hover:bg-slate-800 text-white" onClick={() => { setAnswers({}); setFlagged(new Set()); setCurrent(0); setTimeLeft((exam.duration_minutes ?? 30) * 60); setResults(null); setPhase("intro") }}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (phase === "attempt" && exam) {
    const q: ExamQuestion = exam.questions[current]
    const answered = Object.keys(answers).length
    const total = exam.questions.length

    return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-900">{exam.title}</span>
            <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600">{answered}/{total} answered</Badge>
          </div>
          <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 ${timeLeft < 300 ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-700"}`}>
            <Clock className="h-3.5 w-3.5" />
            <span className="text-sm font-mono font-semibold">{formatTime(timeLeft)}</span>
          </div>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white h-8 text-xs" onClick={handleSubmit}>
            Submit exam
          </Button>
        </div>

        <div className="flex h-[calc(100vh-57px)]">
          {/* Question nav sidebar */}
          <div className="w-56 shrink-0 border-r border-slate-200 bg-white p-4 overflow-y-auto">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Questions</p>
            <div className="grid grid-cols-5 gap-1.5">
              {exam.questions.map((question, i) => {
                const isAnswered = !!answers[question.id]
                const isFlagged = flagged.has(question.id)
                const isCurrent = i === current
                return (
                  <button
                    key={question.id}
                    onClick={() => setCurrent(i)}
                    className={`h-8 w-8 rounded text-xs font-medium transition-colors flex items-center justify-center ${
                      isCurrent ? "bg-slate-900 text-white" :
                      isFlagged ? "bg-amber-100 text-amber-700 border border-amber-200" :
                      isAnswered ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                      "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>
            <div className="mt-4 space-y-1.5 text-[11px] text-slate-500">
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-emerald-100 border border-emerald-200" />Answered</div>
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-amber-100 border border-amber-200" />Flagged</div>
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-slate-50 border border-slate-200" />Not answered</div>
            </div>
          </div>

          {/* Question area */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">Question {current + 1}</span>
                  <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-500">{q.difficulty}</Badge>
                  {q.topic && <Badge variant="secondary" className="text-[10px] bg-blue-50 text-blue-600">{q.topic}</Badge>}
                  <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-500">{q.marks ?? 1} mark{(q.marks ?? 1) !== 1 ? "s" : ""}</Badge>
                </div>
                <Button size="sm" variant="ghost" className={`h-7 gap-1 text-xs ${flagged.has(q.id) ? "text-amber-600 bg-amber-50" : "text-slate-400"}`}
                  onClick={() => toggleFlag(q.id)}>
                  <Flag className="h-3.5 w-3.5" />
                  {flagged.has(q.id) ? "Flagged" : "Flag"}
                </Button>
              </div>

              <Card className="border-slate-200 mb-6">
                <CardContent className="pt-5 pb-5">
                  <p className="text-sm font-medium text-slate-900 leading-relaxed">{q.question}</p>
                </CardContent>
              </Card>

              {/* Multiple choice */}
              {q.type === "multiple_choice" && q.options && (
                <div className="space-y-2">
                  {q.options.map((opt) => (
                    <button key={opt} onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                      className={`w-full text-left rounded-lg border px-4 py-3 text-sm transition-all ${
                        answers[q.id] === opt
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                      }`}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {/* True/False */}
              {q.type === "true_false" && (
                <div className="flex gap-3">
                  {["True", "False"].map((opt) => (
                    <button key={opt} onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                      className={`flex-1 rounded-lg border py-3 text-sm font-medium transition-all ${
                        answers[q.id] === opt
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                      }`}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {/* Short answer / Fill blank / Long answer */}
              {(q.type === "short_answer" || q.type === "fill_blank" || q.type === "long_answer") && (
                <textarea
                  rows={q.type === "long_answer" ? 6 : 3}
                  placeholder="Type your answer here..."
                  value={answers[q.id] ?? ""}
                  onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                />
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6">
                <Button variant="outline" className="border-slate-200 gap-2" disabled={current === 0}
                  onClick={() => setCurrent((c) => c - 1)}>
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                {current < exam.questions.length - 1 ? (
                  <Button className="bg-slate-900 hover:bg-slate-800 text-white gap-2" onClick={() => setCurrent((c) => c + 1)}>
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2" onClick={handleSubmit}>
                    <CheckCircle className="h-4 w-4" /> Submit
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
