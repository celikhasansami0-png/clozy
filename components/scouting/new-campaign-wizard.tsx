"use client"

import { useState } from "react"
import { X, Loader2, Sparkles, Check, ArrowRight, ArrowLeft, Rocket } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useIcps } from "@/hooks/use-icps"
import { useCampaigns } from "@/hooks/use-campaigns"
import { useScoutingLeads } from "@/hooks/use-scouting-leads"
import { cn } from "@/lib/utils"
import type { Campaign, FundingStage, Lead } from "@/types/scouting"

interface Props {
  onClose: () => void
  onCreated?: (campaign: Campaign) => void
}

const TYPES: { value: Campaign["type"]; label: string }[] = [
  { value: "cold_outreach", label: "Cold Outreach" },
  { value: "warm_outreach", label: "Warm Outreach" },
  { value: "event_based", label: "Event-Based" },
  { value: "re_engagement", label: "Re-engagement" },
]

export function NewCampaignWizard({ onClose, onCreated }: Props) {
  const { icps, createIcp } = useIcps()
  const { createCampaign } = useCampaigns()
  const { createLeads } = useScoutingLeads()

  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [type, setType] = useState<Campaign["type"]>("cold_outreach")
  const [icpId, setIcpId] = useState<string>(icps[0]?.id ?? "")
  const [describe, setDescribe] = useState("")
  const [parsing, setParsing] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [leadDrafts, setLeadDrafts] = useState<Partial<Lead>[]>([])
  const [dailyConnections, setDailyConnections] = useState(20)
  const [dailyMessages, setDailyMessages] = useState(50)
  const [launching, setLaunching] = useState(false)

  const selectedIcp = icps.find((i) => i.id === icpId)

  async function handleCreateIcpFromText() {
    if (!describe.trim()) return
    setParsing(true)
    try {
      const res = await fetch("/api/scouting/parse-icp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: describe }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const created = await createIcp(data.icp)
      setIcpId(created.id)
      toast.success("ICP created")
    } catch {
      toast.error("Could not create ICP")
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
            industries: selectedIcp?.industries ?? [],
            fundingStages: selectedIcp?.fundingStages ?? [],
            jobTitles: selectedIcp?.jobTitles ?? [],
          },
          count: 10,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const drafts: Partial<Lead>[] = (data.leads ?? []).map((l: Record<string, unknown>) => ({
        firstName: l.firstName as string,
        lastName: l.lastName as string,
        title: l.title as string,
        company: l.company as string,
        companyDomain: l.companyDomain as string,
        linkedinUrl: `https://linkedin.com/in/${(l.firstName as string).toLowerCase()}`,
        avatarColor: l.avatarColor as string,
        employeeCount: l.employeeCount as number,
        fundingStage: l.fundingStage as FundingStage,
        location: l.location as string,
        techStack: (l.techStack as string[]) ?? [],
        lastActivity: l.lastActivity as string,
        icpScore: l.icpScore as number,
        intentScore: l.intentScore as number,
        engagementScore: l.engagementScore as number,
        totalScore: l.totalScore as number,
        intentSignals: (l.intentSignals as Lead["intentSignals"]) ?? [],
        stage: "prospected",
        status: "active",
      }))
      setLeadDrafts(drafts)
      setStep(3)
    } catch {
      toast.error("Could not generate leads")
    } finally {
      setGenerating(false)
    }
  }

  async function handleLaunch() {
    if (!name.trim()) {
      toast.error("Name your campaign")
      setStep(1)
      return
    }
    setLaunching(true)
    try {
      const campaign = await createCampaign({
        name,
        description: selectedIcp ? `Targeting ${selectedIcp.name}` : "",
        type,
        status: "active",
        icpId: icpId || null,
        dailyConnectionLimit: dailyConnections,
        dailyMessageLimit: dailyMessages,
        totalLeads: leadDrafts.length,
      })
      if (leadDrafts.length > 0) {
        await createLeads(leadDrafts.map((l) => ({ ...l, campaignId: campaign.id })))
      }
      toast.success(`Launched "${name}" with ${leadDrafts.length} leads`)
      onCreated?.(campaign)
      onClose()
    } catch {
      toast.error("Could not launch campaign")
    } finally {
      setLaunching(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="font-semibold text-[#0F1B35]">New campaign</h2>
            <p className="text-xs text-slate-400">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex gap-1 px-6 pt-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className={cn("h-1 flex-1 rounded-full", s <= step ? "bg-[#1E3A5F]" : "bg-slate-200")} />
          ))}
        </div>

        <div className="p-6 space-y-4 min-h-[260px]">
          {step === 1 && (
            <>
              <Field label="Campaign name">
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Series A DevTools Q3" className="h-9" />
              </Field>
              <Field label="Type">
                <div className="grid grid-cols-2 gap-2">
                  {TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setType(t.value)}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-xs font-medium text-left transition-colors",
                        type === t.value ? "border-[#2D5F9A] bg-[#E8F0FB] text-[#1E3A5F]" : "border-slate-200 text-slate-500"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <Field label="Target ICP">
                {icps.length > 0 && (
                  <select
                    value={icpId}
                    onChange={(e) => setIcpId(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    {icps.map((i) => (
                      <option key={i.id} value={i.id}>{i.name}</option>
                    ))}
                  </select>
                )}
              </Field>
              <div className="rounded-lg border border-dashed border-slate-200 p-3">
                <p className="text-[11px] text-slate-400 mb-1.5">Or describe a new ICP</p>
                <Textarea
                  value={describe}
                  onChange={(e) => setDescribe(e.target.value)}
                  placeholder="VP Sales at Series A fintech in the US hiring AEs…"
                  className="min-h-[60px] text-xs resize-none"
                />
                <Button onClick={handleCreateIcpFromText} disabled={parsing} variant="outline" className="w-full mt-2 h-8 text-xs gap-1.5">
                  {parsing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  Create ICP with AI
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" />
                <p className="text-sm text-emerald-700">{leadDrafts.length} qualified leads ready</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Daily connections">
                  <Input type="number" value={dailyConnections} onChange={(e) => setDailyConnections(Number(e.target.value))} className="h-9" />
                </Field>
                <Field label="Daily messages">
                  <Input type="number" value={dailyMessages} onChange={(e) => setDailyMessages(Number(e.target.value))} className="h-9" />
                </Field>
              </div>
              <p className="text-[11px] text-slate-400">
                Safe limits enforced: 3-min gaps, ±30% variance, weekend pause.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
          {step > 1 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)} className="gap-1.5 text-slate-500">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          ) : (
            <span />
          )}
          {step === 1 && (
            <Button onClick={() => setStep(2)} disabled={!name.trim()} className="bg-[#1E3A5F] hover:bg-[#16304f] text-white gap-1.5">
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          {step === 2 && (
            <Button onClick={handleGenerate} disabled={generating || !icpId} className="bg-[#1E3A5F] hover:bg-[#16304f] text-white gap-1.5">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate leads
            </Button>
          )}
          {step === 3 && (
            <Button onClick={handleLaunch} disabled={launching} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
              {launching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
              Launch campaign
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
