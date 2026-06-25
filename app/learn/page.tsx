"use client"

import { useState } from "react"
import {
  Brain,
  Upload,
  Video,
  FileText,
  Sparkles,
  ChevronRight,
  BookOpen,
  Target,
  Layers,
  RotateCcw,
} from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const MATERIAL_TYPES = [
  { id: "pdf", label: "PDF / Document", icon: FileText, description: "Textbooks, papers, notes" },
  { id: "slides", label: "Lecture Slides", icon: Layers, description: "PowerPoint, Keynote, PDF slides" },
  { id: "youtube", label: "YouTube Lecture", icon: Video, description: "Paste a YouTube URL" },
  { id: "handwritten", label: "Handwritten Notes", icon: BookOpen, description: "Photos of your notes" },
]

export default function LearnOSPage() {
  const [activeTab, setActiveTab] = useState("materials")

  return (
    <div>
      <PageHeader
        title="Learn OS"
        description="Transform any academic material into a personalized learning system."
        actions={
          <Button className="bg-slate-900 hover:bg-slate-800 text-white gap-2">
            <Upload className="h-4 w-4" />
            Upload material
          </Button>
        }
      />

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-slate-100 p-1">
            <TabsTrigger value="materials" className="text-sm">Materials</TabsTrigger>
            <TabsTrigger value="flashcards" className="text-sm">Flashcards</TabsTrigger>
            <TabsTrigger value="tutor" className="text-sm">AI Tutor</TabsTrigger>
            <TabsTrigger value="analytics" className="text-sm">Learning Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="materials">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Upload Area */}
              <div className="lg:col-span-2 space-y-6">
                {/* Drop zone */}
                <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-sm">
                    <Upload className="h-6 w-6 text-slate-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">
                    Drop your material here
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    PDF, PPTX, DOCX, images up to 50MB
                  </p>
                  <Button variant="outline" size="sm" className="border-slate-200">
                    Browse files
                  </Button>
                </div>

                {/* Material type picker */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Or choose a source</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {MATERIAL_TYPES.map((type) => {
                      const Icon = type.icon
                      return (
                        <button
                          key={type.id}
                          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-slate-300 hover:shadow-sm transition-all"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                            <Icon className="h-4.5 w-4.5 text-slate-600" />
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

                {/* Empty state for materials list */}
                <Card className="border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-900">
                      Your Materials
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="py-10 text-center">
                      <Brain className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm font-medium text-slate-500 mb-1">No materials yet</p>
                      <p className="text-xs text-slate-400">
                        Upload your first material to start learning
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar info */}
              <div className="space-y-4">
                <Card className="border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-900">
                      What gets generated
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-3">
                      {GENERATION_ITEMS.map((item) => {
                        const Icon = item.icon
                        return (
                          <li key={item.label} className="flex items-start gap-3">
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 shrink-0 mt-0.5">
                              <Icon className="h-3.5 w-3.5 text-slate-600" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-900">{item.label}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-slate-50">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-slate-600" />
                      <span className="text-xs font-semibold text-slate-700">AI Tutor included</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Once processed, ask the AI tutor anything about your material. It adapts to your weak areas and adjusts its explanations accordingly.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="flashcards">
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <RotateCcw className="h-7 w-7 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">Spaced Repetition System</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                Upload learning materials first. The system automatically generates flashcards
                and schedules them using the SM-2 spaced repetition algorithm.
              </p>
              <Button variant="outline" className="border-slate-200 gap-2">
                <Upload className="h-4 w-4" />
                Upload material to generate flashcards
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="tutor">
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <Brain className="h-7 w-7 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">AI Tutor</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                Upload at least one material to activate your personalized AI tutor. It will answer
                questions, explain concepts, and identify your knowledge gaps.
              </p>
              <Button variant="outline" className="border-slate-200 gap-2">
                <Upload className="h-4 w-4" />
                Upload material to activate tutor
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {LEARNING_METRICS.map((m) => (
                <div key={m.label} className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="text-2xl font-bold text-slate-900 mb-0.5">{m.value}</div>
                  <div className="text-xs text-slate-500">{m.label}</div>
                </div>
              ))}
            </div>
            <div className="py-10 text-center rounded-xl border border-slate-200 bg-slate-50">
              <Target className="h-8 w-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">
                Start studying to see your learning analytics here
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

const GENERATION_ITEMS = [
  { label: "Topic extraction", description: "Key concepts automatically identified", icon: Layers },
  { label: "Concept map", description: "Visual knowledge graph of the material", icon: Brain },
  { label: "Flashcard deck", description: "Active recall cards with spaced repetition", icon: RotateCcw },
  { label: "Learning path", description: "Personalized study sequence", icon: Target },
  { label: "Exam readiness score", description: "How prepared you are", icon: Target },
]

const LEARNING_METRICS = [
  { label: "Topic mastery", value: "—" },
  { label: "Retention score", value: "—" },
  { label: "Confidence score", value: "—" },
  { label: "Exam readiness", value: "—" },
]
