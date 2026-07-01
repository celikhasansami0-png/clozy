-- Doppio — base schema (superseded demo data; see migration 008 for the agency seed)
-- Safe to re-run: drops existing objects first, then recreates them.

create extension if not exists "uuid-ossp";

-- ── DROP (in dependency order) so this migration is idempotent ──────────────
drop function if exists public.seed_demo_data(uuid);
drop table if exists public.permits cascade;
drop table if exists public.tasks cascade;
drop table if exists public.jobs cascade;
drop table if exists public.crew_members cascade;

-- ── CREW MEMBERS ──────────────────────────────────────────────────────────
create table public.crew_members (
  id          uuid primary key default uuid_generate_v4(),
  owner_id    uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  initials    text not null,
  role        text not null default 'Specialist',
  created_at  timestamptz default now()
);

alter table public.crew_members enable row level security;
create policy "Users manage own crew" on public.crew_members
  for all using (auth.uid() = owner_id);

-- ── PROJECTS (table kept as `jobs` for compatibility) ──────────────────────
create table public.jobs (
  id          uuid primary key default uuid_generate_v4(),
  owner_id    uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  color       text not null default '#A0A0A0',
  status      text not null default 'In Progress',
  phase       text not null default 'Engineering',
  completion  integer not null default 0 check (completion between 0 and 100),
  created_at  timestamptz default now()
);

alter table public.jobs enable row level security;
create policy "Users manage own jobs" on public.jobs
  for all using (auth.uid() = owner_id);

-- ── TASKS ─────────────────────────────────────────────────────────────────
create table public.tasks (
  id           uuid primary key default uuid_generate_v4(),
  job_id       uuid references public.jobs(id) on delete cascade not null,
  owner_id     uuid references auth.users(id) on delete cascade not null,
  title        text not null,
  status       text not null default 'todo',
  priority     text not null default 'normal',
  assignee_id  uuid references public.crew_members(id) on delete set null,
  due_date     date,
  tag          text not null default 'General',
  created_at   timestamptz default now()
);

alter table public.tasks enable row level security;
create policy "Users manage own tasks" on public.tasks
  for all using (auth.uid() = owner_id);

-- ── PERMITS ───────────────────────────────────────────────────────────────
create table public.permits (
  id             uuid primary key default uuid_generate_v4(),
  job_id         uuid references public.jobs(id) on delete cascade not null,
  owner_id       uuid references auth.users(id) on delete cascade not null,
  permit_number  text not null,
  type           text not null default 'Building',
  status         text not null default 'Pending',
  submitted_date date,
  notes          text default '',
  created_at     timestamptz default now()
);

alter table public.permits enable row level security;
create policy "Users manage own permits" on public.permits
  for all using (auth.uid() = owner_id);

-- ── SEED FUNCTION (called after first login) ───────────────────────────────
create or replace function public.seed_demo_data(p_owner_id uuid)
returns void language plpgsql security definer as $$
declare
  j1 uuid; j2 uuid; j3 uuid; j4 uuid;
  c1 uuid; c2 uuid; c3 uuid; c4 uuid;
begin
  -- Crew (agency roles)
  insert into public.crew_members (owner_id, name, initials, role) values
    (p_owner_id, 'Marcus T.', 'MT', 'Project Manager'),
    (p_owner_id, 'Jake R.',   'JR', 'Specialist'),
    (p_owner_id, 'Sarah K.',  'SK', 'PV Design Engineer'),
    (p_owner_id, 'Devon L.',  'DL', 'Apprentice Installer');
  select id into c1 from public.crew_members where owner_id=p_owner_id and initials='MT';
  select id into c2 from public.crew_members where owner_id=p_owner_id and initials='JR';
  select id into c3 from public.crew_members where owner_id=p_owner_id and initials='SK';
  select id into c4 from public.crew_members where owner_id=p_owner_id and initials='DL';

  -- Projects (agency sites)
  insert into public.jobs (owner_id,name,color,status,phase,completion) values
    (p_owner_id,'Website Redesign for TechCorp','#F5A623','In Progress','Construction',58) returning id into j1;
  insert into public.jobs (owner_id,name,color,status,phase,completion) values
    (p_owner_id,'Harbor Logistics Rooftop — 2.4','#60a5fa','On Track','Commissioning',82) returning id into j2;
  insert into public.jobs (owner_id,name,color,status,phase,completion) values
    (p_owner_id,'Brand Identity Project','#f87171','Delayed','Engineering',21) returning id into j3;
  insert into public.jobs (owner_id,name,color,status,phase,completion) values
    (p_owner_id,'Westfield Distribution Center — 1.8','#4ade80','On Track','Procurement',35) returning id into j4;

  -- Tasks for j1 (Cedar Ridge — Construction)
  insert into public.tasks (job_id,owner_id,title,status,priority,assignee_id,due_date,tag) values
    (j1,p_owner_id,'Pile driving — rows 18–32','in_progress','high',c1,'2026-06-14','Civil'),
    (j1,p_owner_id,'Submit coordination revision to utility','todo','urgent',null,'2026-06-13','coordination'),
    (j1,p_owner_id,'Module racking — block A','done','normal',c2,'2026-06-10','Racking'),
    (j1,p_owner_id,'DC string inspection sign-off','todo','normal',null,'2026-06-18','Inspection'),
    (j1,p_owner_id,'String sizing review — block C','in_progress','high',c3,'2026-06-15','Engineering');

  -- Tasks for j2 (Harbor Logistics — Commissioning)
  insert into public.tasks (job_id,owner_id,title,status,priority,assignee_id,due_date,tag) values
    (j2,p_owner_id,'Inverter commissioning — units 1–4','in_progress','normal',c2,'2026-06-16','Commissioning'),
    (j2,p_owner_id,'PTO inspection sign-off','todo','high',c1,'2026-06-20','Inspection'),
    (j2,p_owner_id,'Final punch list walkthrough','todo','normal',c1,'2026-06-22','Closeout'),
    (j2,p_owner_id,'As-built documentation upload','done','normal',c3,'2026-06-08','Docs');

  -- Tasks for j3 (Mesa Verde — Engineering)
  insert into public.tasks (job_id,owner_id,title,status,priority,assignee_id,due_date,tag) values
    (j3,p_owner_id,'Site survey & shading analysis','done','normal',c4,'2026-06-05','Survey'),
    (j3,p_owner_id,'Coordinate utility coordination study','todo','urgent',null,'2026-06-17','coordination'),
    (j3,p_owner_id,'Building permit application — initial submittal','todo','high',null,'2026-06-25','Permit');

  -- Tasks for j4 (Westfield — Procurement)
  insert into public.tasks (job_id,owner_id,title,status,priority,assignee_id,due_date,tag) values
    (j4,p_owner_id,'Release module & inverter purchase order','in_progress','normal',c1,'2026-06-19','Procurement'),
    (j4,p_owner_id,'Geotech report review','todo','normal',null,'2026-06-21','Engineering');

  -- Permits (agency permit types)
  insert into public.permits (job_id,owner_id,permit_number,type,status,submitted_date,notes) values
    (j1,p_owner_id,'P-26-8821','coordination','Under Review','2026-06-03','Revision requested — string layout detail'),
    (j1,p_owner_id,'P-26-8744','Building','Approved','2026-05-28',''),
    (j2,p_owner_id,'P-26-7901','Electrical','Approved','2026-05-14',''),
    (j4,p_owner_id,'P-26-9102','Utility / PTO','Pending','2026-06-09','Awaiting utility review');
end;
$$;
