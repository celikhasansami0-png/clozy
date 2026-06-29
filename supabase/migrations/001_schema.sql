-- Enable RLS
create extension if not exists "uuid-ossp";

-- ── CREW MEMBERS ──────────────────────────────────────────────────────────
create table public.crew_members (
  id          uuid primary key default uuid_generate_v4(),
  owner_id    uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  initials    text not null,
  role        text not null default 'Electrician',
  created_at  timestamptz default now()
);

alter table public.crew_members enable row level security;
create policy "Users manage own crew" on public.crew_members
  for all using (auth.uid() = owner_id);

-- ── JOBS ──────────────────────────────────────────────────────────────────
create table public.jobs (
  id          uuid primary key default uuid_generate_v4(),
  owner_id    uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  color       text not null default '#A0A0A0',
  status      text not null default 'In Progress',
  phase       text not null default 'Planning',
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
  type           text not null default 'Electrical',
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
  -- Crew
  insert into public.crew_members (owner_id, name, initials, role) values
    (p_owner_id, 'Marcus T.', 'MT', 'Foreman'),
    (p_owner_id, 'Jake R.',   'JR', 'Electrician'),
    (p_owner_id, 'Sarah K.',  'SK', 'Electrician'),
    (p_owner_id, 'Devon L.',  'DL', 'Apprentice')
  returning id into c1;
  select id into c1 from public.crew_members where owner_id=p_owner_id and initials='MT';
  select id into c2 from public.crew_members where owner_id=p_owner_id and initials='JR';
  select id into c3 from public.crew_members where owner_id=p_owner_id and initials='SK';
  select id into c4 from public.crew_members where owner_id=p_owner_id and initials='DL';

  -- Jobs
  insert into public.jobs (owner_id,name,color,status,phase,completion) values
    (p_owner_id,'Riverside Medical Complex','#F5A623','In Progress','Rough-in',58) returning id into j1;
  insert into public.jobs (owner_id,name,color,status,phase,completion) values
    (p_owner_id,'Harbor Office Park','#60a5fa','On Track','Trim-out',82) returning id into j2;
  insert into public.jobs (owner_id,name,color,status,phase,completion) values
    (p_owner_id,'Downtown Retrofit — 5th & Main','#f87171','Delayed','Design',21) returning id into j3;
  insert into public.jobs (owner_id,name,color,status,phase,completion) values
    (p_owner_id,'Westside Retail Center','#4ade80','On Track','Underground',35) returning id into j4;

  -- Tasks for j1
  insert into public.tasks (job_id,owner_id,title,status,priority,assignee_id,due_date,tag) values
    (j1,p_owner_id,'Panel schedule — floors 3–5','in_progress','high',c1,'2024-06-14','Rough-in'),
    (j1,p_owner_id,'Submit permit revision to City of Riverside','todo','urgent',null,'2024-06-13','Permit'),
    (j1,p_owner_id,'Conduit rough-in — basement level','done','normal',c2,'2024-06-10','Rough-in'),
    (j1,p_owner_id,'Rough-in inspection sign-off','todo','normal',null,'2024-06-18','Inspection'),
    (j1,p_owner_id,'Load calculation review — east wing','in_progress','high',c3,'2024-06-15','Engineering');

  -- Tasks for j2
  insert into public.tasks (job_id,owner_id,title,status,priority,assignee_id,due_date,tag) values
    (j2,p_owner_id,'Device installation — suites 200–210','in_progress','normal',c2,'2024-06-16','Trim-out'),
    (j2,p_owner_id,'Panel energization sign-off','todo','high',c1,'2024-06-20','Inspection'),
    (j2,p_owner_id,'Final punch list walkthrough','todo','normal',c1,'2024-06-22','Closeout'),
    (j2,p_owner_id,'As-built documentation upload','done','normal',c3,'2024-06-08','Docs');

  -- Tasks for j3
  insert into public.tasks (job_id,owner_id,title,status,priority,assignee_id,due_date,tag) values
    (j3,p_owner_id,'Existing conditions survey','done','normal',c4,'2024-06-05','Survey'),
    (j3,p_owner_id,'Coordination with GC on demo schedule','todo','urgent',null,'2024-06-17','Coordination'),
    (j3,p_owner_id,'Permit application — initial submittal','todo','high',null,'2024-06-25','Permit');

  -- Tasks for j4
  insert into public.tasks (job_id,owner_id,title,status,priority,assignee_id,due_date,tag) values
    (j4,p_owner_id,'Underground conduit — parking structure','in_progress','normal',c1,'2024-06-19','Underground'),
    (j4,p_owner_id,'Trench inspection','todo','normal',null,'2024-06-21','Inspection');

  -- Permits
  insert into public.permits (job_id,owner_id,permit_number,type,status,submitted_date,notes) values
    (j1,p_owner_id,'P-24-8821','Electrical','Under Review','2024-06-03','Revision requested — arc fault detail'),
    (j1,p_owner_id,'P-24-8744','Low Voltage','Approved','2024-05-28',''),
    (j2,p_owner_id,'P-24-7901','Electrical','Approved','2024-05-14',''),
    (j4,p_owner_id,'P-24-9102','Electrical','Pending','2024-06-09','Awaiting AHJ review');
end;
$$;
