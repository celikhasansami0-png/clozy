-- Bionova revision — simplification: tighter storage + comprehensive indexes. Re-runnable.

-- Storage: cap document uploads at 10 MB.
update storage.buckets set file_size_limit = 10485760 where id = 'project-documents';

-- owner_id / project_id indexes across all tables.
create index if not exists jobs_owner_idx           on public.jobs(owner_id, created_at desc);
create index if not exists jobs_owner_archived       on public.jobs(owner_id, is_archived);
create index if not exists tasks_owner_idx           on public.tasks(owner_id);
create index if not exists tasks_job_idx             on public.tasks(job_id);
create index if not exists permits_owner_idx         on public.permits(owner_id);
create index if not exists permits_job_idx           on public.permits(job_id);
create index if not exists crew_owner_idx            on public.crew_members(owner_id);
create index if not exists documents_owner_idx       on public.documents(owner_id);
create index if not exists documents_project_idx2    on public.documents(project_id);
create index if not exists notifications_owner_idx2  on public.notifications(owner_id, created_at desc);
create index if not exists activity_owner_idx        on public.activity_logs(owner_id);
create index if not exists activity_project_idx2     on public.activity_logs(project_id);
create index if not exists notif_settings_owner_idx  on public.notification_settings(owner_id);
