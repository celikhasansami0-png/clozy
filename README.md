# Bionova — Setup Guide

**The operating system for renewable energy companies.** One product, eight
niches (Solar EPC, BESS, EV Charging, Wind, Hydro, Biogas, O&M, Consulting) —
the module config in `src/config/modules.ts` drives all UI labels, stages,
permit types and demo data per niche. With **@Bionova AI** built in.

> **Day 2 setup notes**
> 1. Run **both** SQL files in order in the Supabase SQL Editor:
>    `supabase/migrations/001_schema.sql` then `supabase/migrations/002_profiles_and_niche.sql`.
>    The 002 migration adds `profiles`, the new-user trigger, niche columns on
>    `jobs`, and the per-niche `seed_demo_data(owner_id, niche)`.
> 2. In Supabase → **Authentication → URL Configuration**, add your site URL and
>    redirect URLs: `<site>/auth/callback` (email verification) and
>    `<site>/auth/reset` (password reset). For local dev use `http://localhost:3000`.
> 3. New signups are routed through onboarding (niche + company) by `middleware.ts`
>    before reaching the dashboard.

## 1. Install dependencies
```bash
npm install
```

## 2. Create Supabase project
1. Go to https://supabase.com and create a free account
2. Create a new project
3. Go to **Settings → API** and copy:
   - Project URL
   - anon/public key

## 3. Set environment variables
```bash
cp .env.local.example .env.local
```
Edit `.env.local` and paste your Supabase values. To enable live AI, also set
`ANTHROPIC_API_KEY` (optional `ANTHROPIC_MODEL`, defaults to `claude-opus-4-8`).
Without a key, the AI features run in a built-in demo mode.

## 4. Run the database schema
1. In Supabase, go to **SQL Editor**
2. Copy the contents of `supabase/migrations/001_schema.sql`
3. Paste and run it

## 5. Seed demo data (optional)
After signing up, run this in Supabase SQL Editor (replace with your user ID from Auth → Users):
```sql
select seed_demo_data('YOUR-USER-UUID-HERE');
```

## 5b. Enable realtime (optional)
For live cross-session task updates, add the `tasks` table to the realtime
publication: Supabase → **Database → Replication → supabase_realtime** → enable `tasks`.

## AI features (@Bionova)
- **@Bionova chat** (`/dashboard/assistant`) — Anthropic-backed, grounded in your workspace
- **Risk alerts** — tasks due within 3 days surface on the dashboard
- **Auto-assign** — new tasks are routed to the lightest-workload team member
- **Permit agent** — permits "Under Review" > 14 days are flagged
- **Report agent** — "Generate AI Summary" on the Reports screen

Endpoints live under `src/app/api/ai/` (`chat`, `summary`); the AI layer is `src/lib/ai.ts`.

## 6. Run locally
```bash
npm run dev
```
Open http://localhost:3000

## 7. Deploy to Vercel
```bash
npm install -g vercel
vercel
```
Add your environment variables in Vercel dashboard → Settings → Environment Variables.

## Logo
Replace the LOGO placeholder in:
- `src/components/Sidebar.tsx` (line with `{/* Replace this div with your logo */}`)
- `src/app/auth/page.tsx` (same comment)

Change `<div style={{...}}>LOGO</div>` to `<img src="/logo.svg" width="28" height="28" alt="Logo" />`
and put your logo file in the `public/` folder.
