# Scouting

**AI-powered LinkedIn B2B outreach for SaaS teams.**

> Define your ideal customer. Scouting finds them, researches each one in real time,
> writes in your voice, follows up — and stops only when they reply.

Built on Next.js 16, Supabase, Tailwind, and the Anthropic API.

## The five modules

Scouting maps to the stages of an outbound pipeline:

| Module | Route | What it does |
| --- | --- | --- |
| **Scout** | `/scout` | ICP builder (plain-English → structured), scored lead generation, intent-signal detection |
| **Craft** | `/craft` | Voice learning + deep research → a 5-step sequence written in your voice, with a quality gate |
| **Sequence** | `/sequence` | Campaign management, visual sequence timeline, account-safety controls |
| **Inbox** | `/inbox` | Reply classification (hot/warm/nurture/…) + one-click AI response suggestions |
| **Pipeline** | `/pipeline` | Kanban board across 10 stages |
| **Analytics** | `/analytics` | Acceptance / reply / meeting funnel, reply-rate trend, best-performing hooks |

## AI layer

The AI service (`services/ai.ts`) supports Anthropic, OpenAI, and a high-fidelity
**mock provider** that powers the whole product end-to-end with no API key — ideal for
demos. Set `ANTHROPIC_API_KEY` (and optionally `ANTHROPIC_MODEL`) to use a live model.

Endpoints live under `app/api/scouting/`:
`parse-icp`, `generate-leads`, `research`, `generate-sequence`, `classify-reply`, `learn-voice`.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The dashboard and all modules
run on realistic demo data out of the box.

## Database

Run `supabase/schema.sql` (shared `profiles`/auth) then `supabase/scouting-schema.sql`
(leads, campaigns, messages, conversations, ICPs, voice profiles — all RLS-protected).

## Environment

See **[docs/SETUP.md](docs/SETUP.md)** for the full step-by-step go-live guide
(Supabase, Anthropic, Stripe, Vercel) and **`.env.example`** for every variable.
The app runs fully in demo mode with none of these set.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase |
| `ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL` | Live AI (optional — mock used otherwise) |
| `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_*_PRICE_ID` | Billing (optional) |

*Scouting — Find them. Write for them. Win them.*
