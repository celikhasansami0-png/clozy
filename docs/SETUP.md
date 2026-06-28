# Scouting — Setup & Go-Live Guide

This maps 1:1 to the owner task list. The app runs **fully in demo mode with no
configuration** — every value below only unlocks the "live" version of a feature.

> Demo mode: hooks fall back to in-memory sample data and the AI uses a
> high-fidelity mock. Set the env vars below and the **same code** switches to
> real persistence and a real model — no code changes needed.

---

## A. Required to go live

### 1. Supabase (auth + persistence)
1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run, **in this order**:
   1. `supabase/schema.sql` — profiles + shared trigger functions
   2. `supabase/scouting-schema.sql` — leads, campaigns, messages, conversations,
      ICPs, voice profiles (all RLS-protected)
3. Project Settings → API → copy the URL and the `anon` public key into:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Auth → set the Site URL and redirect URL to your domain (`/auth/callback`).

**Verify:** sign up → you should be routed to `/onboarding`; complete it → leads
and the campaign persist across refresh.

### 2. Anthropic (live AI)
1. Get a key at [console.anthropic.com](https://console.anthropic.com).
2. Set `ANTHROPIC_API_KEY` (optionally `ANTHROPIC_MODEL`).

**Verify:** in Scout, "Generate lead list" and "Research" return model output
instead of the mock. (No key = mock, which is fine for demos.)

### 3. Deploy (Vercel)
1. Import the repo at [vercel.com/new](https://vercel.com/new).
2. Add every env var from `.env.example` in Project → Settings → Environment Variables.
3. Deploy, then attach your domain.

---

## B. Feature-completing (optional)

### 4. Stripe (billing)
1. Create two recurring **Prices** in Stripe: Starter ($49/mo), Growth ($99/mo).
2. Set `STRIPE_SECRET_KEY`, and the price IDs:
   `NEXT_PUBLIC_STRIPE_STUDENT_PRO_PRICE_ID` (Starter),
   `NEXT_PUBLIC_STRIPE_TEAM_PRO_PRICE_ID` (Growth).
3. Add a webhook → endpoint `/api/stripe/webhook`, copy the signing secret into
   `STRIPE_WEBHOOK_SECRET`.

### 5. Calendly / Cal.com
Create an account, copy your booking link. You'll paste it in **Settings** (added
in Faz 5) so the Inbox can insert it into hot/warm replies.

### 6. Email reports (optional)
Resend or Postmark account + key (wired in Faz 7 for weekly reports).

---

## C. Decisions to confirm
- **Lead data source:** Anthropic web-search (cheap, built in Faz 6) vs a paid
  provider (Apollo/Clay).
- **LinkedIn approach:** manual copy-paste (shipped — the `/send` queue) vs a
  future browser extension.
- **Pricing:** keep $49 / $99 + 20% annual?

## D. Go-to-market
- Domain + brand/logo (the Crosshair icon is a placeholder).
- Terms & Privacy copy (scaffold pages added in Faz 8 — you provide the text).
- 5–10 pilot/design-partner users.

---

## Local development
```bash
npm install
cp .env.example .env.local   # optional — app runs without it
npm run dev                  # http://localhost:3000
```

## Useful checks
```bash
npm run build       # production build
npx tsc --noEmit    # typecheck
npx eslint .        # lint
```
