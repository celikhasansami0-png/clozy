"use client"

import { useState } from "react"
import {
  Database, Plus, Search, Link2, Tag, Network, StickyNote, Trash2, Loader2, X,
} from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MarkdownEditor, MarkdownPreview } from "@/components/ui/markdown-editor"
import { useKnowledge } from "@/hooks/use-knowledge"
import { toast } from "sonner"

const KNOWLEDGE_FEATURES = [
  { label: "Knowledge graph", description: "Visual map of all your concepts", icon: Network },
  { label: "Concept linking", description: "Auto-link related ideas across courses", icon: Link2 },
  { label: "Semantic search", description: "Find content by meaning, not keywords", icon: Search },
  { label: "Long-term memory", description: "Survives semesters and course changes", icon: Database },
  { label: "Tag system", description: "Organize notes with smart tagging", icon: Tag },
]

export default function KnowledgeOSPage() {
  const [activeTab, setActiveTab] = useState("notes")
  const [addOpen, setAddOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<import("@/types").KnowledgeNote[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [form, setForm] = useState({ title: "", content: "", tags: "" })

  const { notes, loading, createNote, deleteNote, searchNotes } = useKnowledge()

  const handleCreate = async () => {
    if (!form.title || !form.content) return
    try {
      await createNote({
        title: form.title,
        content: form.content,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        linked_note_ids: [],
        course_id: null,
      })
      toast.success("Note created!")
      setForm({ title: "", content: "", tags: "" })
      setAddOpen(false)
    } catch {
      toast.error("Failed to create note")
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) { setSearchResults(null); return }
    setSearching(true)
    try {
      const results = await searchNotes(searchQuery)
      setSearchResults(results)
    } catch {
      toast.error("Search failed")
    } finally {
      setSearching(false)
    }
  }

  const displayNotes = searchResults ?? notes

  return (
    <div>
      <PageHeader
        title="Knowledge OS"
        description="Your academic second brain. Every concept linked, searchable, and remembered forever."
        actions={
          <Button onClick={() => setAddOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white gap-2">
            <Plus className="h-4 w-4" />
            New note
          </Button>
        }
      />

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-slate-100 p-1">
            <TabsTrigger value="notes" className="text-sm">Notes ({notes.length})</TabsTrigger>
            <TabsTrigger value="graph" className="text-sm">Knowledge Graph</TabsTrigger>
            <TabsTrigger value="search" className="text-sm">Semantic Search</TabsTrigger>
          </TabsList>

          <TabsContent value="notes">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="relative mb-5">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search your knowledge base..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      if (!e.target.value) setSearchResults(null)
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-24 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <Button size="sm" onClick={handleSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900 hover:bg-slate-800 text-white h-7 px-3 text-xs">
                    {searching ? <Loader2 className="h-3 w-3 animate-spin" /> : "Search"}
                  </Button>
                </div>

                {searchResults !== null && (
                  <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
                    <span>{searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for &quot;{searchQuery}&quot;</span>
                    <button onClick={() => { setSearchResults(null); setSearchQuery("") }} className="text-slate-400 hover:text-slate-600">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                <Card className="border-slate-200">
                  <CardContent className="pt-6">
                    {loading ? (
                      <div className="py-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
                    ) : displayNotes.length === 0 ? (
                      <div className="py-14 text-center">
                        <StickyNote className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-sm font-semibold text-slate-700 mb-2">
                          {searchResults !== null ? "No notes match your search" : "Your knowledge base is empty"}
                        </h3>
                        <p className="text-xs text-slate-400 mb-5 max-w-xs mx-auto">
                          {searchResults !== null
                            ? "Try a different search term."
                            : "Notes are auto-generated from your study materials, or create them manually. Every note is linked to related concepts."}
                        </p>
                        {searchResults === null && (
                          <Button onClick={() => setAddOpen(true)} variant="outline" size="sm" className="border-slate-200 gap-2">
                            <Plus className="h-4 w-4" /> Create your first note
                          </Button>
                        )}
                      </div>
                    ) : (
                      <ul className="space-y-2">
                        {displayNotes.map((note) => (
                          <li key={note.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 group">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900">{note.title}</p>
                              <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{note.content?.replace(/[#*_`$]/g, "").slice(0, 120)}</p>
                              {note.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {note.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-[10px] bg-slate-100 text-slate-500 px-1.5">{tag}</Badge>
                                  ))}
                                </div>
                              )}
                              <p className="text-[11px] text-slate-300 mt-1">{new Date(note.updated_at).toLocaleDateString()}</p>
                            </div>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 shrink-0"
                              onClick={() => deleteNote(note.id).then(() => toast.success("Deleted"))}>
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
                    <CardTitle className="text-sm font-semibold text-slate-900">Knowledge OS features</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-3">
                      {KNOWLEDGE_FEATURES.map((f) => {
                        const Icon = f.icon
                        return (
                          <li key={f.label} className="flex items-start gap-3">
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 shrink-0 mt-0.5">
                              <Icon className="h-3.5 w-3.5 text-slate-600" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-900">{f.label}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{f.description}</p>
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

          <TabsContent value="graph">
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <Network className="h-7 w-7 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">Knowledge Graph</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-5">
                {notes.length < 5
                  ? `Your knowledge graph will appear once you have at least 5 notes (${notes.length}/5). Concepts are automatically linked across courses and subjects.`
                  : "Interactive graph visualization coming soon."}
              </p>
              {notes.length < 5 && (
                <Button onClick={() => setActiveTab("notes")} variant="outline" className="border-slate-200">Add notes first</Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="search">
            <div className="max-w-2xl">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ask anything across your entire knowledge base..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-32 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <Button size="sm" onClick={handleSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900 hover:bg-slate-800 text-white">
                  {searching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Search"}
                </Button>
              </div>
              {searchResults !== null && (
                <div className="space-y-2">
                  {searchResults.length === 0 ? (
                    <p className="text-sm text-center text-slate-500 py-8">No results found</p>
                  ) : searchResults.map((note) => (
                    <div key={note.id} className="rounded-lg border border-slate-100 p-4">
                      <p className="text-sm font-medium text-slate-900">{note.title}</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-3">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
              {searchResults === null && (
                <p className="text-xs text-slate-400 text-center">
                  Semantic search finds conceptually related content, even if exact words don&apos;t match. Add notes to your knowledge base to start searching.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Note</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input placeholder="Note title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Content</Label>
              <MarkdownEditor
                value={form.content}
                onChange={(v) => setForm((f) => ({ ...f, content: v }))}
                placeholder="Write your note. Supports Markdown, LaTeX math ($E=mc^2$), and code blocks."
                minHeight="200px"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tags (comma-separated)</Label>
              <Input placeholder="thermodynamics, heat transfer, entropy" value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} className="bg-slate-900 hover:bg-slate-800 text-white" disabled={!form.title || !form.content}>
              Create Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
