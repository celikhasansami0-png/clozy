"use client"

import { useState } from "react"
import { Sparkles, Loader2, Wand2, X, FileSearch, Plus } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { LeadCard } from "@/components/scouting/lead-card"
import { IntentBadge } from "@/components/scouting/intent-badge"
import { DEMO_LEADS, DEMO_ICPS } from "@/lib/scouting/mock-data"
import { INDUSTRIES, FUNDING_STAGES } from "@/lib/scouting/constants"
import { cn, generateId } from "@/lib/utils"
import type { Lead, FundingStage, ResearchBrief } from "@/types/scouting"

interface ICPForm {
  industries: string[]
  employeeMin: number
  employeeMax: number
  fundingStages: FundingStage[]
  jobTitles: string
  keywords: string
}

const INITIAL_ICP: ICPForm = {
  industries: ["SaaS", "DevTools"],
  employeeMin: 30,
  employeeMax: 200,
  fundingStages: ["series_a"],
  jobTitles: "Head of Growth, VP of Sales, Founder",
  keywords: "hiring sales reps, uses Salesforce",
}

export default function ScoutPage() {
  const [describe, setDescribe] = useState("")
  const [icp, setIcp] = useState<ICPForm>(INITIAL_ICP)
  const [parsing, setParsing] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [leads, setLeads] = useState<Lead[]>(DEMO_LEADS)
  const [researchingId, setResearchingId] = useState<string | null>(null)
  const [briefLead, setBriefLead] = useState<Lead | null>(null)
  const [minScore, setMinScore] = useState(0)

  async function handleAiAssist() {
    if (!describe.trim()) {
      toast.error("Describe your ideal customer first")
      return
    }
    setParsing(true)
    try {
      const res = await fetch("/api/scouting/parse-icp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: describe }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const parsed = data.icp
      setIcp({
        industries: parsed.industries ?? icp.industries,
        employeeMin: parsed.employeeMin ?? icp.employeeMin,
        employeeMax: parsed.employeeMax ?? icp.employeeMax,
        fundingStages: parsed.fundingStages ?? icp.fundingStages,
        jobTitles: (parsed.jobTitles ?? []).join(", ") || icp.jobTitles,
        keywords: (parsed.keywords ?? []).join(", ") || icp.keywords,
      })
      toast.success("ICP filled from your description")
    } catch {
      toast.error("Could not parse your ICP")
    } finally {
      setParsing(false)
    }
  }

  async function handleGenerate() {
    setGenerating(true)
    try {
      const res = await fetch("/api/scouting/generate-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          icp: {
            industries: icp.industries,
            fundingStages: icp.fundingStages,
            jobTitles: icp.jobTitles.split(",").map((t) => t.trim()).filter(Boolean),
          },
          count: 8,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const now = new Date().toISOString()
      const generated: Lead[] = (data.leads ?? []).map((l: Record<string, unknown>) => ({
        id: generateId(),
        userId: "demo-user",
        campaignId: null,
        firstName: l.firstName as string,
        lastName: l.lastName as string,
        title: l.title as string,
        company: l.company as string,
        companyDomain: l.companyDomain as string,
        linkedinUrl: `https://linkedin.com/in/${(l.firstName as string).toLowerCase()}`,
        avatarColor: l.avatarColor as string,
        employeeCount: l.employeeCount as number,
        fundingStage: l.fundingStage as FundingStage,
        lastFundingDate: null,
        location: l.location as string,
        techStack: (l.techStack as string[]) ?? [],
        lastActivity: l.lastActivity as string,
        icpScore: l.icpScore as number,
        intentScore: l.intentScore as number,
        engagementScore: l.engagementScore as number,
        totalScore: l.totalScore as number,
        intentSignals: (l.intentSignals as Lead["intentSignals"]) ?? [],
        researchBrief: null,
        stage: "prospected",
        status: "active",
        createdAt: now,
        updatedAt: now,
        lastContactedAt: null,
      }))
      setLeads(generated)
      toast.success(`Generated ${generated.length} qualified leads`)
    } catch {
      toast.error("Could not generate leads")
    } finally {
      setGenerating(false)
    }
  }

  async function handleResearch(lead: Lead) {
    setResearchingId(lead.id)
    try {
      const res = await fetch("/api/scouting/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: lead.firstName,
          lastName: lead.lastName,
          title: lead.title,
          company: lead.company,
          companyDomain: lead.companyDomain,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const brief: ResearchBrief = data.researchBrief
      const updated = { ...lead, researchBrief: brief }
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? updated : l)))
      setBriefLead(updated)
      toast.success(`Research brief ready for ${lead.firstName}`)
    } catch {
      toast.error("Research failed")
    } finally {
      setResearchingId(null)
    }
  }

  function toggle<T>(arr: T[], value: T): T[] {
    return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
  }

  const visibleLeads = [...leads].filter((l) => l.totalScore >= minScore).sort((a, b) => b.totalScore - a.totalScore)

  return (
    <div>
      <PageHeader
        title="Scout"
        description="Define your ideal customer. Scouting finds and qualifies them."
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 max-w-[1200px] items-start">
        {/* ICP Builder */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-5 lg:sticky lg:top-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Wand2 className="h-4 w-4 text-[#2D5F9A]" />
              <h2 className="font-semibold text-[#0F1B35] text-sm">Describe your ICP</h2>
            </div>
            <Textarea
              value={describe}
              onChange={(e) => setDescribe(e.target.value)}
              placeholder="I want to reach VP-level people at Series A SaaS companies in the US that are hiring sales reps."
              className="min-h-[88px] text-sm resize-none"
            />
            <Button
              onClick={handleAiAssist}
              disabled={parsing}
              variant="outline"
              className="w-full mt-2 h-8 text-xs gap-1.5"
            >
              {parsing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              Fill form with AI
            </Button>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Industries */}
          <Field label="Industries">
            <div className="flex flex-wrap gap-1.5">
              {INDUSTRIES.map((ind) => (
                <button
                  key={ind}
                  onClick={() => setIcp({ ...icp, industries: toggle(icp.industries, ind) })}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                    icp.industries.includes(ind)
                      ? "border-[#2D5F9A] bg-[#E8F0FB] text-[#1E3A5F]"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  )}
                >
                  {ind}
                </button>
              ))}
            </div>
          </Field>

          {/* Employee range */}
          <Field label="Company size (employees)">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={icp.employeeMin}
                onChange={(e) => setIcp({ ...icp, employeeMin: Number(e.target.value) })}
                className="h-8 text-sm"
              />
              <span className="text-slate-400 text-sm">–</span>
              <Input
                type="number"
                value={icp.employeeMax}
                onChange={(e) => setIcp({ ...icp, employeeMax: Number(e.target.value) })}
                className="h-8 text-sm"
              />
            </div>
          </Field>

          {/* Funding */}
          <Field label="Funding stage">
            <div className="flex flex-wrap gap-1.5">
              {FUNDING_STAGES.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setIcp({ ...icp, fundingStages: toggle(icp.fundingStages, f.value) })}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                    icp.fundingStages.includes(f.value)
                      ? "border-[#2D5F9A] bg-[#E8F0FB] text-[#1E3A5F]"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Job titles to target">
            <Input
              value={icp.jobTitles}
              onChange={(e) => setIcp({ ...icp, jobTitles: e.target.value })}
              className="h-8 text-sm"
            />
          </Field>

          <Field label="Keywords / signals">
            <Input
              value={icp.keywords}
              onChange={(e) => setIcp({ ...icp, keywords: e.target.value })}
              className="h-8 text-sm"
            />
          </Field>

          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full bg-[#1E3A5F] hover:bg-[#16304f] text-white gap-1.5"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate lead list
          </Button>

          <div className="pt-1">
            <p className="text-[11px] text-slate-400 mb-1.5">Saved ICPs</p>
            <div className="space-y-1">
              {DEMO_ICPS.map((saved) => (
                <div key={saved.id} className="flex items-center gap-2 rounded-md border border-slate-100 px-2.5 py-1.5 text-[11px] text-slate-600">
                  <FileSearch className="h-3 w-3 text-slate-400" />
                  {saved.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lead list */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-[#0F1B35] text-sm">{visibleLeads.length} qualified leads</h2>
              <Badge variant="secondary" className="h-5">sorted by score</Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Min score</span>
              <select
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs"
              >
                <option value={0}>All</option>
                <option value={60}>60+</option>
                <option value={70}>70+</option>
                <option value={80}>80+</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {visibleLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onResearch={handleResearch}
                researching={researchingId === lead.id}
                onSelect={(l) => l.researchBrief && setBriefLead(l)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Research brief drawer */}
      {briefLead?.researchBrief && (
        <ResearchDrawer lead={briefLead} onClose={() => setBriefLead(null)} />
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}

function ResearchDrawer({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const brief = lead.researchBrief!
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-white shadow-xl overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            <FileSearch className="h-4 w-4 text-[#2D5F9A]" />
            <h2 className="font-semibold text-[#0F1B35] text-sm">Research Brief</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 space-y-5">
          <div>
            <p className="font-semibold text-[#0F1B35]">
              {lead.firstName} {lead.lastName}
            </p>
            <p className="text-sm text-slate-500">
              {lead.title} · {lead.company}
            </p>
            {lead.intentSignals.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {lead.intentSignals.map((s, i) => (
                  <IntentBadge key={i} signal={s} />
                ))}
              </div>
            )}
          </div>

          <Section title="Personalization hooks">
            <ul className="space-y-2">
              {brief.hooks.map((h, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-600">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E8F0FB] text-[10px] font-bold text-[#2D5F9A]">
                    {i + 1}
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Company context">
            <p className="text-sm text-slate-600 leading-relaxed">{brief.companyContext}</p>
          </Section>

          <Section title="Personal context">
            <p className="text-sm text-slate-600 leading-relaxed">{brief.personalContext}</p>
          </Section>

          <Section title="Recommended angle">
            <div className="rounded-lg bg-[#E8F0FB] p-3 text-sm text-[#1E3A5F] leading-relaxed">
              {brief.recommendedAngle}
            </div>
          </Section>

          <Section title="Sources">
            <ul className="space-y-1">
              {brief.sources.map((s, i) => (
                <li key={i} className="text-xs text-[#2D5F9A] truncate">
                  {s}
                </li>
              ))}
            </ul>
          </Section>

          <a href="/craft" className="block">
            <Button className="w-full bg-[#1E3A5F] hover:bg-[#16304f] text-white gap-1.5">
              <Plus className="h-4 w-4" />
              Write sequence in Craft
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">{title}</p>
      {children}
    </div>
  )
}
