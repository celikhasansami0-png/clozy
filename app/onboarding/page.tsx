"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Crosshair,
  Link2,
  Mic,
  Radar,
  Rocket,
  Loader2,
  Sparkles,
  Check,
  ArrowRight,
  ArrowLeft,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useVoiceProfile } from "@/hooks/use-voice-profile"
import { useIcps } from "@/hooks/use-icps"
import { useScoutingLeads } from "@/hooks/use-scouting-leads"
import { useCampaigns } from "@/hooks/use-campaigns"
import { cn } from "@/lib/utils"
import type { FundingStage, Lead } from "@/types/scouting"

const STEPS = [
  { id: 1, label: "Connect", icon: Link2 },
  { id: 2, label: "Voice", icon: Mic },
  { id: 3, label: "ICP", icon: Radar },
  { id: 4, label: "Launch", icon: Rocket },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { saveVoice } = useVoiceProfile()
  const { createIcp } = useIcps()
  const { createLeads } = useScoutingLeads()
  const { createCampaign } = useCampaigns()

  const [step, setStep] = useState(1)
  const [linkedinConnected, setLinkedinConnected] = useState(false)
  const [samples, setSamples] = useState("")
  const [describe, setDescribe] = useState("")
  const [busy, setBusy] = useState(false)
  const [icpId, setIcpId] = useState<string | null>(null)
  const [leadDrafts, setLeadDrafts] = useState<Partial<Lead>[]>([])
  const [previewMessages, setPreviewMessages] = useState<string[]>([])

  async function handleVoice() {
    const list = samples.split("\n").map((s) => s.trim()).filter(Boolean)
    if (list.length === 0) {
      setStep(3) // allow skipping
      return
    }
    setBusy(true)
    try {
      const res = await fetch("/api/scouting/learn-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: list }),
      })
      const data = await res.json()
      if (res.ok) {
        await saveVoice({ ...data.voiceProfile, trainingMessages: list })
        toast.success("Voice learned")
      }
    } catch {
      /* non-blocking */
    } finally {
      setBusy(false)
      setStep(3)
    }
  }

  async function handleIcpAndLeads() {
    if (!describe.trim()) {
      toast.error("Describe your ideal customer")
      return
    }
    setBusy(true)
    try {
      // 1. Parse + save ICP
      const icpRes = await fetch("/api/scouting/parse-icp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: describe }),
      })
      const icpData = await icpRes.json()
      if (!icpRes.ok) throw new Error(icpData.error)
      const icp = await createIcp(icpData.icp)
      setIcpId(icp.id)

      // 2. Generate leads
      const leadRes = await fetch("/api/scouting/generate-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ icp: icpData.icp, count: 20 }),
      })
      const leadData = await leadRes.json()
      if (!leadRes.ok) throw new Error(leadData.error)
      const drafts: Partial<Lead>[] = (leadData.leads ?? []).map((l: Record<string, unknown>) => ({
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

      // 3. Preview a sequence for the top lead
      const top = [...drafts].sort((a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0))[0]
      if (top) {
        const seqRes = await fetch("/api/scouting/generate-sequence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: top.firstName,
            company: top.company,
            hook: top.intentSignals?.[0]?.label,
          }),
        })
        const seqData = await seqRes.json()
        if (seqRes.ok) {
          setPreviewMessages((seqData.messages ?? []).slice(0, 3).map((m: { content: string }) => m.content))
        }
      }
      setStep(4)
    } catch {
      toast.error("Something went wrong — try again")
    } finally {
      setBusy(false)
    }
  }

  async function handleLaunch() {
    setBusy(true)
    try {
      const campaign = await createCampaign({
        name: "My first campaign",
        description: "Created during onboarding",
        type: "cold_outreach",
        status: "active",
        icpId,
        totalLeads: leadDrafts.length,
      })
      if (leadDrafts.length > 0) {
        await createLeads(leadDrafts.map((l) => ({ ...l, campaignId: campaign.id })))
      }
      toast.success("You're all set! Welcome to Scouting.")
      router.push("/dashboard")
    } catch {
      toast.error("Could not launch — try again")
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2.5 mb-8">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E3A5F]">
          <Crosshair className="h-4 w-4 text-white" />
        </div>
        <span className="font-semibold text-[#0F1B35] text-[16px]">Scouting</span>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          const done = step > s.id
          const active = step === s.id
          return (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2",
                    done
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : active
                        ? "bg-[#1E3A5F] border-[#1E3A5F] text-white"
                        : "bg-white border-slate-200 text-slate-400"
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className={cn("text-[11px] mt-1.5", active ? "text-[#0F1B35] font-medium" : "text-slate-400")}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && <div className={cn("h-0.5 flex-1 mx-2", done ? "bg-emerald-500" : "bg-slate-200")} />}
            </div>
          )
        })}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        {step === 1 && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F0FB]">
              <Link2 className="h-6 w-6 text-[#2D5F9A]" />
            </div>
            <h1 className="text-xl font-bold text-[#0F1B35] mb-2">Connect your LinkedIn</h1>
            <p className="text-sm text-slate-500 mb-6">
              Scouting prepares every message for you to send safely from your own account — no risky automation.
            </p>
            <Button
              onClick={() => {
                setLinkedinConnected(true)
                toast.success("LinkedIn connected")
                setStep(2)
              }}
              className="w-full bg-[#1E3A5F] hover:bg-[#16304f] text-white gap-2"
            >
              <Link2 className="h-4 w-4" />
              {linkedinConnected ? "Connected" : "Connect LinkedIn"}
            </Button>
            <button onClick={() => setStep(2)} className="block w-full text-xs text-slate-400 mt-3 hover:text-slate-600">
              Skip for now
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-xl font-bold text-[#0F1B35] mb-2">Teach Scouting your voice</h1>
            <p className="text-sm text-slate-500 mb-4">
              Paste 3–5 of your best outreach messages (one per line). Scouting learns your tone and writes like you.
            </p>
            <Textarea
              value={samples}
              onChange={(e) => setSamples(e.target.value)}
              placeholder={"Hey {{name}} — noticed you're hiring AEs…\nQuick one {{name}}: saw your Series A…"}
              className="min-h-[140px] text-sm resize-none"
            />
            <div className="flex items-center justify-between mt-5">
              <Button variant="ghost" onClick={() => setStep(1)} className="gap-1.5 text-slate-500">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button onClick={handleVoice} disabled={busy} className="bg-[#1E3A5F] hover:bg-[#16304f] text-white gap-1.5">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {samples.trim() ? "Learn my voice" : "Skip"}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="text-xl font-bold text-[#0F1B35] mb-2">Who do you want to reach?</h1>
            <p className="text-sm text-slate-500 mb-4">
              Describe your ideal customer in plain English. Scouting builds your ICP and finds 20 leads.
            </p>
            <Textarea
              value={describe}
              onChange={(e) => setDescribe(e.target.value)}
              placeholder="VP-level people at Series A SaaS companies in the US that are hiring sales reps."
              className="min-h-[100px] text-sm resize-none"
            />
            <div className="flex items-center justify-between mt-5">
              <Button variant="ghost" onClick={() => setStep(2)} className="gap-1.5 text-slate-500">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button onClick={handleIcpAndLeads} disabled={busy} className="bg-[#1E3A5F] hover:bg-[#16304f] text-white gap-1.5">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radar className="h-4 w-4" />}
                Find my leads
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 flex items-center gap-2 mb-4">
              <Check className="h-4 w-4 text-emerald-600" />
              <p className="text-sm text-emerald-700">{leadDrafts.length} leads found · sequence drafted in your voice</p>
            </div>
            {previewMessages.length > 0 && (
              <div className="space-y-2 mb-5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Preview — your AI in action</p>
                {previewMessages.map((m, i) => (
                  <div key={i} className="rounded-lg border border-slate-200 p-3 text-xs text-slate-600 leading-relaxed">
                    <span className="text-[10px] font-semibold text-[#2D5F9A]">Step {i + 1}</span>
                    <p className="mt-1">{m}</p>
                  </div>
                ))}
              </div>
            )}
            <Button onClick={handleLaunch} disabled={busy} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
              Launch my first campaign
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
