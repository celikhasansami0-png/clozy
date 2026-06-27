"use client"

import { useState } from "react"
import {
  Sparkles,
  Loader2,
  Mic,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Wand2,
} from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { DEFAULT_SEQUENCE } from "@/lib/scouting/constants"
import { DEMO_VOICE_PROFILE } from "@/lib/scouting/mock-data"
import { useVoiceProfile } from "@/hooks/use-voice-profile"
import { useScoutingLeads } from "@/hooks/use-scouting-leads"
import { runQualityGate } from "@/lib/scouting/quality"
import { cn } from "@/lib/utils"
import type { MessageQuality } from "@/types/scouting"

interface DraftMessage {
  sequenceStep: number
  type: string
  content: string
  personalizationHooks: string[]
  confidence: number
  quality: MessageQuality
}

export default function CraftPage() {
  const { voice: savedVoice, saveVoice } = useVoiceProfile()
  const { leads } = useScoutingLeads()
  const voice = savedVoice ?? DEMO_VOICE_PROFILE
  const [retrainOpen, setRetrainOpen] = useState(false)
  const [samples, setSamples] = useState("")
  const [training, setTraining] = useState(false)

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [messages, setMessages] = useState<DraftMessage[]>([])
  const [generating, setGenerating] = useState(false)

  const selectedLead = leads.find((l) => l.id === selectedLeadId) ?? leads[0]

  async function handleRetrain() {
    const list = samples.split("\n").map((s) => s.trim()).filter(Boolean)
    if (list.length === 0) {
      toast.error("Paste at least one message")
      return
    }
    setTraining(true)
    try {
      const res = await fetch("/api/scouting/learn-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: list }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const v = data.voiceProfile
      await saveVoice({
        formalityLevel: v.formalityLevel ?? voice.formalityLevel,
        avgMessageLength: v.avgMessageLength ?? voice.avgMessageLength,
        openingStyle: v.openingStyle ?? voice.openingStyle,
        usesHumor: v.usesHumor ?? voice.usesHumor,
        characteristicPhrases: v.characteristicPhrases ?? voice.characteristicPhrases,
        phrasesToAvoid: v.phrasesToAvoid ?? voice.phrasesToAvoid,
        signOffStyle: v.signOffStyle ?? voice.signOffStyle,
        trainingMessages: list,
      })
      setRetrainOpen(false)
      setSamples("")
      toast.success(`Voice profile updated to v${voice.version + 1}`)
    } catch {
      toast.error("Could not analyze your voice")
    } finally {
      setTraining(false)
    }
  }

  async function handleGenerate() {
    if (!selectedLead) {
      toast.error("Generate some leads in Scout first")
      return
    }
    setGenerating(true)
    try {
      const res = await fetch("/api/scouting/generate-sequence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: selectedLead.firstName,
          company: selectedLead.company,
          hook: selectedLead.researchBrief?.hooks[0] ?? selectedLead.intentSignals[0]?.label,
          voiceProfile: voice,
          researchBrief: selectedLead.researchBrief,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMessages(data.messages)
      toast.success("Sequence generated")
    } catch {
      toast.error("Could not generate sequence")
    } finally {
      setGenerating(false)
    }
  }

  function updateMessage(step: number, content: string) {
    setMessages((prev) =>
      prev.map((m) =>
        m.sequenceStep === step ? { ...m, content, quality: runQualityGate(content) } : m
      )
    )
  }

  return (
    <div>
      <PageHeader
        title="Craft"
        description="Research-backed sequences, written in your voice."
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 max-w-[1200px] items-start">
        {/* Voice profile */}
        <div className="space-y-4 lg:sticky lg:top-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-[#2D5F9A]" />
                <h2 className="font-semibold text-[#0F1B35] text-sm">Voice Profile</h2>
              </div>
              <Badge variant="secondary" className="h-5">v{voice.version}</Badge>
            </div>

            <div className="space-y-3">
              <VoiceRow label="Formality">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className={cn("h-1.5 w-5 rounded-full", n <= voice.formalityLevel ? "bg-[#2D5F9A]" : "bg-slate-200")}
                    />
                  ))}
                </div>
              </VoiceRow>
              <VoiceRow label="Opening style">
                <span className="text-sm text-slate-700 capitalize">{voice.openingStyle}</span>
              </VoiceRow>
              <VoiceRow label="Avg length">
                <span className="text-sm text-slate-700">{voice.avgMessageLength} chars</span>
              </VoiceRow>
              <VoiceRow label="Humor">
                <span className="text-sm text-slate-700">{voice.usesHumor ? "Yes" : "No"}</span>
              </VoiceRow>
              <VoiceRow label="Sign-off">
                <span className="text-sm text-slate-700">{voice.signOffStyle}</span>
              </VoiceRow>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Signature phrases</p>
              <div className="flex flex-wrap gap-1.5">
                {voice.characteristicPhrases.map((p) => (
                  <span key={p} className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] text-emerald-700">
                    {p}
                  </span>
                ))}
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5 mt-3">Avoid</p>
              <div className="flex flex-wrap gap-1.5">
                {voice.phrasesToAvoid.map((p) => (
                  <span key={p} className="rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-[11px] text-red-600 line-through">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full mt-4 h-8 text-xs gap-1.5"
              onClick={() => setRetrainOpen(!retrainOpen)}
            >
              <Wand2 className="h-3.5 w-3.5" />
              Re-train voice
            </Button>

            {retrainOpen && (
              <div className="mt-3">
                <Textarea
                  value={samples}
                  onChange={(e) => setSamples(e.target.value)}
                  placeholder="Paste 3–5 of your best messages, one per line…"
                  className="min-h-[100px] text-xs resize-none"
                />
                <Button
                  onClick={handleRetrain}
                  disabled={training}
                  className="w-full mt-2 h-8 text-xs bg-[#1E3A5F] hover:bg-[#16304f] text-white gap-1.5"
                >
                  {training ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  Analyze & update
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Generator */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <div className="flex-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
                  Lead
                </label>
                <select
                  value={selectedLead?.id ?? ""}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.firstName} {l.lastName} — {l.title}, {l.company} ({l.totalScore})
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={handleGenerate}
                disabled={generating || !selectedLead}
                className="bg-[#1E3A5F] hover:bg-[#16304f] text-white gap-1.5"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate sequence
              </Button>
            </div>
            {selectedLead?.researchBrief ? (
              <p className="text-[11px] text-emerald-600 mt-2 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Research brief available — messages will use {selectedLead.firstName}&apos;s top hook
              </p>
            ) : (
              <p className="text-[11px] text-amber-600 mt-2 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> No research brief yet — run Research in Scout for sharper personalization
              </p>
            )}
          </div>

          {messages.length === 0 && !generating && (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <Sparkles className="h-7 w-7 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">
                Generate a 5-step sequence — connection request + 4 follow-ups, written in your voice.
              </p>
            </div>
          )}

          {messages.map((m) => {
            const stepMeta = DEFAULT_SEQUENCE.find((s) => s.step === m.sequenceStep)
            return (
              <MessageCard
                key={m.sequenceStep}
                message={m}
                label={stepMeta?.label ?? `Step ${m.sequenceStep}`}
                delay={stepMeta?.delayDays ?? 0}
                condition={stepMeta?.condition ?? ""}
                onChange={(content) => updateMessage(m.sequenceStep, content)}
                onRegenerate={handleGenerate}
                regenerating={generating}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

function VoiceRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-500">{label}</span>
      {children}
    </div>
  )
}

const QUALITY_META = {
  approve: { icon: CheckCircle2, label: "Approved", cls: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  warn: { icon: AlertTriangle, label: "Warning", cls: "text-amber-600 bg-amber-50 border-amber-200" },
  reject: { icon: XCircle, label: "Rejected", cls: "text-red-600 bg-red-50 border-red-200" },
}

function MessageCard({
  message,
  label,
  delay,
  condition,
  onChange,
  onRegenerate,
  regenerating,
}: {
  message: DraftMessage
  label: string
  delay: number
  condition: string
  onChange: (content: string) => void
  onRegenerate: () => void
  regenerating: boolean
}) {
  const q = QUALITY_META[message.quality.verdict]
  const QIcon = q.icon
  const isConnection = message.type === "connection_request"
  const overLimit = isConnection && message.content.length > 300

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1E3A5F] text-white text-[11px] font-bold">
            {message.sequenceStep}
          </span>
          <div>
            <p className="text-sm font-semibold text-[#0F1B35]">{label}</p>
            <p className="text-[11px] text-slate-400">
              {delay === 0 ? "On launch" : `+${delay} days`} · {condition}
            </p>
          </div>
        </div>
        <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium", q.cls)}>
          <QIcon className="h-3 w-3" />
          {q.label}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px]">
        <div className="p-5 lg:border-r border-slate-100">
          <Textarea
            value={message.content}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[96px] text-sm resize-none border-slate-200"
          />
          <div className="flex items-center justify-between mt-2">
            <span className={cn("text-[11px]", overLimit ? "text-red-600 font-medium" : "text-slate-400")}>
              {message.content.length} chars{isConnection ? " / 300 limit" : ""}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[11px] text-slate-500 gap-1"
              onClick={onRegenerate}
              disabled={regenerating}
            >
              {regenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
              Regenerate
            </Button>
          </div>
        </div>

        <div className="p-5 space-y-3 bg-slate-50/30">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Confidence</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full bg-[#2D5F9A]" style={{ width: `${message.confidence}%` }} />
              </div>
              <span className="text-xs font-semibold text-[#0F1B35]">{message.confidence}</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Hooks used</p>
            <div className="flex flex-wrap gap-1">
              {message.personalizationHooks.map((h, i) => (
                <span key={i} className="rounded-full bg-[#E8F0FB] px-2 py-0.5 text-[10px] text-[#1E3A5F]">
                  {h}
                </span>
              ))}
            </div>
          </div>
          {message.quality.reasons.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Quality gate</p>
              <ul className="space-y-0.5">
                {message.quality.reasons.map((r, i) => (
                  <li key={i} className="text-[11px] text-slate-500 leading-snug">• {r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
