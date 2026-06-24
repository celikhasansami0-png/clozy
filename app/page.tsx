import Link from "next/link"
import { Network, ArrowRight, Zap, Users, BarChart2, CheckSquare, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <Network className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-slate-900 text-[16px]">LinkedIn Growth OS</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 mb-8">
          <Zap className="h-3.5 w-3.5" />
          AI-Powered LinkedIn Growth Engine
        </div>

        <h1 className="text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
          The Revenue OS for
          <br />
          <span className="text-indigo-600">Service Businesses</span>
        </h1>

        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Replace your spreadsheets, CRM tools, and outreach templates with one
          AI-powered system that generates clients, tracks leads, and measures your growth.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link href="/auth/signup">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 h-12 px-8">
              Start Free Today
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" variant="outline" className="h-12 px-8">
              Sign In
            </Button>
          </Link>
        </div>

        <p className="mt-4 text-sm text-slate-400">No credit card required · 2 growth systems free</p>
      </section>

      {/* Features */}
      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold text-slate-900 mb-4">
            Everything you need to grow on LinkedIn
          </h2>
          <p className="text-center text-slate-500 mb-14 max-w-xl mx-auto">
            One system replaces spreadsheets, CRM tools, outreach templates, and manual strategy.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="rounded-xl border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow">
                  <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${feature.bg}`}>
                    <Icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold text-slate-900 mb-14">
          From zero to first client in 7 days
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <div key={step.title} className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-lg">
                {i + 1}
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-500">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h2>
          <p className="text-slate-500 mb-12">Start free. Upgrade when you are ready to scale.</p>
          <div className="flex flex-col md:flex-row gap-6 max-w-3xl mx-auto">
            <div className="flex-1 rounded-xl border border-slate-200 bg-white p-8 text-left">
              <h3 className="font-semibold text-slate-900 mb-1">Free</h3>
              <div className="text-3xl font-bold text-slate-900 mb-4">$0<span className="text-base font-normal text-slate-500">/mo</span></div>
              <ul className="space-y-2 text-sm text-slate-600 mb-6">
                <li>✓ 2 growth systems/month</li>
                <li>✓ Up to 25 leads</li>
                <li>✓ Basic scripts & templates</li>
                <li>✓ Pipeline tracking</li>
              </ul>
              <Link href="/auth/signup" className="block">
                <Button variant="outline" className="w-full">Get Started Free</Button>
              </Link>
            </div>
            <div className="flex-1 rounded-xl border-2 border-indigo-600 bg-white p-8 text-left relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                  <Crown className="h-3 w-3" /> Most Popular
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Pro</h3>
              <div className="text-3xl font-bold text-slate-900 mb-4">$97<span className="text-base font-normal text-slate-500">/mo</span></div>
              <ul className="space-y-2 text-sm text-slate-600 mb-6">
                <li>✓ Unlimited growth systems</li>
                <li>✓ Unlimited leads</li>
                <li>✓ Full template library</li>
                <li>✓ Advanced AI scripts</li>
                <li>✓ Analytics dashboard</li>
                <li>✓ CSV export</li>
              </ul>
              <Link href="/auth/signup" className="block">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">Start Pro Trial</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-900">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to build your growth system?
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Join service business owners using LinkedIn Growth OS to generate predictable revenue.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 gap-2 h-12 px-8">
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

const FEATURES = [
  {
    title: "AI Growth Generator",
    description: "Input your niche and offer. Get a complete positioning map, outreach system, and content strategy.",
    icon: Zap,
    bg: "bg-indigo-100",
    color: "text-indigo-600",
  },
  {
    title: "Pipeline & CRM",
    description: "Kanban-style lead tracking with stages from first contact to closed deal. Never lose a lead.",
    icon: Users,
    bg: "bg-emerald-100",
    color: "text-emerald-600",
  },
  {
    title: "Analytics Dashboard",
    description: "Track reply rates, conversion rates, pipeline value, and growth velocity in real time.",
    icon: BarChart2,
    bg: "bg-amber-100",
    color: "text-amber-600",
  },
  {
    title: "Execution Plans",
    description: "Convert AI-generated strategies into daily task checklists with time estimates and KPIs.",
    icon: CheckSquare,
    bg: "bg-rose-100",
    color: "text-rose-600",
  },
]

const STEPS = [
  {
    title: "Enter Your Business Details",
    description: "Tell us your niche, service, target client, and revenue goal. Takes 2 minutes.",
  },
  {
    title: "Get Your Growth System",
    description: "AI generates your positioning, outreach scripts, content strategy, and 7-day execution plan.",
  },
  {
    title: "Execute and Track",
    description: "Follow your daily tasks, add leads to your CRM, and measure your pipeline performance.",
  },
]
