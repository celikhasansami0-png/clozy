-- Scout Day 3 — documents, notifications, activity logs + storage bucket.
-- Safe to re-run.

-- ── DOCUMENTS ───────────────────────────────────────────────────────────────
create table if not exists public.documents (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid references public.jobs(id) on delete cascade not null,
  owner_id    uuid references auth.users(id) on delete cascade not null,
  file_name   text not null,
  file_path   text not null,
  file_size   integer not null default 0,
  file_type   text not null default '',
  uploaded_by uuid references public.crew_members(id) on delete set null,
  created_at  timestamptz default now()
);
alter table public.documents enable row level security;
drop policy if exists "Users manage own documents" on public.documents;
create policy "Users manage own documents" on public.documents
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- ── NOTIFICATIONS ───────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid references auth.users(id) on delete cascade not null,
  title      text not null,
  body       text default '',
  type       text not null default 'info',
  read       boolean not null default false,
  link       text default '',
  created_at timestamptz default now()
);
alter table public.notifications enable row level security;
drop policy if exists "Users manage own notifications" on public.notifications;
create policy "Users manage own notifications" on public.notifications
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- ── ACTIVITY LOGS ───────────────────────────────────────────────────────────
create table if not exists public.activity_logs (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid references public.jobs(id) on delete cascade,
  owner_id    uuid references auth.users(id) on delete cascade not null,
  actor_id    uuid references auth.users(id) on delete set null,
  action      text not null,
  entity_type text not null default '',
  entity_id   uuid,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz default now()
);
alter table public.activity_logs enable row level security;
drop policy if exists "Users manage own activity" on public.activity_logs;
create policy "Users manage own activity" on public.activity_logs
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create index if not exists activity_logs_project_idx on public.activity_logs(project_id, created_at desc);
create index if not exists documents_project_idx on public.documents(project_id, created_at desc);
create index if not exists notifications_owner_idx on public.notifications(owner_id, created_at desc);

-- ── STORAGE BUCKET (private) ────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('project-documents', 'project-documents', false)
on conflict (id) do nothing;

-- Each user manages only the objects they uploaded (owner = auth.uid()).
drop policy if exists "doc objects read"   on storage.objects;
drop policy if exists "doc objects insert" on storage.objects;
drop policy if exists "doc objects update" on storage.objects;
drop policy if exists "doc objects delete" on storage.objects;
create policy "doc objects read"   on storage.objects for select using (bucket_id = 'project-documents' and auth.uid() = owner);
create policy "doc objects insert" on storage.objects for insert with check (bucket_id = 'project-documents' and auth.uid() = owner);
create policy "doc objects update" on storage.objects for update using (bucket_id = 'project-documents' and auth.uid() = owner);
create policy "doc objects delete" on storage.objects for delete using (bucket_id = 'project-documents' and auth.uid() = owner);
