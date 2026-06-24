"use client"

import { useState } from "react"
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { GrowthOutput } from "@/types"
import { getNicheLabel } from "@/lib/niches"
import { toast } from "sonner"

interface ReportViewerProps {
  output: GrowthOutput
  onConvertToTasks?: () => void
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}

function ScriptBlock({ label, content }: { label: string; content: string }) {
  const [expanded, setExpanded] = useState(false)
  const preview = content.slice(0, 120)
  const shouldTruncate = content.length > 120

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</span>
        <CopyButton text={content} />
      </div>
      <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
        {shouldTruncate && !expanded ? `${preview}...` : content}
      </p>
      {shouldTruncate && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
        >
          {expanded ? (
            <><ChevronUp className="h-3 w-3" /> Show less</>
          ) : (
            <><ChevronDown className="h-3 w-3" /> Show full script</>
          )}
        </button>
      )}
    </div>
  )
}

export function ReportViewer({ output, onConvertToTasks }: ReportViewerProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="info">{getNicheLabel(output.input.niche)}</Badge>
            <Badge variant="success">Active</Badge>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">
            {output.input.service}
          </h2>
          <p className="text-sm text-slate-500">
            Target: {output.input.target_client} · Offer: ${output.input.offer_price.toLocaleString()} · Goal: ${output.input.revenue_goal.toLocaleString()}/mo
          </p>
        </div>
        {onConvertToTasks && (
          <Button
            onClick={onConvertToTasks}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 gap-2"
          >
            Convert to Tasks
          </Button>
        )}
      </div>

      <Tabs defaultValue="positioning" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full h-10">
          <TabsTrigger value="positioning">Positioning</TabsTrigger>
          <TabsTrigger value="outreach">Outreach</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="closing">Closing</TabsTrigger>
          <TabsTrigger value="execution">Execution</TabsTrigger>
        </TabsList>

        {/* POSITIONING */}
        <TabsContent value="positioning">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Unique Value Proposition</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-4">
                  <p className="text-base font-medium text-indigo-900 leading-relaxed">
                    &ldquo;{output.positioning.unique_value_proposition}&rdquo;
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Target Audience</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700">{output.positioning.target_audience}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Transformation Statement</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700">{output.positioning.transformation_statement}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Key Differentiators</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {output.positioning.differentiation.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="h-5 w-5 shrink-0 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">
                          {i + 1}
                        </span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Authority Signals</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {output.positioning.authority_signals.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="text-emerald-500 shrink-0">✓</span>
                        {a}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* OUTREACH */}
        <TabsContent value="outreach">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ScriptBlock label="Connection Request" content={output.outreach_system.connection_request} />
              <ScriptBlock label="Initial Message" content={output.outreach_system.initial_message} />
              <ScriptBlock label="Follow-Up #1 (Day 3)" content={output.outreach_system.follow_up_1} />
              <ScriptBlock label="Follow-Up #2 (Day 7)" content={output.outreach_system.follow_up_2} />
              <ScriptBlock label="Value Message" content={output.outreach_system.value_message} />
              <ScriptBlock label="Call to Action" content={output.outreach_system.call_to_action} />
            </div>

            <Separator />

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Objection Handlers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(output.outreach_system.objection_handlers).map(([objection, response]) => (
                  <div key={objection} className="rounded-lg border border-slate-200 p-3">
                    <p className="text-xs font-semibold text-red-600 mb-1.5">
                      &ldquo;{objection}&rdquo;
                    </p>
                    <div className="flex items-start gap-2">
                      <p className="flex-1 text-sm text-slate-700">{response}</p>
                      <CopyButton text={response} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* CONTENT */}
        <TabsContent value="content">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Content Pillars</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {output.content_strategy.content_pillars.map((p, i) => (
                      <div key={i} className="rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                        {p}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Post Formats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {output.content_strategy.post_formats.map((f, i) => (
                      <div key={i} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {f}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Hook Templates</CardTitle>
                  <span className="text-xs text-slate-400">{output.content_strategy.posting_frequency}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {output.content_strategy.sample_hooks.map((hook, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg bg-slate-50 border border-slate-200 p-3">
                    <span className="text-xs font-bold text-slate-400 shrink-0 mt-0.5">#{i + 1}</span>
                    <p className="flex-1 text-sm text-slate-700">{hook}</p>
                    <CopyButton text={hook} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Hashtag Strategy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {output.content_strategy.hashtag_strategy.map((h, i) => (
                    <div key={i} className="rounded-md bg-slate-100 px-2 py-1 text-xs font-mono text-slate-600">
                      {h}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* CLOSING */}
        <TabsContent value="closing">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Discovery Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {output.closing_framework.discovery_questions.map((q, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="h-5 w-5 shrink-0 rounded-full bg-slate-100 text-xs font-bold text-slate-600 flex items-center justify-center">
                        {i + 1}
                      </span>
                      <div className="flex flex-1 items-start gap-2">
                        <p className="flex-1 text-sm text-slate-700">{q}</p>
                        <CopyButton text={q} />
                      </div>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Presentation Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2.5">
                  {output.closing_framework.presentation_flow.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="h-6 w-6 shrink-0 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <p className="text-sm text-slate-700 mt-0.5">{step}</p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Closing Statement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-2 rounded-lg bg-emerald-50 border border-emerald-100 p-3">
                    <p className="flex-1 text-sm text-emerald-800 font-medium">{output.closing_framework.closing_statement}</p>
                    <CopyButton text={output.closing_framework.closing_statement} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Follow-Up Sequence</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {output.closing_framework.follow_up_sequence.map((s, i) => (
                      <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="text-indigo-500 shrink-0">→</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* EXECUTION */}
        <TabsContent value="execution">
          <div className="space-y-3">
            {output.execution_plan.map((day) => (
              <Card key={day.day}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-sm">
                      D{day.day}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-slate-900">{day.focus}</h4>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400">{day.time_estimate}</span>
                          <Badge variant="secondary" className="text-[10px]">{day.kpi}</Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {day.tasks.map((task, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0" />
                            {task}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
