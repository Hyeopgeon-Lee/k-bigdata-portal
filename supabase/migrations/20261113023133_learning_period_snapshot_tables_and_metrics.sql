
-- Closed weekly/monthly aggregates. Historical member/grade snapshots are immutable by routine reruns.
create table if not exists public.learning_period_members (
 period_type text not null check (period_type in ('week','month')),
 period_start date not null,
 user_id uuid not null,
 grade smallint not null check (grade in (1,2)),
 captured_at timestamptz not null default now(),
 primary key (period_type,period_start,user_id)
);
create table if not exists public.learning_period_stats (
 period_type text not null check (period_type in ('week','month')),
 period_start date not null,
 period_end date not null,
 grade smallint not null check (grade in (0,1,2)),
 cohort_size integer not null default 0,
 metrics jsonb not null default '{}'::jsonb,
 study_metrics jsonb not null default '{}'::jsonb,
 top_wrong jsonb not null default '[]'::jsonb,
 cohort_basis text not null check (cohort_basis in ('on_time','late_backfill')),
 calculated_at timestamptz not null default now(),
 primary key (period_type,period_start,grade)
);
create table if not exists public.learning_aggregation_jobs (
 id bigint generated always as identity primary key,
 period_type text not null check (period_type in ('week','month')),
 period_start date not null,
 job_status text not null check (job_status in ('running','completed','failed')),
 started_at timestamptz not null default now(),
 finished_at timestamptz,
 error_message text,
 triggered_by text not null default 'schedule'
);
create index if not exists learning_aggregation_jobs_recent on public.learning_aggregation_jobs (period_type,period_start,started_at desc);
create index if not exists learning_attempts_time_user on public.learning_attempts (submitted_at,user_id);
alter table public.learning_period_members enable row level security;
alter table public.learning_period_stats enable row level security;
alter table public.learning_aggregation_jobs enable row level security;
revoke all on public.learning_period_members,public.learning_period_stats,public.learning_aggregation_jobs from public,anon,authenticated;
grant select,insert,update,delete on public.learning_period_members,public.learning_period_stats,public.learning_aggregation_jobs to service_role;
grant usage,select on sequence public.learning_aggregation_jobs_id_seq to service_role;

