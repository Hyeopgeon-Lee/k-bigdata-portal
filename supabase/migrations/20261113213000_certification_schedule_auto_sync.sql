-- Official annual exam schedule sync: preserve manual overrides and audit every source.
alter table public.certification_exam_schedules
  add column if not exists source_type text not null default 'manual'
    check (source_type in ('manual','qnet_api','dataq_official')),
  add column if not exists source_synced_at timestamptz,
  add column if not exists manual_override boolean not null default false;

create index if not exists certification_exam_sync_source_idx
 on public.certification_exam_schedules(source_type,exam_year);

create table if not exists public.certification_schedule_sync_runs (
 id bigint generated always as identity primary key,
 source_type text not null check (source_type in ('qnet_api','dataq_official')),
 run_mode text not null check (run_mode in ('dry_run','production')),
 status text not null check (status in ('success','not_published','missing_key','source_unavailable','parse_failed','db_failed')),
 source_year integer,
 candidate_events integer not null default 0,
 inserted_events integer not null default 0,
 updated_events integer not null default 0,
 unchanged_events integer not null default 0,
 skipped_events integer not null default 0,
 message text not null default '' check (char_length(message)<=400),
 created_at timestamptz not null default now()
);
create index if not exists certification_schedule_sync_runs_latest_idx
 on public.certification_schedule_sync_runs(created_at desc);
alter table public.certification_schedule_sync_runs enable row level security;
create policy certification_schedule_sync_admin_read
 on public.certification_schedule_sync_runs for select to authenticated
 using ((select public.portal_super_admin_allowed()));
revoke all on public.certification_schedule_sync_runs from anon,authenticated;
grant select on public.certification_schedule_sync_runs to authenticated;
comment on table public.certification_schedule_sync_runs is 'Admin-visible source sync diagnostics; service-only writes, never API keys.';
