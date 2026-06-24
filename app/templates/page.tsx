"use client"

import { useState } from "react"
import { Copy, Check, Search, Filter } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NICHE_LIST } from "@/lib/niches"
import type { Template, TemplateType, NicheId } from "@/types"
import { toast } from "sonner"
import { useSubscription } from "@/hooks/use-subscription"
import Link from "next/link"
import { Crown } from "lucide-react"

const TEMPLATE_TYPES: { id: TemplateType | "all"; label: string }[] = [
  { id: "all", label: "All Types" },
  { id: "connection_request", label: "Connection Requests" },
  { id: "outreach_message", label: "Outreach Messages" },
  { id: "follow_up", label: "Follow-ups" },
  { id: "content_post", label: "Content Posts" },
  { id: "closing_script", label: "Closing Scripts" },
  { id: "objection_handler", label: "Objection Handlers" },
]

function TemplateCard({ template }: { template: Template }) {
  const [copied, setCopied] = useState(false)
  const { isPro } = useSubscription()

  const isLocked = !isPro && !template.is_system

  const handleCopy = async () => {
    if (isLocked) {
      toast.error("Upgrade to Pro to access all templates")
      return
    }
    await navigator.clipboard.writeText(template.content)
    setCopied(true)
    toast.success("Copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  const typeColors: Record<TemplateType, string> = {
    connection_request: "info",
    outreach_message: "purple",
    follow_up: "warning",
    content_post: "success",
    closing_script: "secondary",
    objection_handler: "danger",
  }

  return (
    <Card className={isLocked ? "opacity-75" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Badge variant={typeColors[template.type] as "secondary"} className="text-[10px]">
                {TEMPLATE_TYPES.find((t) => t.id === template.type)?.label ?? template.type}
              </Badge>
              {template.niche !== "all" && (
                <Badge variant="outline" className="text-[10px]">
                  {NICHE_LIST.find((n) => n.id === template.niche)?.label ?? template.niche}
                </Badge>
              )}
              {isLocked && (
                <Badge variant="warning" className="text-[10px] gap-1">
                  <Crown className="h-2.5 w-2.5" /> Pro
                </Badge>
              )}
            </div>
            <CardTitle className="text-sm">{template.title}</CardTitle>
            {template.description && (
              <CardDescription className="text-xs mt-0.5">{template.description}</CardDescription>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="shrink-0 h-7 text-xs gap-1"
          >
            {copied ? (
              <><Check className="h-3 w-3 text-emerald-500" /> Copied</>
            ) : (
              <><Copy className="h-3 w-3" /> Copy</>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className={`rounded-md bg-slate-50 border border-slate-200 p-3 relative ${isLocked ? "overflow-hidden" : ""}`}>
          <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
            {template.content.slice(0, 200)}{template.content.length > 200 ? "..." : ""}
          </p>
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-md">
              <Link href="/billing">
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 h-8 text-xs">
                  <Crown className="h-3 w-3" /> Upgrade to Access
                </Button>
              </Link>
            </div>
          )}
        </div>

        {template.variables.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {template.variables.map((v) => (
              <span key={v} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-500">
                {`{{${v}}}`}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function TemplatesPage() {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<TemplateType | "all">("all")
  const [nicheFilter, setNicheFilter] = useState<NicheId | "all">("all")

  const filtered = SYSTEM_TEMPLATES.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.content.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === "all" || t.type === typeFilter
    const matchesNiche = nicheFilter === "all" || t.niche === "all" || t.niche === nicheFilter
    return matchesSearch && matchesType && matchesNiche
  })

  return (
    <div>
      <PageHeader
        title="Template Library"
        description="Proven outreach scripts, follow-ups, and content templates."
      />

      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search templates..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TemplateType | "all")}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TEMPLATE_TYPES.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={nicheFilter} onValueChange={(v) => setNicheFilter(v as NicheId | "all")}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All Niches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Niches</SelectItem>
              {NICHE_LIST.map((n) => (
                <SelectItem key={n.id} value={n.id}>{n.icon} {n.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-slate-400">{filtered.length} templates</span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center">
              <p className="text-sm text-slate-400">No templates found matching your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// System templates library
const SYSTEM_TEMPLATES: Template[] = [
  {
    id: "t1",
    user_id: null,
    title: "Universal Connection Request",
    description: "High-converting connection request for any niche",
    type: "connection_request",
    niche: "all",
    content: `Hi {{name}},

I help {{niche}} owners like you generate consistent high-ticket clients using LinkedIn. Your work at {{company}} caught my attention.

Would love to connect and share what's been working. No pitch, just value.

{{your_name}}`,
    variables: ["name", "niche", "company", "your_name"],
    is_system: true,
    is_public: true,
    usage_count: 0,
    tags: ["connection", "first-touch"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "t2",
    user_id: null,
    title: "Pain-Point Opener",
    description: "Opens with a specific pain point to trigger engagement",
    type: "outreach_message",
    niche: "all",
    content: `Hey {{name}},

Quick question — is {{pain_point}} something you're actively working to solve right now, or is it on the back burner?

Asking because I've been helping {{niche}} owners solve exactly this, and thought you might find what we're doing interesting.

Either way, would love your take on it.

{{your_name}}`,
    variables: ["name", "pain_point", "niche", "your_name"],
    is_system: true,
    is_public: true,
    usage_count: 0,
    tags: ["opener", "pain-point"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "t3",
    user_id: null,
    title: "Case Study Follow-Up",
    description: "Second touch that leads with a relevant result",
    type: "follow_up",
    niche: "all",
    content: `Hi {{name}},

Following up on my last message.

I thought you might find this interesting — we recently helped a {{niche}} owner go from {{before_state}} to {{after_state}} in {{timeframe}}.

The method was simple, and I think there's a similar opportunity for {{company}}.

Would it make sense to jump on a 15-min call to explore?

{{your_name}}`,
    variables: ["name", "niche", "before_state", "after_state", "timeframe", "company", "your_name"],
    is_system: true,
    is_public: true,
    usage_count: 0,
    tags: ["follow-up", "case-study"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "t4",
    user_id: null,
    title: "Last-Touch Break-Up",
    description: "Final follow-up that creates urgency and closes the loop",
    type: "follow_up",
    niche: "all",
    content: `{{name}},

I know your inbox is busy, so I'll make this my last reach out.

I'm opening up {{spots}} spots for {{niche}} businesses in my next cohort starting {{date}}. The goal is to help you {{specific_outcome}}.

If this is ever a priority, feel free to reach out. I'll be here.

{{your_name}}`,
    variables: ["name", "spots", "niche", "date", "specific_outcome", "your_name"],
    is_system: true,
    is_public: true,
    usage_count: 0,
    tags: ["follow-up", "break-up", "urgency"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "t5",
    user_id: null,
    title: "Authority Post Hook #1",
    description: "Story-based hook that drives engagement",
    type: "content_post",
    niche: "all",
    content: `I helped a {{niche}} owner 3x their revenue in 90 days.

Here's the exact framework we used:

1/ First, we fixed their positioning.

Most {{niche}} owners say what they DO. We rewrote their message to say what their clients BECOME.

Before: "I provide {{service}}"
After: "I help {{target_client}} achieve {{transformation}}"

2/ Then we systemized their outreach.

Instead of random DMs, we built a 5-step sequence:
→ Personalized connection request
→ Value-led opener (no pitch)
→ Case study follow-up
→ Soft CTA
→ Break-up message

3/ Finally, we tracked everything.

Connections sent → Accepted → Replied → Calls → Closed.

Within 60 days, they had a system that generated 3-4 qualified calls per week on autopilot.

The lesson? Most business owners have a SYSTEMS problem, not a skills problem.

What's the biggest gap in your current client acquisition process? Drop it below 👇`,
    variables: ["niche", "service", "target_client", "transformation"],
    is_system: true,
    is_public: true,
    usage_count: 0,
    tags: ["content", "authority", "story"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "t6",
    user_id: null,
    title: "Closing Discovery Script",
    description: "Full discovery call framework for closing high-ticket",
    type: "closing_script",
    niche: "all",
    content: `DISCOVERY CALL SCRIPT

[OPENING - First 5 minutes]
"Thanks for jumping on. Before I dive into anything, I want to understand your situation better. This call is about figuring out if there's actually a fit — no pressure either way. Sound good?"

[DIG INTO THE PROBLEM - 15 minutes]
1. "Walk me through what your current lead generation looks like day-to-day."
2. "What's been your biggest challenge with LinkedIn specifically?"
3. "What have you tried before, and what happened?"
4. "If we could solve [their answer], what would that mean for your business in 90 days?"
5. "On a scale of 1-10, how important is fixing this right now?"

[PRESENT THE SOLUTION - 10 minutes]
"Based on everything you've shared, here's what I'm seeing...
[Mirror their pain back]
What I'd recommend is [SOLUTION]. Here's how it works in 3 steps:
Step 1: [First step]
Step 2: [Second step]
Step 3: [Third step]
We've gotten this result with [CASE STUDY]. I think we can do the same for you."

[HANDLE INVESTMENT - 5 minutes]
"The investment for this is $[PRICE]. What questions do you have?"

[CLOSE]
"Based on everything you've shared, it sounds like [SOLUTION] is exactly what you need. The next step would be [ONBOARDING]. Are you ready to move forward today?"`,
    variables: ["SOLUTION", "CASE_STUDY", "PRICE"],
    is_system: true,
    is_public: true,
    usage_count: 0,
    tags: ["closing", "discovery", "sales-call"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "t7",
    user_id: null,
    title: "Price Objection Handler",
    description: "Handle 'too expensive' without discounting",
    type: "objection_handler",
    niche: "all",
    content: `OBJECTION: "It's too expensive" / "I need to think about the price"

RESPONSE:
"I completely understand. Can I ask you something? If money wasn't a factor, would this be an easy yes for you?"

[If yes]: "Then the only thing standing between you and [RESULT] is the investment. Let me ask you this — if we could help you generate [OUTCOME] within 90 days, what would that be worth to you?"

[Frame the ROI]: "You're investing $[PRICE]. If we can bring in even [X] new clients at your price point of $[CLIENT_PRICE], that's $[REVENUE] in new revenue. The math makes sense, doesn't it?"

[Offer a payment plan if appropriate]: "I do have a payment plan option — [PLAN TERMS]. Would that help make this work for you right now?"

[If they still resist]: "I hear you. What would need to change for the timing to be right to move forward?"`,
    variables: ["RESULT", "OUTCOME", "PRICE", "CLIENT_PRICE", "REVENUE", "PLAN_TERMS"],
    is_system: true,
    is_public: true,
    usage_count: 0,
    tags: ["objection", "price", "sales"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "t8",
    user_id: null,
    title: "Med Spa LinkedIn Outreach",
    description: "Specialized outreach for medical spa owners",
    type: "outreach_message",
    niche: "med_spa",
    content: `Hi {{name}},

I noticed you're running a med spa in {{location}} — the before/after results you're getting for your clients are impressive.

Quick question: are you currently happy with your client acquisition system, or is getting consistent new bookings through the door something you're actively working on?

I help medical spa owners add 10-20 new consultation bookings per month using LinkedIn — without paid ads or aggressive sales tactics.

Would love to hear what's working for you and share a few ideas. Worth a quick chat?

{{your_name}}`,
    variables: ["name", "location", "your_name"],
    is_system: true,
    is_public: true,
    usage_count: 0,
    tags: ["med-spa", "outreach", "niche"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "t9",
    user_id: null,
    title: "SaaS Founder Outreach",
    description: "Targeted outreach for B2B SaaS founders",
    type: "outreach_message",
    niche: "saas_founders",
    content: `Hey {{name}},

Saw that {{company}} just {{trigger_event}} — congrats on the traction.

I work specifically with B2B SaaS founders in the {{ARR}} ARR range who are trying to build a repeatable outbound motion without hiring a full SDR team.

One thing I've noticed: most founders in your stage are great at product, but the go-to-market motion is still founder-dependent. Is that something you're working on right now?

I've helped companies like {{similar_company}} build a LinkedIn outbound system that generates {{outcome}} qualified pipeline per month.

Would a 20-min call make sense this week?

{{your_name}}`,
    variables: ["name", "company", "trigger_event", "ARR", "similar_company", "outcome", "your_name"],
    is_system: false,
    is_public: true,
    usage_count: 0,
    tags: ["saas", "founders", "outbound"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "t10",
    user_id: null,
    title: "Contrarian Hook: Stop Doing X",
    description: "High-engagement contrarian content hook",
    type: "content_post",
    niche: "all",
    content: `Stop doing cold outreach the way you were taught.

The old playbook:
✗ Generic connection request
✗ Immediate pitch in message 1
✗ "Just checking in" follow-ups
✗ Copy-paste templates everyone can spot

The new playbook that actually works:

✓ Personalized connection note (1-2 sentences max)
✓ Opener that asks a question about THEIR situation
✓ Follow-up with a specific relevant case study
✓ Value message that gives before asking
✓ Soft CTA with a clear next step

The difference?

Old playbook = treating people as transactions.
New playbook = treating people as humans.

I've tested both. The new playbook generates 3-5x the replies.

Which approach are you currently using?`,
    variables: [],
    is_system: true,
    is_public: true,
    usage_count: 0,
    tags: ["content", "contrarian", "outreach"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "t11",
    user_id: null,
    title: "Real Estate Agent Outreach",
    description: "LinkedIn DM for real estate professionals",
    type: "outreach_message",
    niche: "real_estate",
    content: `Hi {{name}},

I help real estate agents in {{market}} generate 5-10 qualified buyer/seller leads per month using LinkedIn — without cold calling or door-knocking.

I noticed you specialize in {{specialty}}. With the market shifting the way it is, I'm curious — how are you currently generating new listings and buyer leads?

I ask because most agents I talk to rely almost entirely on referrals and are nervous about what happens when that dries up.

Would you be open to a quick 15-minute conversation about what's working for top producers in your market right now?

{{your_name}}`,
    variables: ["name", "market", "specialty", "your_name"],
    is_system: false,
    is_public: true,
    usage_count: 0,
    tags: ["real-estate", "outreach"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "t12",
    user_id: null,
    title: "Value-First DM (No Pitch)",
    description: "Build rapport before asking for anything",
    type: "outreach_message",
    niche: "all",
    content: `Hey {{name}},

I put together a {{resource_type}} specifically for {{niche}} owners about {{topic}}. Given your background at {{company}}, I thought you'd find it useful.

No strings attached — want me to send it over?

{{your_name}}`,
    variables: ["name", "resource_type", "niche", "topic", "company", "your_name"],
    is_system: true,
    is_public: true,
    usage_count: 0,
    tags: ["value-first", "no-pitch", "outreach"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]
