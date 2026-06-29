-- Bionova Day 2 — profiles, auth trigger, niche columns, per-niche seed data.
-- Safe to re-run.

-- ── PROFILES ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  company_name text,
  team_size    text,
  niche        text not null default 'solar_epc',
  onboarded    boolean not null default false,
  created_at   timestamptz default now()
);

alter table public.profiles enable row level security;
drop policy if exists "Users manage own profile" on public.profiles;
create policy "Users manage own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Auto-create a profile row on every new auth signup.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for any pre-existing users.
insert into public.profiles (id, full_name)
select u.id, coalesce(u.raw_user_meta_data->>'full_name', '')
from auth.users u
on conflict (id) do nothing;

-- ── PROJECTS (jobs) niche columns ───────────────────────────────────────────
alter table public.jobs add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.jobs add column if not exists niche text not null default 'solar_epc';

-- ── SEED (per niche) ────────────────────────────────────────────────────────
drop function if exists public.seed_demo_data(uuid);
drop function if exists public.seed_demo_data(uuid, text);

create or replace function public.seed_demo_data(p_owner_id uuid, p_niche text default 'solar_epc')
returns void language plpgsql security definer set search_path = public as $$
declare
  j1 uuid; j2 uuid; j3 uuid; j4 uuid; j5 uuid; j6 uuid;
  c1 uuid; c2 uuid; c3 uuid; c4 uuid;
