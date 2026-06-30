-- Scout Day 4 audit — storage limit + performance indexes. Safe to re-run.

-- ── Storage: cap document uploads at 25 MB ──────────────────────────────────
update storage.buckets set file_size_limit = 26214400 where id = 'project-documents';

-- ── Performance indexes for owner-scoped / hot queries ──────────────────────
create index if not exists jobs_owner_idx        on public.jobs(owner_id, created_at desc);
create index if not exists jobs_owner_archived    on public.jobs(owner_id, is_archived);
create index if not exists tasks_owner_idx        on public.tasks(owner_id);
create index if not exists tasks_job_idx          on public.tasks(job_id);
create index if not exists permits_owner_idx      on public.permits(owner_id);
create index if not exists crew_owner_idx         on public.crew_members(owner_id);
