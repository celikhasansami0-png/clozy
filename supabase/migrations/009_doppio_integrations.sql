-- Doppio integrations — connectable third-party services with strict, per-account
-- rate limits and shared error logging. All tables are owner-scoped via RLS and
-- indexed on owner_id. Tokens are stored per account; never exposed to the client.

-- Shared error log for every integration (failures are recorded, never thrown to UI).
create table if not exists public.integration_errors (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid references auth.users(id) on delete cascade not null,
  integration_type text not null,
  error_message    text,
  created_at       timestamptz default now()
);

-- 1) Slack — workspace token + channel; 50 messages/account/day.
create table if not exists public.slack_integrations (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid references auth.users(id) on delete cascade not null unique,
  workspace_token text,
  channel         text,
  last_status     text default 'ok',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
create table if not exists public.slack_logs (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid references auth.users(id) on delete cascade not null,
  event_type text,
  message    text,
  created_at timestamptz default now()
);

-- 2) Google Calendar — refresh token + calendar id; 200 actively synced events/account.
create table if not exists public.calendar_integrations (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid references auth.users(id) on delete cascade not null unique,
  refresh_token text,
  calendar_id   text,
  synced_count  integer not null default 0,
  last_status   text default 'ok',
  created_at    timestamptz default now()
);

-- 3) Gmail — token; 50 emails/account/day.
create table if not exists public.gmail_integrations (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid references auth.users(id) on delete cascade not null unique,
  gmail_token text,
  last_status text default 'ok',
  created_at  timestamptz default now()
);
create table if not exists public.gmail_logs (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid references auth.users(id) on delete cascade not null,
  to_email   text,
  subject    text,
  created_at timestamptz default now()
);

-- 4) Microsoft Outlook + Outlook Calendar — same pattern as Gmail/Google Calendar.
create table if not exists public.outlook_integrations (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid references auth.users(id) on delete cascade not null unique,
  access_token  text,
  refresh_token text,
  calendar_id   text,
  synced_count  integer not null default 0,
  last_status   text default 'ok',
  created_at    timestamptz default now()
);
create table if not exists public.outlook_logs (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid references auth.users(id) on delete cascade not null,
  event_type text,
  detail     text,
  created_at timestamptz default now()
);

-- 5) DocuSign — token; 30 signature requests/account/month.
create table if not exists public.docusign_integrations (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid references auth.users(id) on delete cascade not null unique,
  docusign_token text,
  account_id    text,
  last_status   text default 'ok',
  created_at    timestamptz default now()
);
create table if not exists public.docusign_logs (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid references auth.users(id) on delete cascade not null,
  document_id uuid,
  recipient   text,
  created_at  timestamptz default now()
);

-- 6) Cloud storage (Dropbox / Google Drive) — token per provider; files attached this
--    way obey the same 10MB / 50-doc-per-project limits as local uploads.
create table if not exists public.cloud_storage_integrations (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid references auth.users(id) on delete cascade not null,
  provider    text not null,
  access_token text,
  last_status text default 'ok',
  created_at  timestamptz default now(),
  unique (owner_id, provider)
);

-- Calendar sync de-duplication key on tasks.
alter table public.tasks add column if not exists google_event_id text;
alter table public.tasks add column if not exists outlook_event_id text;

-- RLS (owner-scoped) + owner_id indexes for every table above.
do $$
declare t text;
begin
  foreach t in array array[
    'integration_errors','slack_integrations','slack_logs','calendar_integrations',
    'gmail_integrations','gmail_logs','outlook_integrations','outlook_logs',
    'docusign_integrations','docusign_logs','cloud_storage_integrations'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "Users manage own %1$s" on public.%1$I;', t);
    execute format('create policy "Users manage own %1$s" on public.%1$I for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);', t);
    execute format('create index if not exists %1$s_owner_idx on public.%1$I(owner_id);', t);
  end loop;
end $$;
