# Doppio

**AI-powered project management for agencies — Linear-quality workflow, plus a client portal.**

Built with Next.js (App Router), TypeScript, Supabase (auth + Postgres), and plain
CSS Modules / CSS custom properties for the design system (no Tailwind).

> This project pins Next.js 16, which renamed the `middleware` file convention to
> `proxy` and made `cookies()`/`params` fully async. See `src/proxy.ts` and
> `src/lib/supabase/` for how that's handled here.

## Project structure

```
src/
  app/            routes (App Router)
  components/     shared UI components
  lib/            utilities, Supabase clients
  config/         app configuration
  proxy.ts        auth/onboarding request handling (the middleware equivalent)
supabase/
  migrations/     SQL migrations
```

## Setup for a new developer

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In **Project Settings → API**, copy the **Project URL** and **anon public key**.
3. In the **SQL Editor**, paste and run the contents of
   `supabase/migrations/0001_initial_schema.sql`. This creates the `profiles`,
   `crew_members`, `projects`, `tasks`, and `documents` tables, enables row
   level security with owner-scoped policies, adds indexes, and sets up a
   trigger that creates a `profiles` row for every new `auth.users` signup.
4. In **Authentication → URL Configuration**, add
   `http://localhost:3000/auth/callback` as a redirect URL (and your
   production URL once deployed) so email confirmation links work.

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in:

| Variable | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll land on `/auth`
until you sign up and confirm your email, at which point you're routed
through `/onboarding` and into `/dashboard`.

## Design system

All design tokens (colors, radii, shadows) live as CSS custom properties in
`src/app/globals.css`. It's a single light theme — no dark mode.
