import Link from "next/link"
import {
  ArrowRight,
  Crosshair,
  Radar,
  PenLine,
  GitBranch,
  Inbox,
  KanbanSquare,
  ChevronRight,
  Check,
  Search,
  Sparkles,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SCOUTING_PLANS } from "@/lib/scouting/constants"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E3A5F]">
              <Crosshair className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-semibold text-[#0F1B35] text-[16px] tracking-tight">Scouting</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-slate-600">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="bg-[#1E3A5F] hover:bg-[#16304f] text-white">
                Start free trial
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 mb-10">
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          AI-powered LinkedIn outreach for SaaS
        </div>

        <h1 className="text-6xl font-bold text-[#0F1B35] tracking-tight leading-[1.05] mb-6 max-w-4xl mx-auto">
          Your best SDR,
          <br />
          on autopilot.
        </h1>

        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
          Define your ideal customer. Scouting finds them, researches each one in real time,
          writes in your voice, follows up — and stops only when they reply.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link href="/auth/signup">
            <Button
              size="lg"
              className="bg-[#1E3A5F] hover:bg-[#16304f] text-white gap-2 h-12 px-8 text-[15px]"
            >
              Start your 14-day trial
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="h-12 px-8 text-[15px] border-slate-200">
              See the demo
            </Button>
          </Link>
        </div>

        <p className="mt-5 text-sm text-slate-400">
          Full Growth access · No credit card required · First message in under 10 minutes
        </p>

        {/* Pipeline strip */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-5 gap-3 max-w-4xl mx-auto">
          {PIPELINE.map((step, i) => {
            const Icon = step.icon
            return (
              <div
                key={step.label}
                className="rounded-xl border border-slate-200 bg-white p-4 text-left relative"
              >
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F0FB]">
                  <Icon className="h-4 w-4 text-[#2D5F9A]" />
                </div>
                <p className="text-[13px] font-semibold text-[#0F1B35]">{step.label}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{step.sub}</p>
                {i < PIPELINE.length - 1 && (
                  <ChevronRight className="hidden md:block absolute -right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Differentiators */}
      <section className="border-t border-slate-200 bg-slate-50/50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#0F1B35] mb-4">Intelligence, not volume.</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Four things no competitor combines at this price. Valley-level quality at a fraction of the cost.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {DIFFERENTIATORS.map((d) => {
              const Icon = d.icon
              return (
                <div
                  key={d.title}
                  className="rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 hover:shadow-sm transition-all"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F0FB]">
                    <Icon className="h-4.5 w-4.5 text-[#2D5F9A]" />
                  </div>
                  <h3 className="font-semibold text-[#0F1B35] text-sm mb-1">{d.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{d.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Feature sections */}
      <section className="mx-auto max-w-6xl px-6 py-20 space-y-24">
        {FEATURES.map((section, i) => {
          const Icon = section.icon
          return (
            <div
              key={section.title}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${i % 2 === 1 ? "lg:grid-flow-dense" : ""}`}
            >
              <div className={i % 2 === 1 ? "lg:col-start-2" : ""}>
                <div className="inline-flex items-center gap-2 text-xs font-medium text-[#2D5F9A] mb-4">
                  <Icon className="h-3.5 w-3.5" />
                  {section.module}
                </div>
                <h2 className="text-3xl font-bold text-[#0F1B35] mb-4 leading-tight">{section.title}</h2>
                <p className="text-slate-500 leading-relaxed mb-6">{section.description}</p>
                <ul className="space-y-2.5">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className={`rounded-2xl border border-slate-200 bg-gradient-to-br from-[#E8F0FB] to-white h-72 flex items-center justify-center ${i % 2 === 1 ? "lg:col-start-1" : ""}`}
              >
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                    <Icon className="h-6 w-6 text-[#2D5F9A]" />
                  </div>
                  <span className="text-sm font-medium text-slate-400">{section.module}</span>
                </div>
              </div>
            </div>
          )
        })}
      </section>

      {/* Pricing */}
      <section className="border-t border-slate-200 bg-slate-50/50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#0F1B35] mb-4">Simple, flat pricing.</h2>
            <p className="text-slate-500">14-day free trial on Growth. No credit card required.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {SCOUTING_PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-7 text-left ${
                  plan.highlighted
                    ? "bg-[#0F1B35] text-white border border-[#0F1B35]"
                    : "bg-white border border-slate-200"
                }`}
              >
                <div className="mb-5">
                  <h3 className={`font-semibold mb-1 ${plan.highlighted ? "text-white" : "text-[#0F1B35]"}`}>
                    {plan.name}
                  </h3>
                  <div className={`text-3xl font-bold mb-1 ${plan.highlighted ? "text-white" : "text-[#0F1B35]"}`}>
                    ${plan.price}
                    <span className="text-base font-normal ml-1 text-slate-400">/mo</span>
                  </div>
                  <p className={`text-sm ${plan.highlighted ? "text-slate-300" : "text-slate-500"}`}>
                    {plan.description}
                  </p>
                  <p className="text-xs mt-1 text-slate-400">
                    or ${plan.annualPrice}/mo billed annually
                  </p>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className={`text-sm flex items-start gap-2 ${plan.highlighted ? "text-slate-300" : "text-slate-600"}`}
                    >
                      <Check
                        className={`h-4 w-4 mt-0.5 shrink-0 ${plan.highlighted ? "text-emerald-400" : "text-emerald-500"}`}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup" className="block">
                  <Button
                    className={`w-full ${
                      plan.highlighted
                        ? "bg-white text-[#0F1B35] hover:bg-slate-100"
                        : "bg-[#1E3A5F] text-white hover:bg-[#16304f]"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 className="text-4xl font-bold text-[#0F1B35] mb-4 tracking-tight">
          Stop sending. Start scouting.
        </h2>
        <p className="text-slate-500 mb-10 max-w-xl mx-auto text-lg">
          The tool your first SDR hire replaces — and your tenth SDR hire still uses.
        </p>
        <Link href="/auth/signup">
          <Button
            size="lg"
            className="bg-[#1E3A5F] hover:bg-[#16304f] text-white gap-2 h-13 px-10 text-[15px]"
          >
            Start your free trial
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200">
        <div className="mx-auto max-w-6xl px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1E3A5F]">
              <Crosshair className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-600">Scouting</span>
          </div>
          <p className="text-sm text-slate-400">Find them. Write for them. Win them.</p>
        </div>
      </footer>
    </div>
  )
}

const PIPELINE = [
  { label: "Scout", sub: "Find & qualify", icon: Radar },
  { label: "Craft", sub: "Research & write", icon: PenLine },
  { label: "Sequence", sub: "Send & follow up", icon: GitBranch },
  { label: "Inbox", sub: "Reply intel", icon: Inbox },
  { label: "Pipeline", sub: "CRM & reports", icon: KanbanSquare },
]

const DIFFERENTIATORS = [
  {
    title: "Real-time research",
    body: "Every lead is researched live via web search before a single word is written — no stale templates.",
    icon: Search,
  },
  {
    title: "Voice learning",
    body: "Paste a few of your best messages. Scouting learns your tone and writes everything in your voice.",
    icon: Sparkles,
  },
  {
    title: "Intent signals",
    body: "Funding, hiring, growth, and content triggers surface the leads most likely to buy right now.",
    icon: Zap,
  },
  {
    title: "Reply intelligence",
    body: "Every reply is classified and answered with one click — hot leads get booked, not buried.",
    icon: Inbox,
  },
]

const FEATURES = [
  {
    module: "Scout",
    icon: Radar,
    title: "Describe your ICP. Get qualified leads.",
    description:
      "Tell Scouting who you want to reach in plain English. It builds a structured ICP, generates a scored lead list, and continuously watches for buying signals.",
    bullets: [
      "Plain-English ICP builder with AI assist",
      "Composite lead scoring: ICP + intent + engagement",
      "Six intent signals: funding, hiring, growth, content, competitor, tech",
      "Leads with strong signals bubble to the top",
    ],
  },
  {
    module: "Craft",
    icon: PenLine,
    title: "Research, then write — in your voice.",
    description:
      "For each lead, Scouting runs a deep research pass and synthesizes a brief with specific hooks. Then it writes a full 5-step sequence that sounds like you, not a robot.",
    bullets: [
      "Research brief with 3 personalization hooks per lead",
      "Full connection + 4 follow-up sequence",
      "Quality gate rejects spam and generic openers",
      "A/B variants with auto-winner selection",
    ],
  },
  {
    module: "Inbox",
    icon: Inbox,
    title: "Never miss a hot reply again.",
    description:
      "Every reply is classified the moment it arrives. Scouting drafts 2–3 responses so you can move a hot lead to booked in a single click.",
    bullets: [
      "Auto-classification: hot, warm, nurture, not interested",
      "One-click AI response suggestions",
      "Booking link inserted automatically",
      "Out-of-office auto-pause and resume",
    ],
  },
]
