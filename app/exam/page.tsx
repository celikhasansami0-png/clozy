"use client"

import { useState } from "react"
import {
  ClipboardCheck,
  Upload,
  Timer,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Plus,
  Zap,
  BarChart2,
  FileQuestion,
} from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ExamOSPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div>
      <PageHeader
        title="Exam OS"
        description="Maximize exam performance through pattern analysis, mock exams, and readiness scoring."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-slate-200 gap-2">
              <Upload className="h-4 w-4" />
              Upload past exam
            </Button>
            <Button className="bg-slate-900 hover:bg-slate-800 text-white gap-2">
              <Plus className="h-4 w-4" />
              Generate mock exam
            </Button>
          </div>
        }
      />

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-slate-100 p-1">
            <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
            <TabsTrigger value="mock" className="text-sm">Mock Exams</TabsTrigger>
            <TabsTrigger value="patterns" className="text-sm">Patterns</TabsTrigger>
            <TabsTrigger value="readiness" className="text-sm">Readiness</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Readiness Dashboard */}
                <Card className="border-slate-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-semibold text-slate-900">
                      Exam Readiness Dashboard
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      {READINESS_METRICS.map((m) => (
                        <div key={m.label} className="rounded-lg bg-slate-50 border border-slate-100 p-4">
                          <div className="text-xl font-bold text-slate-900 mb-0.5">{m.value}</div>
                          <div className="text-[11px] text-slate-500">{m.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
                      <ClipboardCheck className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-medium text-slate-600 mb-1">
                        No exams added yet
                      </p>
                      <p className="text-xs text-slate-400 mb-4">
                        Upload past exam papers to enable pattern analysis and readiness scoring
                      </p>
                      <Button variant="outline" size="sm" className="border-slate-200 gap-2">
                        <Upload className="h-3.5 w-3.5" />
                        Upload past exam
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Exam list */}
                <Card className="border-slate-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold text-slate-900">
                        Your Exams
                      </CardTitle>
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500">
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add exam
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="py-8 text-center">
                      <FileQuestion className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">No exams yet</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Features panel */}
              <div className="space-y-4">
                <Card className="border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-900">
                      What Exam OS does
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-3">
                      {EXAM_FEATURES.map((f) => {
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

                <Card className="border-slate-200 bg-slate-50">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-slate-600" />
                      <span className="text-xs font-semibold text-slate-700">Exam prediction</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Upload 3+ past exams from the same professor and the system will predict likely questions for your upcoming exam.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="mock">
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <Timer className="h-7 w-7 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">Mock Exam Generator</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                Generate timed, adaptive, oral, or practical mock exams from your materials.
                Each exam adapts to your current readiness level.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" className="border-slate-200 gap-2">
                  <Upload className="h-4 w-4" />
                  Upload material first
                </Button>
                <Button className="bg-slate-900 hover:bg-slate-800 text-white gap-2" disabled>
                  <Zap className="h-4 w-4" />
                  Generate exam
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="patterns">
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <BarChart2 className="h-7 w-7 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">Pattern Analysis</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                Upload past exam papers to unlock pattern extraction, question clustering,
                difficulty analysis, and professor behavior analysis.
              </p>
              <Button variant="outline" className="border-slate-200 gap-2">
                <Upload className="h-4 w-4" />
                Upload past exams
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="readiness">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {READINESS_DETAIL.map((item) => {
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
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
              <TrendingUp className="h-8 w-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">
                Add exams and study materials to see your readiness scores
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

const READINESS_METRICS = [
  { label: "Predicted score", value: "—" },
  { label: "Pass probability", value: "—" },
  { label: "Fail probability", value: "—" },
  { label: "Confidence interval", value: "—" },
  { label: "Risk factors", value: "—" },
  { label: "Days until exam", value: "—" },
]

const EXAM_FEATURES = [
  { label: "Pattern extraction", description: "Identify recurring question types", icon: BarChart2 },
  { label: "Difficulty analysis", description: "Map question difficulty distribution", icon: TrendingUp },
  { label: "Exam prediction", description: "Predict likely questions", icon: Zap },
  { label: "Mock exam generation", description: "Timed, adaptive, oral, practical", icon: Timer },
  { label: "Formula memorization", description: "Smart formula recall system", icon: CheckCircle },
  { label: "Risk assessment", description: "Identify your weakest areas", icon: AlertTriangle },
]

const READINESS_DETAIL = [
  { label: "Predicted Score", value: "—", description: "Based on mock exam performance", icon: TrendingUp },
  { label: "Pass Probability", value: "—", description: "Likelihood of passing", icon: CheckCircle },
  { label: "Risk Factors", value: "—", description: "Areas requiring attention", icon: AlertTriangle },
]
