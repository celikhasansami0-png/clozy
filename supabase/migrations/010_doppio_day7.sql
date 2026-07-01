-- Doppio Day 7 — AI features, collaboration, productivity, client access.
-- All tables owner-scoped via RLS and indexed. Run after migrations 001–009.

-- ── AI usage logs (caps for meeting-notes + weekly-summary) ──────────────────
create table if not exists public.ai_usage_logs (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid references auth.users(id) on delete cascade not null,
  feature    text not null,
  created_at timestamptz default now()
);

-- ── Weekly summary storage on profiles ──────────────────────────────────────
alter table public.profiles add column if not exists last_weekly_summary text;
alter table public.profiles add column if not exists last_summary_at timestamptz;

-- ── Client access token on projects (jobs) ──────────────────────────────────
alter table public.jobs add column if not exists client_access_token text;
create index if not exists jobs_client_token_idx on public.jobs(client_access_token);

-- ── Task comments + mentions ────────────────────────────────────────────────
create table if not exists public.task_comments (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid references public.tasks(id) on delete cascade not null,
  owner_id   uuid references auth.users(id) on delete cascade not null,
  author_id  uuid references auth.users(id) on delete set null,
  content    text not null,
  created_at timestamptz default now()
);

-- ── Project templates ───────────────────────────────────────────────────────
create table if not exists public.project_templates (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid references auth.users(id) on delete cascade not null,
  name          text not null,
  description   text default '',
  task_count    integer not null default 0,
  template_data jsonb not null default '{}'::jsonb,
  created_at    timestamptz default now()
);

-- ── Time entries ────────────────────────────────────────────────────────────
create table if not exists public.time_entries (
  id               uuid primary key default gen_random_uuid(),
  task_id          uuid references public.tasks(id) on delete cascade not null,
  owner_id         uuid references auth.users(id) on delete cascade not null,
  started_at       timestamptz not null,
  ended_at         timestamptz,
  duration_seconds integer not null default 0,
  created_at       timestamptz default now()
);

-- ── RLS (owner-scoped) + indexes ────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'ai_usage_logs','task_comments','project_templates','time_entries'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "Users manage own %1$s" on public.%1$I;', t);
    execute format('create policy "Users manage own %1$s" on public.%1$I for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);', t);
    execute format('create index if not exists %1$s_owner_idx on public.%1$I(owner_id);', t);
  end loop;
  create index if not exists task_comments_task_idx on public.task_comments(task_id);
  create index if not exists time_entries_task_idx on public.time_entries(task_id);
end $$;

-- ── Three default agency templates, seeded per new account ───────────────────
create or replace function public.seed_default_templates(p_owner_id uuid)
returns void language plpgsql security definer as $$
begin
  insert into public.project_templates(owner_id,name,description,task_count,template_data) values
  (p_owner_id,'Website Project','Common web development workflow',8, jsonb_build_object('tasks', jsonb_build_array(
    jsonb_build_object('title','Kickoff & requirements','priority','normal','tag','Planning','due_offset_days',1),
    jsonb_build_object('title','Sitemap & wireframes','priority','high','tag','Planning','due_offset_days',4),
    jsonb_build_object('title','Design mockups','priority','high','tag','In Progress','due_offset_days',8),
    jsonb_build_object('title','Client mockup review','priority','urgent','tag','Review','due_offset_days',11),
    jsonb_build_object('title','Development build','priority','high','tag','In Progress','due_offset_days',20),
    jsonb_build_object('title','Content population','priority','normal','tag','In Progress','due_offset_days',24),
    jsonb_build_object('title','QA & testing','priority','high','tag','Review','due_offset_days',28),
    jsonb_build_object('title','Launch & handoff','priority','urgent','tag','Review','due_offset_days',30)
  ))),
  (p_owner_id,'Social Media Campaign','Campaign management workflow',6, jsonb_build_object('tasks', jsonb_build_array(
    jsonb_build_object('title','Campaign brief & goals','priority','normal','tag','Planning','due_offset_days',1),
    jsonb_build_object('title','Content calendar','priority','high','tag','Planning','due_offset_days',4),
    jsonb_build_object('title','Creative asset design','priority','high','tag','In Progress','due_offset_days',8),
    jsonb_build_object('title','Copywriting','priority','normal','tag','In Progress','due_offset_days',10),
    jsonb_build_object('title','Client approval','priority','urgent','tag','Review','due_offset_days',12),
    jsonb_build_object('title','Schedule & publish','priority','normal','tag','Review','due_offset_days',14)
  ))),
  (p_owner_id,'Brand Identity Project','Branding workflow',7, jsonb_build_object('tasks', jsonb_build_array(
    jsonb_build_object('title','Discovery & brand brief','priority','normal','tag','Planning','due_offset_days',1),
    jsonb_build_object('title','Moodboard & direction','priority','high','tag','Planning','due_offset_days',4),
    jsonb_build_object('title','Logo concepts','priority','high','tag','In Progress','due_offset_days',8),
    jsonb_build_object('title','Client concept review','priority','urgent','tag','Review','due_offset_days',11),
    jsonb_build_object('title','Color & typography system','priority','normal','tag','In Progress','due_offset_days',15),
    jsonb_build_object('title','Brand guidelines doc','priority','high','tag','Review','due_offset_days',20),
    jsonb_build_object('title','Final asset delivery','priority','urgent','tag','Review','due_offset_days',22)
  )));
end $$;

-- ── Weekly AI summary cron (Monday 08:00 UTC) ────────────────────────────────
-- Requires pg_cron + pg_net. Wrapped so the migration still succeeds if those
-- extensions are unavailable; the app also exposes an on-demand "Generate
-- Summary Now" button and the /api/ai/weekly-summary route.
do $$
begin
  create extension if not exists pg_cron;
  create extension if not exists pg_net;
  perform cron.schedule(
    'doppio-weekly-summary', '0 8 * * 1',
    $cron$
      select net.http_post(
        url := coalesce(current_setting('app.site_url', true), 'https://doppio.app') || '/api/ai/weekly-summary',
        headers := jsonb_build_object('Content-Type','application/json','x-cron-secret', coalesce(current_setting('app.cron_secret', true), '')),
        body := jsonb_build_object('all', true)
      );
    $cron$
  );
exception when others then
  raise notice 'pg_cron/pg_net not available — weekly summary cron skipped (use the in-app button)';
end $$;
