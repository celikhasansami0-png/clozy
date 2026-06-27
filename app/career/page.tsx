"use client"

import { useState, useEffect } from "react"
import {
  Briefcase, Plus, FileText, Code, MapPin, Star, TrendingUp, Sparkles, Loader2, X,
} from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCareer } from "@/hooks/use-career"
import { toast } from "sonner"

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
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [resumeContent, setResumeContent] = useState<string | null>(null)
  const [targetRole, setTargetRole] = useState("")
  const [targetIndustry, setTargetIndustry] = useState("")
  const [skillInput, setSkillInput] = useState("")
  const [skills, setSkills] = useState<string[]>([])

  const { profile, loading, saveProfile } = useCareer()

  useEffect(() => {
    if (profile) {
      setTargetRole(profile.target_role ?? "")
      setTargetIndustry(profile.target_industry ?? "")
      setSkills(profile.skills ?? [])
    }
  }, [profile])

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await saveProfile({
        target_role: targetRole || null,
        target_industry: targetIndustry || null,
        skills,
        internship_experiences: profile?.internship_experiences ?? [],
        projects_portfolio: profile?.projects_portfolio ?? [],
      })
      toast.success("Career profile saved!")
    } catch {
      toast.error("Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  const handleGenerateResume = async () => {
    if (!profile && !targetRole) {
      toast.error("Save your career profile first")
      return
    }
    setGenerating(true)
    try {
      const res = await fetch("/api/ai/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_role: targetRole || profile?.target_role,
          target_industry: targetIndustry || profile?.target_industry,
          skills: skills.length > 0 ? skills : profile?.skills,
        }),
      })
      const { content } = await res.json()
      setResumeContent(content)
      setActiveTab("resume")
      toast.success("Resume generated!")
    } catch {
      toast.error("Failed to generate resume")
    } finally {
      setGenerating(false)
    }
  }

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !skills.includes(s)) setSkills((prev) => [...prev, s])
    setSkillInput("")
  }

  const removeSkill = (skill: string) => setSkills((prev) => prev.filter((s) => s !== skill))

  const profileIsSet = !!(profile?.target_role || targetRole)

  return (
    <div>
      <PageHeader
        title="Career OS"
        description="Connect your academic work to professional outcomes with AI-powered career tools."
        actions={
          <Button onClick={handleGenerateResume} className="bg-slate-900 hover:bg-slate-800 text-white gap-2" disabled={generating}>
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
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
                <Card className="border-slate-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-semibold text-slate-900">Career Profile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="py-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
                    ) : (
                      <div className="space-y-4 max-w-sm">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Target role</Label>
                          <Input placeholder="e.g. Software Engineer" value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Target industry</Label>
                          <Input placeholder="e.g. Fintech, Robotics" value={targetIndustry}
                            onChange={(e) => setTargetIndustry(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Skills</Label>
                          <div className="flex gap-2">
                            <Input placeholder="Add a skill" value={skillInput}
                              onChange={(e) => setSkillInput(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && addSkill()} />
                            <Button type="button" variant="outline" size="sm" onClick={addSkill} className="shrink-0">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          {skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {skills.map((s) => (
                                <Badge key={s} variant="secondary" className="text-xs bg-slate-100 text-slate-700 gap-1 pr-1">
                                  {s}
                                  <button onClick={() => removeSkill(s)} className="hover:text-red-500">
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button onClick={handleSaveProfile} className="w-full bg-slate-900 hover:bg-slate-800 text-white" disabled={saving}>
                          {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : "Save career profile"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-900">Skill Map</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {skills.length === 0 ? (
                      <div className="py-8 text-center">
                        <Star className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                        <p className="text-sm text-slate-500">Add skills to your career profile to generate your skill map</p>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <div key={skill} className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                            <Star className="h-3 w-3 text-amber-400" />
                            <span className="text-xs font-medium text-slate-700">{skill}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-900">Career OS features</CardTitle>
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
            {resumeContent ? (
              <div className="max-w-3xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-900">Generated Resume</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(resumeContent); toast.success("Copied!") }}>
                      Copy
                    </Button>
                    <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white" onClick={handleGenerateResume} disabled={generating}>
                      {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Regenerate"}
                    </Button>
                  </div>
                </div>
                <Card className="border-slate-200">
                  <CardContent className="pt-6">
                    <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed">{resumeContent}</pre>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="py-16 text-center">
                <FileText className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-base font-semibold text-slate-900 mb-2">Resume Generator</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mb-5">
                  {profileIsSet
                    ? "Generate a complete, ATS-optimized resume from your career profile and academic achievements."
                    : "Set up your career profile first. The AI will build a complete, ATS-optimized resume from your academic projects, assignments, and skills."}
                </p>
                {profileIsSet ? (
                  <Button onClick={handleGenerateResume} className="bg-slate-900 hover:bg-slate-800 text-white gap-2" disabled={generating}>
                    {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate resume</>}
                  </Button>
                ) : (
                  <Button onClick={() => setActiveTab("overview")} variant="outline" className="border-slate-200">Set up career profile</Button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="portfolio">
            <div className="py-16 text-center">
              <Code className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-base font-semibold text-slate-900 mb-2">Portfolio Generator</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-5">
                Add projects in Project OS and they will automatically appear here. The AI generates project descriptions, highlights outcomes, and formats your portfolio.
              </p>
              <Button variant="outline" className="border-slate-200" onClick={() => { window.location.href = "/project" }}>
                Add projects first
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="applications">
            <div className="py-16 text-center">
              <MapPin className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-base font-semibold text-slate-900 mb-2">Internship &amp; Job Tracker</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-5">
                Track every application from submission to offer. The system reminds you of follow-ups and tracks your conversion rates.
              </p>
              <Button variant="outline" className="border-slate-200 gap-2" onClick={() => toast.info("Application tracker coming soon")}>
                <Plus className="h-4 w-4" /> Add application
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="interview">
            <div className="py-16 text-center">
              <Briefcase className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-base font-semibold text-slate-900 mb-2">Interview Preparation</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-5">
                Add a target company and role to generate tailored technical and behavioral interview practice questions with AI-generated model answers.
              </p>
              <Button variant="outline" className="border-slate-200 gap-2" onClick={() => toast.info("Interview prep coming soon")}>
                <Sparkles className="h-4 w-4" /> Start interview prep
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
