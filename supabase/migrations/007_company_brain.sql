-- Bionova revision — Company Brain foundation (schema only, no functionality yet).

create extension if not exists vector;

-- Feature flag on profiles.
alter table public.profiles add column if not exists company_brain_enabled boolean not null default false;

-- Embeddings store for future RAG over company data.
create table if not exists public.knowledge_embeddings (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid references auth.users(id) on delete cascade not null,
  source_type text,
  source_id   uuid,
  content     text,
  embedding   vector(1536),
  created_at  timestamptz default now()
);
alter table public.knowledge_embeddings enable row level security;
drop policy if exists "Users manage own embeddings" on public.knowledge_embeddings;
create policy "Users manage own embeddings" on public.knowledge_embeddings
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create index if not exists knowledge_owner_idx on public.knowledge_embeddings(owner_id);

-- Access requests for the premium feature.
create table if not exists public.company_brain_requests (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid references auth.users(id) on delete cascade not null,
  email        text,
  requested_at timestamptz default now()
);
alter table public.company_brain_requests enable row level security;
drop policy if exists "Users manage own brain requests" on public.company_brain_requests;
create policy "Users manage own brain requests" on public.company_brain_requests
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