-- Single SQL-side aggregation for live pages and persisted closed periods.
create or replace function public.learning_compute_interval(
 p_from timestamptz,p_to timestamptz,p_grade smallint,
 p_roster_type text,p_roster_period text,p_roster_start date
) returns jsonb language plpgsql security definer set search_path = ''
as $func$
declare v_result jsonb;
begin
 if p_from is null or p_to is null or p_to<=p_from
   or p_to-p_from>interval '32 days' or p_grade not in (0,1,2)
   or p_roster_type not in ('live','snapshot') then
   raise exception 'INVALID_AGGREGATION_PARAMETERS';
 end if;
 with members as materialized (
   select p.user_id,p.academic_year::smallint as grade
     from public.profiles p
     where p_roster_type='live' and p.signup_type='student'
       and p.approval_status='approved' and p.enrollment_status='enrolled'
       and p.academic_year in (1,2)
   union all
   select m.user_id,m.grade
     from public.learning_period_members m
     where p_roster_type='snapshot' and m.period_type=p_roster_period
       and m.period_start=p_roster_start
 ),
 roster as materialized (
   select user_id from members where p_grade=0 or grade=p_grade
 ),
 attempts as materialized (
   select a.user_id,a.bank,a.question_id,a.result,a.grading_method,
     case when a.bank='coding' then split_part(a.question_id,'-',1)
       when a.bank='ncp' then 'NCP' else 'PRACTICAL' end as subject
   from public.learning_attempts a join roster r on r.user_id=a.user_id
   where a.submitted_at>=p_from and a.submitted_at<p_to
 ),
 base as (
  select count(*)::integer as attempts,
    count(distinct user_id)::integer as active_students,
    count(distinct (user_id,bank,question_id))::integer as unique_problems,
    count(*) filter(where grading_method='self' and result='correct')::integer as self_correct,
    count(*) filter(where grading_method='self' and result in ('correct','incorrect'))::integer as self_total,
    count(*) filter(where grading_method='automatic' and result='correct')::integer as auto_correct,
    count(*) filter(where grading_method='automatic' and result in ('correct','incorrect'))::integer as auto_total,
    count(*) filter(where result in ('ungraded','timeout'))::integer as pending
  from attempts
 ),
 by_subject as (
  select subject, count(*)::integer as attempts,
    count(distinct (user_id,question_id))::integer as unique_problems,
    count(*) filter(where result='incorrect')::integer as wrong
  from attempts group by subject
 ),
 subjects as (
  select coalesce(jsonb_object_agg(k.subject,jsonb_build_object(
   'attempts',coalesce(s.attempts,0),'unique',coalesce(s.unique_problems,0),'wrong',coalesce(s.wrong,0)
  )),'{}'::jsonb) as data
  from (values ('JAVA'),('C'),('PYTHON'),('LINUX'),('NCP'),('PRACTICAL')) k(subject)
  left join by_subject s on s.subject=k.subject
 ),
 wrong_questions as (
  select bank||':'||question_id as question,count(*)::integer as tally
  from attempts where result='incorrect' group by bank,question_id
  order by tally desc,question limit 12
 ),
 study_sessions as materialized (
  select s.user_id,(s.started_at at time zone 'Asia/Seoul')::date as study_date,
   greatest(0,case when s.status='needs_review' then 0
     when s.status='active' then floor(extract(epoch from
       (coalesce(s.paused_at,now())-s.started_at)))::integer-coalesce(s.break_seconds,0)
     else coalesce(s.duration_seconds,0) end)::integer as seconds
  from public.study_sessions s join roster r on r.user_id=s.user_id
  where s.started_at>=p_from and s.started_at<p_to
 ),
 study_days as (select distinct user_id,study_date from study_sessions),
 study_plans as materialized (
  select w.user_id,w.week_start,w.weekdays
  from public.study_weekly_plans w join roster r on r.user_id=w.user_id
  where w.week_start >= (p_from at time zone 'Asia/Seoul')::date-6
    and w.week_start < (p_to at time zone 'Asia/Seoul')::date+1
 ),
 scheduled_days as (
  select distinct w.user_id,(w.week_start+(d.day-1))::date as study_date
  from study_plans w cross join lateral unnest(w.weekdays) as d(day)
  where d.day between 1 and 7
    and (w.week_start+(d.day-1))::date >= (p_from at time zone 'Asia/Seoul')::date
    and (w.week_start+(d.day-1))::date < (p_to at time zone 'Asia/Seoul')::date
    and (w.week_start+(d.day-1))::date < (now() at time zone 'Asia/Seoul')::date
 ),
 study as (
  select (select count(distinct user_id) from study_plans)::integer as plan_students,
    (select count(distinct user_id) from study_plans where cardinality(weekdays)=0)::integer as zero_plan_students,
    (select count(*) from scheduled_days)::integer as due_days,
    (select count(*) from scheduled_days d join study_days s on s.user_id=d.user_id and s.study_date=d.study_date)::integer as attended_planned_days,
    (select count(*) from study_days)::integer as attended_days,
    (select coalesce(sum(seconds),0) from study_sessions)::bigint as study_seconds
 )
 select jsonb_build_object(
  'cohortSize',(select count(*) from roster),
  'current',jsonb_build_object(
   'attempts',b.attempts,'unique',b.unique_problems,'activeStudents',b.active_students,
   'participationRate',case when (select count(*) from roster)>0
     then round(b.active_students*100.0/(select count(*) from roster))::integer else null end,
   'selfCorrect',b.self_correct,'selfTotal',b.self_total,
   'selfAccuracy',case when b.self_total>0 then round(b.self_correct*100.0/b.self_total)::integer else null end,
   'autoCorrect',b.auto_correct,'autoTotal',b.auto_total,
   'autoAccuracy',case when b.auto_total>0 then round(b.auto_correct*100.0/b.auto_total)::integer else null end,
   'pending',b.pending,'subjects',subjects.data
  ),
  'topWrong',case when (select count(*) from roster) between 1 and 4 then '[]'::jsonb
    else coalesce((select jsonb_agg(jsonb_build_object('question',question,'count',tally))
       from wrong_questions),'[]'::jsonb) end,
  'smallCohortHidden',(select count(*) from roster) between 1 and 4,
  'study',jsonb_build_object(
    'plannedStudents',study.plan_students,'zeroPlanStudents',study.zero_plan_students,
    'dueDays',study.due_days,'attendedPlannedDays',study.attended_planned_days,
    'missedDays',study.due_days-study.attended_planned_days,
    'attendedDays',study.attended_days,'studySeconds',study.study_seconds
  )
 ) into v_result
 from base b cross join subjects cross join study;
 return v_result;
