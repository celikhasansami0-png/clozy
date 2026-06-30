-- Doppio restructure — unify Documents (permits + file uploads), free-text
-- industry, larger storage limit, and industry-neutral demo seed.
-- Intended to run once, after migrations 001–007.

-- 1) Profile fields (display only — never drive UI logic).
alter table public.profiles add column if not exists industry text;
alter table public.profiles add column if not exists client_count text;

-- 2) Merge `permits` + the file-upload `documents` into one unified `documents`.
do $$
begin
  if exists (select 1 from information_schema.columns
              where table_schema='public' and table_name='documents' and column_name='file_name')
     and exists (select 1 from information_schema.tables
                  where table_schema='public' and table_name='permits') then
    -- Old file-upload table still in original shape and permits still present.
    alter table public.documents rename to document_files;     -- free the name
    alter table public.permits   rename to documents;           -- permits becomes the backbone
    alter table public.documents rename column job_id to project_id;
    alter table public.documents rename column permit_number to doc_number;

    alter table public.documents add column if not exists file_name text;
    alter table public.documents add column if not exists file_path text;
    alter table public.documents add column if not exists file_size bigint;
    alter table public.documents add column if not exists file_type text;
    alter table public.documents add column if not exists uploaded_by uuid;

    -- Bring existing uploaded files across as file-bearing document records.
    insert into public.documents
      (project_id, owner_id, doc_number, type, status, submitted_date, notes,
       file_name, file_path, file_size, file_type, uploaded_by, created_at)
    select project_id, owner_id, file_name, 'File', 'Approved', created_at::date, '',
           file_name, file_path, file_size, file_type, owner_id, created_at
    from public.document_files;

    drop table public.document_files cascade;
  end if;
end $$;

-- Ensure the unified shape regardless of whether the merge ran this time.
alter table public.documents add column if not exists doc_number  text;
alter table public.documents add column if not exists file_name   text;
alter table public.documents add column if not exists file_path   text;
alter table public.documents add column if not exists file_size   bigint;
alter table public.documents add column if not exists file_type   text;
alter table public.documents add column if not exists uploaded_by uuid;
alter table public.documents alter column submitted_date drop not null;

alter table public.documents enable row level security;
drop policy if exists "Users manage own permits"   on public.documents;
drop policy if exists "Users manage own documents" on public.documents;
create policy "Users manage own documents" on public.documents
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create index if not exists documents_owner_idx   on public.documents(owner_id);
create index if not exists documents_project_idx on public.documents(project_id);

-- 3) Storage: 50 MB per file (was 10 MB).
update storage.buckets set file_size_limit = 52428800 where id = 'project-documents';

-- 4) Industry-neutral demo seed (single-arg). Replaces the niche-based seeds.
drop function if exists public.seed_demo_data(uuid, text);
drop function if exists public.seed_demo_data(uuid);
create or replace function public.seed_demo_data(p_owner_id uuid)
returns void language plpgsql security definer as $$
declare j1 uuid; j2 uuid; j3 uuid; j4 uuid; m1 uuid; m2 uuid; m3 uuid; m4 uuid; m5 uuid;
begin
  -- Agency team (digital / creative agency roles).
  insert into public.crew_members(owner_id,name,initials,role) values
    (p_owner_id,'Alex Morgan','AM','Project Manager') returning id into m1;
  insert into public.crew_members(owner_id,name,initials,role) values
    (p_owner_id,'Sam Rivera','SR','Designer') returning id into m2;
  insert into public.crew_members(owner_id,name,initials,role) values
    (p_owner_id,'Jordan Lee','JL','Developer') returning id into m3;
  insert into public.crew_members(owner_id,name,initials,role) values
    (p_owner_id,'Taylor Kim','TK','Copywriter') returning id into m4;
  insert into public.crew_members(owner_id,name,initials,role) values
    (p_owner_id,'Priya Shah','PS','Account Manager') returning id into m5;

  -- Four agency client projects (dusty distinct colors).
  insert into public.jobs(owner_id,niche,name,color,status,phase,completion) values
    (p_owner_id,'general','Website Redesign for TechCorp','#CC785C','In Progress','In Progress',55) returning id into j1;
  insert into public.jobs(owner_id,niche,name,color,status,phase,completion) values
    (p_owner_id,'general','Q4 Social Media Campaign for Retailer','#7A9B76','On Track','Planning',30) returning id into j2;
  insert into public.jobs(owner_id,niche,name,color,status,phase,completion) values
    (p_owner_id,'general','Brand Identity Project for Startup','#9B7EA8','In Progress','Review',65) returning id into j3;
  insert into public.jobs(owner_id,niche,name,color,status,phase,completion) values
    (p_owner_id,'general','Mobile App Development for FinTech','#6B8CAE','Delayed','In Progress',40) returning id into j4;

  -- Realistic agency tasks across the client projects.
  insert into public.tasks(job_id,owner_id,title,status,priority,assignee_id,due_date,tag) values
    (j1,p_owner_id,'Initial client brief and discovery','done','high',m1,now()-interval '6 day','Planning'),
    (j1,p_owner_id,'Design mockups review','in_progress','urgent',m2,now()+interval '2 day','Review'),
    (j1,p_owner_id,'Client feedback implementation','todo','high',m3,now()+interval '7 day','In Progress'),
    (j2,p_owner_id,'Initial client brief and discovery','in_progress','high',m5,now()+interval '3 day','Planning'),
    (j2,p_owner_id,'Final deliverable handoff','todo','normal',m4,now()+interval '12 day','Review'),
    (j3,p_owner_id,'Design mockups review','done','normal',m2,now()-interval '1 day','Review'),
    (j3,p_owner_id,'Client feedback implementation','in_progress','urgent',m3,now()+interval '1 day','In Progress'),
    (j3,p_owner_id,'Invoice and project closeout','todo','normal',m1,now()+interval '9 day','Review'),
    (j4,p_owner_id,'Initial client brief and discovery','done','high',m1,now()-interval '10 day','Planning'),
    (j4,p_owner_id,'Final deliverable handoff','todo','high',m3,now()+interval '5 day','In Progress'),
    (j4,p_owner_id,'Invoice and project closeout','todo','normal',m5,now()+interval '14 day','Review');

  -- Agency documents (proposals, briefs, invoices, reports).
  insert into public.documents(project_id,owner_id,doc_number,type,status,submitted_date,notes) values
    (j1,p_owner_id,'DOC-2026-001','Proposal','Approved',(now()-interval '20 day')::date,'Client Proposal'),
    (j1,p_owner_id,'DOC-2026-002','Brief','Under Review',(now()-interval '14 day')::date,'Project Brief'),
    (j2,p_owner_id,'DOC-2026-003','Brief','Pending',(now()-interval '5 day')::date,'Creative Brief'),
    (j3,p_owner_id,'DOC-2026-004','Invoice','Sent',(now()-interval '3 day')::date,'Invoice'),
    (j4,p_owner_id,'DOC-2026-005','Report','Approved',(now()-interval '8 day')::date,'Status Report');
end $$;
