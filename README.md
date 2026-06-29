# Voltly — Setup Guide

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
Edit `.env.local` and paste your Supabase values.

## 4. Run the database schema
1. In Supabase, go to **SQL Editor**
2. Copy the contents of `supabase/migrations/001_schema.sql`
3. Paste and run it

## 5. Seed demo data (optional)
After signing up, run this in Supabase SQL Editor (replace with your user ID from Auth → Users):
```sql
select seed_demo_data('YOUR-USER-UUID-HERE');
```

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
