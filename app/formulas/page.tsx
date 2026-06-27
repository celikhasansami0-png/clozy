"use client"

import { useState } from "react"
import { Search, Sparkles, Loader2, Copy, Check } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MarkdownPreview } from "@/components/ui/markdown-editor"
import { useFlashcards } from "@/hooks/use-flashcards"
import { toast } from "sonner"
import formulasData from "@/data/formulas.json"

interface FormulaVariable { symbol: string; meaning: string }
interface Formula {
  id: string; name: string; latex: string; description: string
  variables: FormulaVariable[]; tags: string[]
}
interface Branch {
  id: string; branch: string; color: string; formulas: Formula[]
}

const BRANCHES = formulasData as Branch[]

export default function FormulasPage() {
  const [selectedBranch, setSelectedBranch] = useState<string>(BRANCHES[0].id)
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [explaining, setExplaining] = useState<string | null>(null)
  const [explanations, setExplanations] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState<string | null>(null)

  const { createFlashcard } = useFlashcards()

  const branch = BRANCHES.find((b) => b.id === selectedBranch)!

  const displayFormulas = search.trim()
    ? BRANCHES.flatMap((b) => b.formulas).filter((f) =>
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      )
    : branch.formulas

  const handleExplain = async (formula: Formula) => {
    if (explanations[formula.id]) {
      setExpanded(formula.id)
      return
    }
    setExplaining(formula.id)
    setExpanded(formula.id)
    try {
      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: `Explain this engineering formula in simple terms, with a practical example: ${formula.name} — ${formula.latex}\n\nDescription: ${formula.description}`,
          context: null,
          history: [],
        }),
      })
      const { answer } = await res.json()
      setExplanations((prev) => ({ ...prev, [formula.id]: answer }))
    } catch {
      toast.error("Failed to get AI explanation")
    } finally {
      setExplaining(null)
    }
  }

  const handleCreateFlashcard = async (formula: Formula) => {
    try {
      await createFlashcard({
        front: `What is the formula for ${formula.name}?`,
        back: `$$${formula.latex}$$\n\n${formula.description}`,
        difficulty: "medium",
        material_id: null,
        course_id: null,
        next_review_at: null,
        interval_days: 1,
        repetitions: 0,
        ease_factor: 2.5,
      })
      toast.success("Flashcard created!")
    } catch {
      toast.error("Failed to create flashcard")
    }
  }

  const handleCopy = (formula: Formula) => {
    navigator.clipboard.writeText(`$${formula.latex}$`)
    setCopied(formula.id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div>
      <PageHeader
        title="Formula Library"
        description="Engineering formulas with LaTeX, explanations, and one-click flashcard generation."
      />

      <div className="p-6">
        {/* Search + Branch selector */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search formulas..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          {!search && (
            <div className="flex gap-2 flex-wrap">
              {BRANCHES.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBranch(b.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    selectedBranch === b.id
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {b.branch}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {BRANCHES.map((b) => (
            <div
              key={b.id}
              className="rounded-xl border border-slate-200 bg-white p-3 cursor-pointer hover:border-slate-300 transition-all"
              onClick={() => { setSelectedBranch(b.id); setSearch("") }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide truncate">{b.branch}</span>
              </div>
              <p className="text-lg font-bold text-slate-900">{b.formulas.length}</p>
              <p className="text-[10px] text-slate-400">formulas</p>
            </div>
          ))}
        </div>

        {search && (
          <p className="text-xs text-slate-500 mb-4">{displayFormulas.length} result{displayFormulas.length !== 1 ? "s" : ""} for &quot;{search}&quot;</p>
        )}

        {/* Formula cards */}
        <div className="space-y-3">
          {displayFormulas.map((formula) => {
            const isExpanded = expanded === formula.id
            const isExplaining = explaining === formula.id
            const explanation = explanations[formula.id]
            const isCopied = copied === formula.id

            return (
              <div
                key={formula.id}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden"
              >
                <div className="flex items-start gap-4 p-5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-slate-900">{formula.name}</h3>
                      {formula.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] bg-slate-100 text-slate-500 px-1.5">{tag}</Badge>
                      ))}
                    </div>

                    {/* LaTeX rendered formula */}
                    <div className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-3 mb-3 overflow-x-auto">
                      <MarkdownPreview content={`$$${formula.latex}$$`} />
                    </div>

                    <p className="text-xs text-slate-500 mb-3">{formula.description}</p>

                    {/* Variables */}
                    {formula.variables.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {formula.variables.map((v) => (
                          <div key={v.symbol} className="flex items-center gap-1.5 rounded-md bg-slate-50 border border-slate-100 px-2 py-1">
                            <span className="font-mono text-xs text-slate-700">
                              <MarkdownPreview content={`$${v.symbol}$`} />
                            </span>
                            <span className="text-[10px] text-slate-400">{v.meaning}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* AI Explanation */}
                    {isExpanded && (
                      <div className="mt-3 rounded-lg bg-blue-50 border border-blue-100 p-4">
                        {isExplaining ? (
                          <div className="flex items-center gap-2 text-xs text-blue-600">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            AI is explaining...
                          </div>
                        ) : explanation ? (
                          <div className="prose prose-sm prose-blue max-w-none text-xs">
                            <MarkdownPreview content={explanation} />
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs border-slate-200 gap-1.5"
                      onClick={() => handleExplain(formula)}
                    >
                      <Sparkles className="h-3 w-3" />
                      {isExpanded && explanation ? "Hide" : "Explain"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs border-slate-200 gap-1.5"
                      onClick={() => handleCreateFlashcard(formula)}
                    >
                      + Card
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs gap-1.5 text-slate-400"
                      onClick={() => handleCopy(formula)}
                    >
                      {isCopied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {displayFormulas.length === 0 && (
          <div className="py-16 text-center">
            <Search className="h-10 w-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No formulas match your search</p>
          </div>
        )}
      </div>
    </div>
  )
}
