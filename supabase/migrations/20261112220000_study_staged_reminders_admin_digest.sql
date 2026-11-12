-- Separate each reminder round by kind, retaining existing first-round and absence records.
alter table public.study_email_logs drop constraint if exists study_email_logs_kind_check;
alter table public.study_email_logs add constraint study_email_logs_kind_check
  check (kind in ('absence','plan_reminder','plan_reminder_mon17','plan_reminder_tue12'));

-- Only server-side service role processes the Wednesday faculty digest.
create table if not exists public.study_plan_admin_reports (
  week_start date not null check (extract(isodow from week_start)=1),
  report_type text not null check (report_type='weekly_status'),
  status text not null default 'pending' check (status in ('pending','sent','failed')),
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  provider_id text,
  error_message text,
  primary key (week_start,report_type)
);
alter table public.study_plan_admin_reports enable row level security;
revoke all on table public.study_plan_admin_reports from anon, authenticated;
grant select,insert,update on table public.study_plan_admin_reports to service_role;
