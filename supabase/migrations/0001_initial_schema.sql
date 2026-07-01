-- Doppio initial schema
-- Run this file in the Supabase SQL editor (or via `supabase db push`).

-- ─── profiles ──────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  company_name text,
  client_count text,
  subscription_plan text not null default 'trial',
  subscription_status text not null default 'inactive',
  stripe_customer_id text,
  stripe_subscription_id text,
  onboarded boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles_delete_own" on public.profiles
  for delete using (auth.uid() = id);

-- Auto-create a profile row whenever a new user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── crew_members ──────────────────────────────────────────────────────────

create table if not exists public.crew_members (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  initials text not null,
  role text not null default 'Team Member',
  created_at timestamptz not null default now()
);

alter table public.crew_members enable row level security;

create policy "crew_members_select_own" on public.crew_members
  for select using (auth.uid() = owner_id);

create policy "crew_members_insert_own" on public.crew_members
  for insert with check (auth.uid() = owner_id);

create policy "crew_members_update_own" on public.crew_members
  for update using (auth.uid() = owner_id);

create policy "crew_members_delete_own" on public.crew_members
  for delete using (auth.uid() = owner_id);

create index if not exists crew_members_owner_id_idx on public.crew_members (owner_id);

-- ─── projects ──────────────────────────────────────────────────────────────

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color text not null default '#8C8980',
  status text not null default 'In Progress',
  phase text not null default 'Planning',
  completion integer not null default 0,
  client_access_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "projects_select_own" on public.projects
  for select using (auth.uid() = owner_id);

create policy "projects_insert_own" on public.projects
  for insert with check (auth.uid() = owner_id);

create policy "projects_update_own" on public.projects
  for update using (auth.uid() = owner_id);

create policy "projects_delete_own" on public.projects
  for delete using (auth.uid() = owner_id);

create index if not exists projects_owner_id_idx on public.projects (owner_id);

-- ─── tasks ─────────────────────────────────────────────────────────────────

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  status text not null default 'todo',
  priority text not null default 'normal',
  assignee_id uuid references public.crew_members (id) on delete set null,
  due_date date,
  tag text not null default 'General',
  blocked_by_task_id uuid references public.tasks (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

create policy "tasks_select_own" on public.tasks
  for select using (auth.uid() = owner_id);

create policy "tasks_insert_own" on public.tasks
  for insert with check (auth.uid() = owner_id);

create policy "tasks_update_own" on public.tasks
  for update using (auth.uid() = owner_id);

create policy "tasks_delete_own" on public.tasks
  for delete using (auth.uid() = owner_id);

create index if not exists tasks_owner_id_idx on public.tasks (owner_id);
create index if not exists tasks_project_id_idx on public.tasks (project_id);

-- ─── documents ─────────────────────────────────────────────────────────────

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  document_number text,
  type text not null default 'General',
  status text not null default 'pending',
  submitted_date date,
  notes text default '',
  client_feedback text,
  created_at timestamptz not null default now()
);

alter table public.documents enable row level security;

create policy "documents_select_own" on public.documents
  for select using (auth.uid() = owner_id);

create policy "documents_insert_own" on public.documents
  for insert with check (auth.uid() = owner_id);

create policy "documents_update_own" on public.documents
  for update using (auth.uid() = owner_id);

create policy "documents_delete_own" on public.documents
  for delete using (auth.uid() = owner_id);

create index if not exists documents_owner_id_idx on public.documents (owner_id);
create index if not exists documents_project_id_idx on public.documents (project_id);
