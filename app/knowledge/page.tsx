"use client"

import { useState } from "react"
import {
  Database,
  Plus,
  Search,
  Link2,
  Tag,
  Network,
  StickyNote,
} from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function KnowledgeOSPage() {
  const [activeTab, setActiveTab] = useState("notes")

  return (
    <div>
      <PageHeader
        title="Knowledge OS"
        description="Your academic second brain. Every concept linked, searchable, and remembered forever."
        actions={
          <Button className="bg-slate-900 hover:bg-slate-800 text-white gap-2">
            <Plus className="h-4 w-4" />
            New note
          </Button>
        }
      />

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-slate-100 p-1">
            <TabsTrigger value="notes" className="text-sm">Notes</TabsTrigger>
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
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <Card className="border-slate-200">
                  <CardContent className="pt-6">
                    <div className="py-14 text-center">
                      <StickyNote className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                      <h3 className="text-sm font-semibold text-slate-700 mb-2">
                        Your knowledge base is empty
                      </h3>
                      <p className="text-xs text-slate-400 mb-5 max-w-xs mx-auto">
                        Notes are auto-generated from your study materials, or create
                        them manually. Every note is linked to related concepts.
                      </p>
                      <Button variant="outline" size="sm" className="border-slate-200 gap-2">
                        <Plus className="h-4 w-4" />
                        Create your first note
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-900">
                      Knowledge OS features
                    </CardTitle>
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
                Your knowledge graph will appear here once you have at least 5 notes.
                Concepts are automatically linked across courses and subjects.
              </p>
              <Button
                onClick={() => setActiveTab("notes")}
                variant="outline"
                className="border-slate-200"
              >
                Add notes first
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="search">
            <div className="max-w-2xl">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ask anything across your entire knowledge base..."
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-32 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <Button
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900 hover:bg-slate-800 text-white"
                >
                  Search
                </Button>
              </div>
              <p className="text-xs text-slate-400 text-center">
                Semantic search finds conceptually related content, even if exact words don&apos;t match.
                Add notes to your knowledge base to start searching.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

const KNOWLEDGE_FEATURES = [
  { label: "Knowledge graph", description: "Visual map of all your concepts", icon: Network },
  { label: "Concept linking", description: "Auto-link related ideas across courses", icon: Link2 },
  { label: "Semantic search", description: "Find content by meaning, not keywords", icon: Search },
  { label: "Long-term memory", description: "Survives semesters and course changes", icon: Database },
  { label: "Tag system", description: "Organize notes with smart tagging", icon: Tag },
]
