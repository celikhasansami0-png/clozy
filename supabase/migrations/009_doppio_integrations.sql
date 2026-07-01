-- Doppio integrations — Slack, Google Calendar, Gmail. Strict, per-account rate
-- limits and shared error logging. All tables owner-scoped via RLS, indexed on
-- owner_id. Tokens are stored per account and never exposed to the client.

-- Shared error log for every integration (failures recorded, never thrown to UI).
create table if not exists public.integration_errors (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid references auth.users(id) on delete cascade not null,
  integration_type text not null,
  error_message    text,
  created_at       timestamptz default now()
);

-- 1) Slack — workspace token, team, default channel. 50 messages/account/day.
create table if not exists public.slack_integrations (
  id                 uuid primary key default gen_random_uuid(),
  owner_id           uuid references auth.users(id) on delete cascade not null unique,
  access_token       text,
  team_id            text,
  team_name          text,
  default_channel_id text,
  connected_at       timestamptz default now()
);
create table if not exists public.slack_logs (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid references auth.users(id) on delete cascade not null,
  message_type text,
  sent_at      timestamptz default now()
);

-- 2) Google Calendar — refresh/access token + calendar id. 200 synced events/account.
create table if not exists public.calendar_integrations (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid references auth.users(id) on delete cascade not null unique,
  refresh_token text,
  access_token  text,
  calendar_id   text,
  connected_at  timestamptz default now()
);

-- 3) Gmail — token + connected email. 50 sends/account/day.
create table if not exists public.gmail_integrations (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid references auth.users(id) on delete cascade not null unique,
  access_token  text,
  refresh_token text,
  email         text,
  connected_at  timestamptz default now()
);
create table if not exists public.gmail_logs (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid references auth.users(id) on delete cascade not null,
  recipient  text,
  sent_at    timestamptz default now()
);

-- Calendar de-duplication key on tasks (update existing event instead of dupe).
alter table public.tasks add column if not exists google_event_id text;

-- RLS (owner-scoped) + owner_id indexes for every table above.
do $$
declare t text;
begin
  foreach t in array array[
    'integration_errors','slack_integrations','slack_logs',
    'calendar_integrations','gmail_integrations','gmail_logs'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "Users manage own %1$s" on public.%1$I;', t);
    execute format('create policy "Users manage own %1$s" on public.%1$I for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);', t);
    execute format('create index if not exists %1$s_owner_idx on public.%1$I(owner_id);', t);
  end loop;
end $$;
