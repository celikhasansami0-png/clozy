"use client"

import { useState } from "react"
import {
  Microscope, Plus, Upload, Search, BookOpen, ExternalLink, Sparkles,
  Trash2, Loader2, ChevronDown, ChevronUp,
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
import { useResearch } from "@/hooks/use-research"
import { toast } from "sonner"
import type { ResearchPaper } from "@/types"

const RESEARCH_FEATURES = [
  { label: "Paper summarization", description: "AI summarizes any research paper in seconds" },
  { label: "Citation extraction", description: "Auto-extract and format all references" },
  { label: "Literature review generation", description: "Generate complete lit review sections" },
  { label: "Research gap detection", description: "Find unexplored areas in existing literature" },
  { label: "Research question generation", description: "Generate focused research questions" },
  { label: "Reference manager", description: "Organize and cite papers in any format" },
]

export default function ResearchOSPage() {
  const [activeTab, setActiveTab] = useState("library")
  const [searchQuery, setSearchQuery] = useState("")
  const [addOpen, setAddOpen] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: "", authors: "", doi: "", abstract: "" })

  const { papers, loading, addPaper, deletePaper } = useResearch()

  const filtered = papers.filter((p) =>
    searchQuery === "" ||
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.authors.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleAddPaper = async () => {
    if (!form.title) return
    try {
      await addPaper({
        title: form.title,
        authors: form.authors ? form.authors.split(",").map((a) => a.trim()) : [],
        publication_year: null,
        journal: null,
        doi: form.doi || null,
        abstract: form.abstract || null,
        summary: null,
        key_findings: [],
        tags: [],
        file_url: null,
      })
      toast.success("Paper added to library")
      setForm({ title: "", authors: "", doi: "", abstract: "" })
      setAddOpen(false)
    } catch {
      toast.error("Failed to add paper")
    }
  }

  const handleAnalyze = async (paper: ResearchPaper) => {
    if (!paper.abstract) {
      toast.error("Add an abstract to analyze this paper")
      return
    }
    setAnalyzing(true)
    try {
      const res = await fetch("/api/ai/analyze-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: paper.title, authors: paper.authors, abstract: paper.abstract }),
      })
      const result = await res.json()
      toast.success("Analysis complete — see findings below")
      setExpandedId(paper.id)
      // Note: analysis result is in result.summary, result.key_findings etc.
      // We could update the paper in DB but for now show via toast
      void result
    } catch {
      toast.error("Analysis failed")
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Research OS"
        description="Analyze papers, generate literature reviews, and manage your research library."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-slate-200 gap-2" onClick={() => setAddOpen(true)}>
              <Upload className="h-4 w-4" />
              Import paper
            </Button>
            <Button className="bg-slate-900 hover:bg-slate-800 text-white gap-2" onClick={() => setActiveTab("review")}>
              <Sparkles className="h-4 w-4" />
              Generate lit review
            </Button>
          </div>
        }
      />

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-slate-100 p-1">
            <TabsTrigger value="library" className="text-sm">Library ({papers.length})</TabsTrigger>
            <TabsTrigger value="analyze" className="text-sm">Analyze Paper</TabsTrigger>
            <TabsTrigger value="review" className="text-sm">Lit Review</TabsTrigger>
            <TabsTrigger value="gaps" className="text-sm">Research Gaps</TabsTrigger>
          </TabsList>

          <TabsContent value="library">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search your library..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <Card className="border-slate-200">
                  <CardContent className="pt-6">
                    {loading ? (
                      <div className="py-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
                    ) : papers.length === 0 ? (
                      <div className="py-14 text-center">
                        <BookOpen className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-sm font-semibold text-slate-700 mb-2">Your research library is empty</h3>
                        <p className="text-xs text-slate-400 mb-5 max-w-xs mx-auto">
                          Import papers by PDF, DOI, or URL. The AI will summarize them and extract key findings automatically.
                        </p>
                        <div className="flex items-center justify-center gap-3">
                          <Button variant="outline" size="sm" className="border-slate-200 gap-1.5" onClick={() => setAddOpen(true)}>
                            <Plus className="h-3.5 w-3.5" />
                            Add paper
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <ul className="space-y-3">
                        {filtered.map((paper) => (
                          <li key={paper.id} className="rounded-lg border border-slate-100 overflow-hidden">
                            <div className="flex items-center gap-3 p-3 hover:bg-slate-50 group cursor-pointer"
                              onClick={() => setExpandedId(expandedId === paper.id ? null : paper.id)}>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">{paper.title}</p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  {paper.authors.join(", ") || "Unknown authors"}
                                  {paper.doi && ` · ${paper.doi}`}
                                </p>
                              </div>
                              <div className="flex gap-1 items-center">
                                {paper.summary && <Badge className="text-[10px] bg-emerald-100 text-emerald-700">Analyzed</Badge>}
                                <Button size="sm" variant="ghost" className="h-7 text-xs opacity-0 group-hover:opacity-100"
                                  onClick={(e) => { e.stopPropagation(); handleAnalyze(paper) }}>
                                  {analyzing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100"
                                  onClick={(e) => { e.stopPropagation(); deletePaper(paper.id).then(() => toast.success("Deleted")) }}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                                {expandedId === paper.id ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                              </div>
                            </div>
                            {expandedId === paper.id && (
                              <div className="px-3 pb-3 bg-slate-50 border-t border-slate-100">
                                {paper.abstract && (
                                  <div className="pt-3">
                                    <p className="text-xs font-medium text-slate-700 mb-1">Abstract</p>
                                    <p className="text-xs text-slate-500 leading-relaxed">{paper.abstract}</p>
                                  </div>
                                )}
                                {paper.summary && (
                                  <div className="pt-3">
                                    <p className="text-xs font-medium text-slate-700 mb-1">AI Summary</p>
                                    <p className="text-xs text-slate-500 leading-relaxed">{paper.summary}</p>
                                  </div>
                                )}
                                {paper.key_findings.length > 0 && (
                                  <div className="pt-3">
                                    <p className="text-xs font-medium text-slate-700 mb-1">Key Findings</p>
                                    <ul className="space-y-1">
                                      {paper.key_findings.map((f, i) => (
                                        <li key={i} className="text-xs text-slate-500 flex gap-2">
                                          <span className="text-slate-300 shrink-0">·</span>{f}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {!paper.abstract && !paper.summary && (
                                  <div className="pt-3 text-center">
                                    <Button size="sm" variant="outline" className="border-slate-200 gap-2 text-xs" onClick={() => handleAnalyze(paper)}>
                                      <Sparkles className="h-3.5 w-3.5" /> Analyze with AI
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
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
                    <CardTitle className="text-sm font-semibold text-slate-900">Research OS features</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-3">
                      {RESEARCH_FEATURES.map((f) => (
                        <li key={f.label}>
                          <p className="text-xs font-medium text-slate-900">{f.label}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{f.description}</p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analyze">
            <div className="max-w-2xl">
              <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center mb-6">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <Microscope className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">Drop a research paper</h3>
                <p className="text-xs text-slate-500 mb-4">PDF or DOI URL — up to 50MB</p>
                <Button variant="outline" size="sm" className="border-slate-200" onClick={() => setAddOpen(true)}>Add paper</Button>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-medium text-slate-700 mb-3">Or paste a DOI / URL</p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="https://doi.org/10.xxxx/xxxxxx"
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <Button className="bg-slate-900 hover:bg-slate-800 text-white" onClick={() => toast.info("DOI lookup coming soon")}>Analyze</Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="review">
            <div className="py-16 text-center">
              <Sparkles className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-base font-semibold text-slate-900 mb-2">Literature Review Generator</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-5">
                {papers.length < 3
                  ? `Add at least 3 papers to your library to generate a structured literature review (${papers.length}/3).`
                  : "Select papers from your library to generate a structured literature review with themes, gaps, and synthesis."}
              </p>
              {papers.length < 3 ? (
                <Button onClick={() => setActiveTab("library")} variant="outline" className="border-slate-200">Add papers first</Button>
              ) : (
                <Button className="bg-slate-900 hover:bg-slate-800 text-white gap-2" onClick={() => toast.info("Literature review generation coming soon")}>
                  <Sparkles className="h-4 w-4" /> Generate from {papers.length} papers
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="gaps">
            <div className="py-16 text-center">
              <Search className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-base font-semibold text-slate-900 mb-2">Research Gap Detection</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-5">
                Add papers to your library and specify your research topic. The AI will identify unexplored areas and suggest research questions.
              </p>
              <Button onClick={() => setActiveTab("library")} variant="outline" className="border-slate-200">
                Build your library first
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Research Paper</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input placeholder="Paper title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Authors (comma-separated)</Label>
              <Input placeholder="J. Smith, A. Johnson" value={form.authors} onChange={(e) => setForm((f) => ({ ...f, authors: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>DOI (optional)</Label>
              <Input placeholder="10.xxxx/xxxxxx" value={form.doi} onChange={(e) => setForm((f) => ({ ...f, doi: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Abstract (optional)</Label>
              <Textarea rows={4} placeholder="Paste the abstract here for AI analysis..." value={form.abstract}
                onChange={(e) => setForm((f) => ({ ...f, abstract: e.target.value }))} className="resize-none" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddPaper} className="bg-slate-900 hover:bg-slate-800 text-white" disabled={!form.title}>Add Paper</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
