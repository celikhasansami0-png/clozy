"use client"

import { useState } from "react"
import {
  Briefcase,
  Plus,
  FileText,
  Code,
  MapPin,
  Star,
  TrendingUp,
  Sparkles,
} from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const CAREER_FEATURES = [
  { label: "Resume generation", description: "AI builds your resume from academic profile", icon: FileText },
  { label: "Portfolio generation", description: "Showcase projects and achievements", icon: Code },
  { label: "Internship tracker", description: "Track applications and interviews", icon: MapPin },
  { label: "Skill mapping", description: "Map your skills to job requirements", icon: Star },
  { label: "Career roadmap", description: "Personalized path to your target role", icon: TrendingUp },
  { label: "Interview preparation", description: "Technical and behavioral prep", icon: Briefcase },
]

export default function CareerOSPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div>
      <PageHeader
        title="Career OS"
        description="Connect your academic work to professional outcomes with AI-powered career tools."
        actions={
          <Button className="bg-slate-900 hover:bg-slate-800 text-white gap-2">
            <Sparkles className="h-4 w-4" />
            Generate resume
          </Button>
        }
      />

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-slate-100 p-1">
            <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
            <TabsTrigger value="resume" className="text-sm">Resume</TabsTrigger>
            <TabsTrigger value="portfolio" className="text-sm">Portfolio</TabsTrigger>
            <TabsTrigger value="applications" className="text-sm">Applications</TabsTrigger>
            <TabsTrigger value="interview" className="text-sm">Interview Prep</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Career profile setup */}
                <Card className="border-slate-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-semibold text-slate-900">
                      Career Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="py-10 text-center">
                      <Briefcase className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm font-medium text-slate-600 mb-1">
                        Set up your career profile
                      </p>
                      <p className="text-xs text-slate-400 mb-5 max-w-xs mx-auto">
                        Tell the system your target role, industry, and current skills.
                        It will map your academic work to career opportunities.
                      </p>
                      <div className="space-y-3 max-w-sm mx-auto">
                        <input
                          type="text"
                          placeholder="Target role (e.g. Software Engineer)"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                        <input
                          type="text"
                          placeholder="Target industry (e.g. Fintech, Robotics)"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                        <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                          Save career profile
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Skill map */}
                <Card className="border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-900">
                      Skill Map
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="py-8 text-center">
                      <Star className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">
                        Set up your career profile to generate your skill map
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-900">
                      Career OS features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-3">
                      {CAREER_FEATURES.map((f) => {
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

          <TabsContent value="resume">
            <div className="py-16 text-center">
              <FileText className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-base font-semibold text-slate-900 mb-2">Resume Generator</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-5">
                Set up your career profile first. The AI will build a complete, ATS-optimized
                resume from your academic projects, assignments, and skills.
              </p>
              <Button
                onClick={() => setActiveTab("overview")}
                variant="outline"
                className="border-slate-200"
              >
                Set up career profile
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="portfolio">
            <div className="py-16 text-center">
              <Code className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-base font-semibold text-slate-900 mb-2">Portfolio Generator</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-5">
                Add projects in Project OS and they will automatically appear here.
                The AI generates project descriptions, highlights outcomes, and formats your portfolio.
              </p>
              <Button variant="outline" className="border-slate-200" onClick={() => window.location.href='/project'}>
                Add projects first
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="applications">
            <div className="py-16 text-center">
              <MapPin className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-base font-semibold text-slate-900 mb-2">Internship & Job Tracker</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-5">
                Track every application from submission to offer.
                The system reminds you of follow-ups and tracks your conversion rates.
              </p>
              <Button variant="outline" className="border-slate-200 gap-2">
                <Plus className="h-4 w-4" />
                Add application
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="interview">
            <div className="py-16 text-center">
              <Briefcase className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-base font-semibold text-slate-900 mb-2">Interview Preparation</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-5">
                Add a target company and role to generate tailored technical and behavioral
                interview practice questions with AI-generated model answers.
              </p>
              <Button variant="outline" className="border-slate-200 gap-2">
                <Sparkles className="h-4 w-4" />
                Start interview prep
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
