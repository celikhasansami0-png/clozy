-- Bionova Day 4 — notification settings, project archive flag, email-prefs trigger.
-- Safe to re-run.

-- ── NOTIFICATION SETTINGS ───────────────────────────────────────────────────
create table if not exists public.notification_settings (
  id                   uuid primary key default gen_random_uuid(),
  owner_id             uuid references auth.users(id) on delete cascade not null unique,
  task_assigned        boolean not null default true,
  due_date_reminder    boolean not null default true,
  permit_status_change boolean not null default true,
  weekly_digest        boolean not null default true,
  created_at           timestamptz default now()
);
alter table public.notification_settings enable row level security;
drop policy if exists "Users manage own notification settings" on public.notification_settings;
create policy "Users manage own notification settings" on public.notification_settings
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- ── PROJECT ARCHIVE ─────────────────────────────────────────────────────────
alter table public.jobs add column if not exists is_archived boolean not null default false;

-- ── Extend the new-user trigger to also seed a notification_settings row ─────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  insert into public.notification_settings (owner_id)
  values (new.id)
  on conflict (owner_id) do nothing;
  return new;
end;
$$;

-- Backfill settings for existing users.
insert into public.notification_settings (owner_id)
select id from auth.users
on conflict (owner_id) do nothing;
