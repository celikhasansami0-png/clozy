"use client"

import { useState } from "react"
import {
  Microscope,
  Plus,
  Upload,
  Search,
  BookOpen,
  ExternalLink,
  Sparkles,
} from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

  return (
    <div>
      <PageHeader
        title="Research OS"
        description="Analyze papers, generate literature reviews, and manage your research library."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-slate-200 gap-2">
              <Upload className="h-4 w-4" />
              Import paper
            </Button>
            <Button className="bg-slate-900 hover:bg-slate-800 text-white gap-2">
              <Sparkles className="h-4 w-4" />
              Generate lit review
            </Button>
          </div>
        }
      />

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-slate-100 p-1">
            <TabsTrigger value="library" className="text-sm">Library</TabsTrigger>
            <TabsTrigger value="analyze" className="text-sm">Analyze Paper</TabsTrigger>
            <TabsTrigger value="review" className="text-sm">Lit Review</TabsTrigger>
            <TabsTrigger value="gaps" className="text-sm">Research Gaps</TabsTrigger>
          </TabsList>

          <TabsContent value="library">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {/* Search bar */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search your library..."
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                {/* Empty state */}
                <Card className="border-slate-200">
                  <CardContent className="pt-6">
                    <div className="py-14 text-center">
                      <BookOpen className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                      <h3 className="text-sm font-semibold text-slate-700 mb-2">
                        Your research library is empty
                      </h3>
                      <p className="text-xs text-slate-400 mb-5 max-w-xs mx-auto">
                        Import papers by PDF, DOI, or URL. The AI will summarize them
                        and extract key findings automatically.
                      </p>
                      <div className="flex items-center justify-center gap-3">
                        <Button variant="outline" size="sm" className="border-slate-200 gap-1.5">
                          <Upload className="h-3.5 w-3.5" />
                          Upload PDF
                        </Button>
                        <Button variant="outline" size="sm" className="border-slate-200 gap-1.5">
                          <ExternalLink className="h-3.5 w-3.5" />
                          Import by DOI
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-900">
                      Research OS features
                    </CardTitle>
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
                <Button variant="outline" size="sm" className="border-slate-200">Browse files</Button>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-medium text-slate-700 mb-3">Or paste a DOI / URL</p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="https://doi.org/10.xxxx/xxxxxx"
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <Button className="bg-slate-900 hover:bg-slate-800 text-white">Analyze</Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="review">
            <div className="py-16 text-center">
              <Sparkles className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-base font-semibold text-slate-900 mb-2">Literature Review Generator</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-5">
                Add at least 3 papers to your library to generate a structured literature review
                with themes, gaps, and synthesis.
              </p>
              <Button
                onClick={() => setActiveTab("library")}
                variant="outline"
                className="border-slate-200"
              >
                Add papers first
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="gaps">
            <div className="py-16 text-center">
              <Search className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-base font-semibold text-slate-900 mb-2">Research Gap Detection</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-5">
                Add papers to your library and specify your research topic.
                The AI will identify unexplored areas and suggest research questions.
              </p>
              <Button
                onClick={() => setActiveTab("library")}
                variant="outline"
                className="border-slate-200"
              >
                Build your library first
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