begin
  -- Idempotent: clear this user's existing demo data first.
  delete from public.permits where owner_id = p_owner_id;
  delete from public.tasks where owner_id = p_owner_id;
  delete from public.jobs where owner_id = p_owner_id;
  delete from public.crew_members where owner_id = p_owner_id;

  if p_niche = 'solar_epc' then
    insert into public.crew_members(owner_id,name,initials,role) values
      (p_owner_id,'Marcus T.','MT','Project Manager'),
      (p_owner_id,'Jake R.','JR','Solar Installer'),
      (p_owner_id,'Sarah K.','SK','PV Engineer'),
      (p_owner_id,'Devon L.','DL','Apprentice');
    select id into c1 from public.crew_members where owner_id=p_owner_id and initials='MT';
    select id into c2 from public.crew_members where owner_id=p_owner_id and initials='JR';
    select id into c3 from public.crew_members where owner_id=p_owner_id and initials='SK';
    insert into public.jobs(owner_id,niche,name,color,status,phase,completion) values
      (p_owner_id,p_niche,'Cedar Ridge Solar Farm — 12 MW','#F5A623','In Progress','Construction',58) returning id into j1;
    insert into public.jobs(owner_id,niche,name,color,status,phase,completion) values
      (p_owner_id,p_niche,'Harbor Logistics Rooftop — 2.4 MW','#60a5fa','On Track','Commissioning',82) returning id into j2;
    insert into public.jobs(owner_id,niche,name,color,status,phase,completion) values
      (p_owner_id,p_niche,'Mesa Verde Community Solar — 5 MW','#f87171','Delayed','Design',21) returning id into j3;
    insert into public.jobs(owner_id,niche,name,color,status,phase,completion) values
      (p_owner_id,p_niche,'Westfield Distribution Center — 1.8 MW','#4ade80','On Track','Permitting',35) returning id into j4;
    insert into public.tasks(job_id,owner_id,title,status,priority,assignee_id,due_date,tag) values
      (j1,p_owner_id,'Pile driving — rows 18–32','in_progress','high',c1,'2026-06-14','Construction'),
      (j1,p_owner_id,'DC string inspection sign-off','todo','normal',null,'2026-06-18','Commissioning'),
      (j2,p_owner_id,'Inverter commissioning — units 1–4','in_progress','normal',c2,'2026-06-16','Commissioning'),
      (j3,p_owner_id,'Single-line diagram revision','todo','high',c3,'2026-06-20','Design'),
      (j4,p_owner_id,'Submit grid connection application','todo','urgent',null,'2026-06-13','Permitting');
    insert into public.permits(job_id,owner_id,permit_number,type,status,submitted_date,notes) values
      (j1,p_owner_id,'P-26-8821','Grid Connection','Under Review','2026-06-03','Revision requested — string layout'),
      (j1,p_owner_id,'P-26-8744','Building','Approved','2026-05-28',''),
      (j4,p_owner_id,'P-26-9102','Electrical','Pending','2026-06-09','Awaiting AHJ review');

  elsif p_niche = 'bess' then
    insert into public.crew_members(owner_id,name,initials,role) values
      (p_owner_id,'Elena R.','ER','Project Manager'),(p_owner_id,'Tom B.','TB','BESS Technician'),
      (p_owner_id,'Priya N.','PN','Electrical Engineer'),(p_owner_id,'Carl M.','CM','Site Tech');
    select id into c1 from public.crew_members where owner_id=p_owner_id and initials='ER';
    select id into c2 from public.crew_members where owner_id=p_owner_id and initials='TB';
    insert into public.jobs(owner_id,niche,name,color,status,phase,completion) values
      (p_owner_id,p_niche,'Gridpoint BESS — 40 MWh','#60a5fa','In Progress','Installation',55) returning id into j1;
    insert into public.jobs(owner_id,niche,name,color,status,phase,completion) values
      (p_owner_id,p_niche,'Northgate Storage — 20 MWh','#4ade80','On Track','Testing',80) returning id into j2;
    insert into public.jobs(owner_id,niche,name,color,status,phase,completion) values
      (p_owner_id,p_niche,'Harbor Peaker BESS — 60 MWh','#a78bfa','Delayed','Procurement',24) returning id into j3;
    insert into public.tasks(job_id,owner_id,title,status,priority,assignee_id,due_date,tag) values
      (j1,p_owner_id,'Battery rack assembly — string A','in_progress','high',c2,'2026-06-15','Installation'),
      (j1,p_owner_id,'DC bus bar torque check','todo','normal',null,'2026-06-19','Installation'),
      (j2,p_owner_id,'Capacity test — bank 2','in_progress','high',c1,'2026-06-17','Testing'),
      (j3,p_owner_id,'Confirm cell delivery schedule','todo','urgent',null,'2026-06-12','Procurement');
    insert into public.permits(job_id,owner_id,permit_number,type,status,submitted_date,notes) values
      (j1,p_owner_id,'B-26-3301','Fire Safety','Under Review','2026-06-01','NFPA 855 spacing review'),
      (j1,p_owner_id,'B-26-3290','Electrical','Approved','2026-05-20','');

  elsif p_niche = 'ev_charging' then
    insert into public.crew_members(owner_id,name,initials,role) values
      (p_owner_id,'Nina P.','NP','Project Manager'),(p_owner_id,'Raj S.','RS','EV Installer'),
      (p_owner_id,'Owen D.','OD','Electrician'),(p_owner_id,'Mia F.','MF','Site Coordinator');
    select id into c1 from public.crew_members where owner_id=p_owner_id and initials='NP';
    select id into c2 from public.crew_members where owner_id=p_owner_id and initials='RS';
    insert into public.jobs(owner_id,niche,name,color,status,phase,completion) values
      (p_owner_id,p_niche,'Downtown Hub — 12 stalls','#F5A623','In Progress','Installation',62) returning id into j1;
    insert into public.jobs(owner_id,niche,name,color,status,phase,completion) values
      (p_owner_id,p_niche,'Airport Express — 24 stalls','#60a5fa','On Track','Civil Work',40) returning id into j2;
    insert into public.jobs(owner_id,niche,name,color,status,phase,completion) values
      (p_owner_id,p_niche,'Riverside Mall — 8 stalls','#f87171','Delayed','Permitting',18) returning id into j3;
    insert into public.jobs(owner_id,niche,name,color,status,phase,completion) values
      (p_owner_id,p_niche,'Highway 9 DCFC — 6 stalls','#4ade80','On Track','Commissioning',88) returning id into j4;
    insert into public.jobs(owner_id,niche,name,color,status,phase,completion) values
      (p_owner_id,p_niche,'Tech Park — 16 stalls','#a78bfa','In Progress','Site Assessment',8) returning id into j5;
    insert into public.tasks(job_id,owner_id,title,status,priority,assignee_id,due_date,tag) values
      (j1,p_owner_id,'Mount charger units — row 1','in_progress','high',c2,'2026-06-15','Installation'),
      (j2,p_owner_id,'Pour equipment pads','in_progress','normal',c1,'2026-06-18','Civil Work'),
      (j3,p_owner_id,'Utility interconnection paperwork','todo','urgent',null,'2026-06-12','Permitting'),
      (j4,p_owner_id,'Network activation & test session','todo','normal',c2,'2026-06-16','Commissioning');
    insert into public.permits(job_id,owner_id,permit_number,type,status,submitted_date,notes) values
      (j1,p_owner_id,'E-26-7711','Electrical','Approved','2026-05-22',''),
      (j3,p_owner_id,'E-26-7790','Utility Interconnection','Under Review','2026-05-30','Awaiting utility study');

  elsif p_niche = 'om' then
    insert into public.crew_members(owner_id,name,initials,role) values
      (p_owner_id,'Hank G.','HG','Field Lead'),(p_owner_id,'Luis A.','LA','Technician'),
      (p_owner_id,'Beth O.','BO','Technician'),(p_owner_id,'Sam W.','SW','Inspector');
    select id into c1 from public.crew_members where owner_id=p_owner_id and initials='HG';
    select id into c2 from public.crew_members where owner_id=p_owner_id and initials='LA';
    insert into public.jobs(owner_id,niche,name,color,status,phase,completion) values
      (p_owner_id,p_niche,'Cedar Ridge PV Array','#F5A623','In Progress','Maintenance',60) returning id into j1;
    insert into public.jobs(owner_id,niche,name,color,status,phase,completion) values
      (p_owner_id,p_niche,'Harbor Rooftop System','#60a5fa','On Track','Inspection',45) returning id into j2;
    insert into public.jobs(owner_id,niche,name,color,status,phase,completion) values
      (p_owner_id,p_niche,'Mesa Verde Inverters','#f87171','Delayed','Repair',30) returning id into j3;
    insert into public.jobs(owner_id,niche,name,color,status,phase,completion) values
      (p_owner_id,p_niche,'Northgate BESS Bank','#a78bfa','On Track','Reporting',75) returning id into j4;
    insert into public.jobs(owner_id,niche,name,color,status,phase,completion) values
      (p_owner_id,p_niche,'Highway 9 Chargers','#4ade80','On Track','Optimization',90) returning id into j5;
    insert into public.jobs(owner_id,niche,name,color,status,phase,completion) values
      (p_owner_id,p_niche,'Westfield Substation','#2dd4bf','In Progress','Inspection',50) returning id into j6;
    insert into public.tasks(job_id,owner_id,title,status,priority,assignee_id,due_date,tag) values
      (j1,p_owner_id,'Replace combiner fuse — string 3','in_progress','high',c2,'2026-06-14','Repair'),
      (j2,p_owner_id,'Quarterly inverter inspection','todo','normal',c1,'2026-06-18','Inspection'),
      (j3,p_owner_id,'Swap failed optimizer — table 7','todo','urgent',c2,'2026-06-12','Repair'),
      (j6,p_owner_id,'Thermal scan — MV switchgear','todo','high',null,'2026-06-20','Inspection');
    insert into public.permits(job_id,owner_id,permit_number,type,status,submitted_date,notes) values
      (j6,p_owner_id,'W-26-044','Work Permit','Approved','2026-06-02','Live work clearance');

  elsif p_niche = 'consulting' then
    insert into public.crew_members(owner_id,name,initials,role) values
      (p_owner_id,'Dr. Amara K.','AK','Lead Consultant'),(p_owner_id,'Felix H.','FH','Analyst'),
      (p_owner_id,'Grace T.','GT','Analyst'),(p_owner_id,'Ivan P.','IP','Associate');
    select id into c1 from public.crew_members where owner_id=p_owner_id and initials='AK';
    select id into c2 from public.crew_members where owner_id=p_owner_id and initials='FH';
    insert into public.jobs(owner_id,niche,name,color,status,phase,completion) values
      (p_owner_id,p_niche,'Acme Corp Decarbonization','#60a5fa','In Progress','Analysis',55) returning id into j1;
    insert into public.jobs(owner_id,niche,name,color,status,phase,completion) values
      (p_owner_id,p_niche,'Northwind Feasibility Study','#F5A623','On Track','Assessment',30) returning id into j2;
    insert into public.jobs(owner_id,niche,name,color,status,phase,completion) values
      (p_owner_id,p_niche,'Solaris Portfolio Review','#a78bfa','On Track','Recommendation',70) returning id into j3;
    insert into public.jobs(owner_id,niche,name,color,status,phase,completion) values
      (p_owner_id,p_niche,'GreenGrid Implementation','#4ade80','Delayed','Implementation',40) returning id into j4;
    insert into public.tasks(job_id,owner_id,title,status,priority,assignee_id,due_date,tag) values
      (j1,p_owner_id,'Draft emissions baseline report','in_progress','high',c2,'2026-06-15','Analysis'),
      (j2,p_owner_id,'Site energy audit walkthrough','todo','normal',c1,'2026-06-19','Assessment'),
      (j3,p_owner_id,'Present recommendations deck','todo','urgent',c1,'2026-06-13','Recommendation'),
      (j4,p_owner_id,'Vendor RFP coordination','in_progress','normal',c2,'2026-06-17','Implementation');

  elsif p_niche = 'wind' then
    insert into public.crew_members(owner_id,name,initials,role) values
      (p_owner_id,'Erik N.','EN','Project Manager'),(p_owner_id,'Lara V.','LV','Wind Technician'),
      (p_owner_id,'Pavel R.','PR','Civil Engineer'),(p_owner_id,'Tess B.','TB','Technician');
    select id into c1 from public.crew_members where owner_id=p_owner_id and initials='EN';
    select id into c2 from public.crew_members where owner_id=p_owner_id and initials='LV';
    insert into public.jobs(owner_id,niche,name,color,status,phase,completion) values
      (p_owner_id,p_niche,'Ridgeline Wind — 80 MW','#60a5fa','In Progress','Construction',52) returning id into j1;
    insert into public.jobs(owner_id,niche,name,color,status,phase,completion) values
      (p_owner_id,p_niche,'Coastal Breeze — 45 MW','#F5A623','On Track','Permitting',28) returning id into j2;
    insert into public.jobs(owner_id,niche,name,color,status,phase,completion) values
      (p_owner_id,p_niche,'Highland Turbines — 30 MW','#a78bfa','Delayed','Wind Assessment',12) returning id into j3;
    insert into public.tasks(job_id,owner_id,title,status,priority,assignee_id,due_date,tag) values
      (j1,p_owner_id,'Turbine 4 nacelle install','in_progress','high',c2,'2026-06-15','Construction'),
      (j1,p_owner_id,'Crane mobilization plan','todo','normal',c1,'2026-06-18','Construction'),
      (j2,p_owner_id,'FAA lighting submittal','todo','urgent',null,'2026-06-12','Permitting'),
      (j3,p_owner_id,'Met mast data review','in_progress','normal',c1,'2026-06-20','Wind Assessment');
    insert into public.permits(job_id,owner_id,permit_number,type,status,submitted_date,notes) values
      (j2,p_owner_id,'W-26-1188','FAA','Under Review','2026-05-25','Obstruction evaluation'),
      (j1,p_owner_id,'W-26-1102','Environmental','Approved','2026-05-10','');

  elsif p_niche = 'hydro' then
    insert into public.crew_members(owner_id,name,initials,role) values
      (p_owner_id,'Mara D.','MD','Project Manager'),(p_owner_id,'Noah K.','NK','Civil Engineer'),
      (p_owner_id,'Iris L.','IL','Environmental Lead'),(p_owner_id,'Dan R.','DR','Technician');
    select id into c1 from public.crew_members where owner_id=p_owner_id and initials='MD';
    select id into c2 from public.crew_members where owner_id=p_owner_id and initials='NK';
    insert into public.jobs(owner_id,niche,name,color,status,phase,completion) values
      (p_owner_id,p_niche,'Riverbend Hydro — 25 MW','#60a5fa','In Progress','Construction',48) returning id into j1;
    insert into public.jobs(owner_id,niche,name,color,status,phase,completion) values
      (p_owner_id,p_niche,'Falls Creek Micro — 5 MW','#4ade80','On Track','Design',33) returning id into j2;
    insert into public.jobs(owner_id,niche,name,color,status,phase,completion) values
      (p_owner_id,p_niche,'Canyon Run — 18 MW','#a78bfa','Delayed','Environmental Study',16) returning id into j3;
    insert into public.tasks(job_id,owner_id,title,status,priority,assignee_id,due_date,tag) values
      (j1,p_owner_id,'Penstock weld inspection','in_progress','high',c2,'2026-06-15','Construction'),
      (j2,p_owner_id,'Turbine sizing calculations','todo','normal',c2,'2026-06-19','Design'),
      (j3,p_owner_id,'Fish passage study review','todo','urgent',null,'2026-06-12','Environmental Study');
    insert into public.permits(job_id,owner_id,permit_number,type,status,submitted_date,notes) values
      (j3,p_owner_id,'H-26-2200','FERC License','Under Review','2026-04-30','Stage 2 review'),
      (j1,p_owner_id,'H-26-2150','Water Rights','Approved','2026-05-05','');

  elsif p_niche = 'biogas' then
    insert into public.crew_members(owner_id,name,initials,role) values
      (p_owner_id,'Otto P.','OP','Project Manager'),(p_owner_id,'Hana S.','HS','Process Engineer'),
      (p_owner_id,'Bill C.','BC','Operator'),(p_owner_id,'Ruth M.','RM','Technician');
    select id into c1 from public.crew_members where owner_id=p_owner_id and initials='OP';
    select id into c2 from public.crew_members where owner_id=p_owner_id and initials='HS';
    insert into public.jobs(owner_id,niche,name,color,status,phase,completion) values
      (p_owner_id,p_niche,'Greenvalley Digester — 6 MW','#4ade80','In Progress','Construction',50) returning id into j1;
    insert into public.jobs(owner_id,niche,name,color,status,phase,completion) values
      (p_owner_id,p_niche,'Farmstead Biogas — 3 MW','#F5A623','On Track','Permitting',26) returning id into j2;
    insert into public.jobs(owner_id,niche,name,color,status,phase,completion) values
      (p_owner_id,p_niche,'Citywide Biomass — 9 MW','#a78bfa','Delayed','Feedstock Analysis',14) returning id into j3;
    insert into public.tasks(job_id,owner_id,title,status,priority,assignee_id,due_date,tag) values
      (j1,p_owner_id,'Digester membrane install','in_progress','high',c2,'2026-06-15','Construction'),
      (j2,p_owner_id,'Air quality permit submittal','todo','urgent',null,'2026-06-12','Permitting'),
      (j3,p_owner_id,'Feedstock supply contract review','in_progress','normal',c1,'2026-06-20','Feedstock Analysis');
    insert into public.permits(job_id,owner_id,permit_number,type,status,submitted_date,notes) values
      (j2,p_owner_id,'G-26-5500','Air Quality','Under Review','2026-05-18','Emissions modeling'),
      (j1,p_owner_id,'G-26-5410','Environmental','Approved','2026-05-02','');
  end if;
end;
$$;
