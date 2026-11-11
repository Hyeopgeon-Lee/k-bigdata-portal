-- Admin-controlled weekly learning email switches.
-- The public table deliberately has no authenticated/anon RLS policies:
-- only the guarded learning-admin Edge Function (service role) can edit it.
create table if not exists public.weekly_report_controls (
  report_type text primary key check (report_type in ('super_admin', 'student')),
  enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
alter table public.weekly_report_controls enable row level security;
revoke all on public.weekly_report_controls from anon, authenticated;
grant select, insert, update on public.weekly_report_controls to service_role;
insert into public.weekly_report_controls (report_type, enabled)
values ('super_admin', true), ('student', false)
on conflict (report_type) do nothing;
