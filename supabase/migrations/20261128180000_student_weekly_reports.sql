-- Immutable weekly summaries. Only the server-side authorized report API accesses these rows.
create table public.student_weekly_reports (
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null check (extract(isodow from week_start)=1),
  created_at timestamptz not null default now(),
  payload jsonb not null check (jsonb_typeof(payload)='object'),
  completed_tasks text[] not null default '{}',
  primary key (user_id,week_start)
);
alter table public.student_weekly_reports enable row level security;
revoke all on public.student_weekly_reports from public, anon, authenticated;
grant select,insert,update on public.student_weekly_reports to service_role;
-- Atomic task update, preventing simultaneous browser tabs from overwriting each other.
create function public.student_weekly_report_task(p_user uuid,p_week date,p_task text,p_done boolean)
returns text[] language sql security invoker set search_path='' as $$
  update public.student_weekly_reports
  set completed_tasks=case when p_done then array(select distinct x from unnest(completed_tasks||array[p_task]) x)
                           else array_remove(completed_tasks,p_task) end
  where user_id=p_user and week_start=p_week
    and exists(select 1 from jsonb_array_elements(payload->'tasks') t where t->>'id'=p_task)
  returning completed_tasks;
$$;
revoke all on function public.student_weekly_report_task(uuid,date,text,boolean) from public,anon,authenticated;
grant execute on function public.student_weekly_report_task(uuid,date,text,boolean) to service_role;