end;
$func$;
revoke all on function public.learning_compute_interval(timestamptz,timestamptz,smallint,text,text,date) from public,anon,authenticated;
grant execute on function public.learning_compute_interval(timestamptz,timestamptz,smallint,text,text,date) to service_role;

create or replace function public.learning_refresh_closed_period(
 p_period_type text,p_period_start date,p_trigger text default 'schedule'
) returns jsonb language plpgsql security definer set search_path=''
as $func$
declare
 v_end date;
 v_job bigint;
 v_grade smallint;
 v_payload jsonb;
 v_basis text;
 v_error text;
begin
 if p_period_type not in ('week','month') or p_period_start is null then
  raise exception 'INVALID_PERIOD';
 end if;
 if (p_period_type='week' and extract(isodow from p_period_start)<>1)
   or (p_period_type='month' and extract(day from p_period_start)<>1) then
  raise exception 'INVALID_PERIOD_START';
 end if;
 v_end:=case when p_period_type='week' then p_period_start+7
   else (p_period_start+interval '1 month')::date end;
 if v_end>(now() at time zone 'Asia/Seoul')::date then
  raise exception 'PERIOD_NOT_FINISHED';
 end if;
 perform pg_advisory_xact_lock(hashtext('kbigdata:learning_period'),
   hashtext(p_period_type||':'||p_period_start::text));
 insert into public.learning_aggregation_jobs(period_type,period_start,job_status,triggered_by)
 values(p_period_type,p_period_start,'running',left(coalesce(p_trigger,'schedule'),32))
 returning id into v_job;
 begin
  select cohort_basis into v_basis from public.learning_period_stats
   where period_type=p_period_type and period_start=p_period_start and grade=0;
  if v_basis is null then
   v_basis:=case when now() <= ((v_end::timestamp at time zone 'Asia/Seoul')+interval '24 hours')
     then 'on_time' else 'late_backfill' end;
   insert into public.learning_period_members(period_type,period_start,user_id,grade)
    select p_period_type,p_period_start,p.user_id,p.academic_year
    from public.profiles p where p.signup_type='student'
      and p.approval_status='approved' and p.enrollment_status='enrolled'
      and p.academic_year in (1,2)
    on conflict do nothing;
  end if;
  for v_grade in select unnest(array[0,1,2]::smallint[]) loop
   select public.learning_compute_interval(
    p_period_start::timestamp at time zone 'Asia/Seoul',
    v_end::timestamp at time zone 'Asia/Seoul',
    v_grade,'snapshot',p_period_type,p_period_start) into v_payload;
   insert into public.learning_period_stats(
    period_type,period_start,period_end,grade,cohort_size,metrics,study_metrics,
    top_wrong,cohort_basis,calculated_at)
   values(p_period_type,p_period_start,v_end,v_grade,
    (v_payload->>'cohortSize')::integer,v_payload->'current',v_payload->'study',
    v_payload->'topWrong',v_basis,now())
   on conflict(period_type,period_start,grade) do update set
    cohort_size=excluded.cohort_size,metrics=excluded.metrics,
    study_metrics=excluded.study_metrics,top_wrong=excluded.top_wrong,
    cohort_basis=excluded.cohort_basis,calculated_at=excluded.calculated_at,
    period_end=excluded.period_end;
  end loop;
  update public.learning_aggregation_jobs set job_status='completed',finished_at=now()
   where id=v_job;
  return jsonb_build_object('ok',true,'period',p_period_type,'start',p_period_start,
    'end',v_end,'cohortBasis',v_basis,'jobId',v_job);
 exception when others then
  v_error:=sqlerrm;
  update public.learning_aggregation_jobs set job_status='failed',finished_at=now(),
    error_message=left(v_error,400) where id=v_job;
  return jsonb_build_object('ok',false,'error','AGGREGATION_FAILED','jobId',v_job);
 end;
end;
$func$;
revoke all on function public.learning_refresh_closed_period(text,date,text) from public,anon,authenticated;
grant execute on function public.learning_refresh_closed_period(text,date,text) to service_role;
