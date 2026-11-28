-- Normalize Python problem IDs (PY-...) consistently in new and existing admin metrics.

-- Additive aggregate for administrator learning visualization; no student rows exposed.
create or replace function private.learning_chart_metrics(
 p_from timestamptz,p_to timestamptz,p_grade smallint,p_roster_type text,p_roster_period text,p_roster_start date
) returns jsonb language sql stable security invoker set search_path = '' as $chart$
with members as materialized (
 select p.user_id,p.academic_year::smallint grade from public.profiles p
 where p_roster_type='live' and p.signup_type='student' and p.approval_status='approved'
   and p.enrollment_status='enrolled' and p.academic_year in (1,2)
 union all
 select m.user_id,m.grade from public.learning_period_members m
 where p_roster_type='snapshot' and m.period_type=p_roster_period and m.period_start=p_roster_start
), roster as materialized (
 select user_id,grade from members where p_grade=0 or grade=p_grade
), attempts as materialized (
 select a.user_id,r.grade,case when a.bank='coding' then case split_part(a.question_id,'-',1) when 'PY' then 'PYTHON' else split_part(a.question_id,'-',1) end
   when a.bank='ncp' then 'NCP' else 'PRACTICAL' end subject,
   a.question_id,a.result,a.submitted_at as at,a.id::text tie
 from public.learning_attempts a join roster r on r.user_id=a.user_id
 where a.submitted_at>=p_from and a.submitted_at<p_to
 union all
 select a.user_id,r.grade,case a.exam_type when 'industrial' then 'INDUSTRIAL' else 'ENGINEER' end,
   a.question_id,case when b.question_id is null or b.payload->>'answer' is null then 'ungraded'
     when a.answer::text=b.payload->>'answer' then 'correct' else 'incorrect' end,
   to_timestamp(a.attempted_at/1000.0),coalesce(a.answer::text,'')
 from public.written_learning_attempts a join roster r on r.user_id=a.user_id
 left join public.written_question_bank b on b.question_id=a.question_id and b.exam_type=a.exam_type
 where a.exam_type in ('industrial','engineer')
   and a.attempted_at>=extract(epoch from p_from)*1000 and a.attempted_at<extract(epoch from p_to)*1000
), subject_data as (
 select subject,count(*) attempts,count(distinct user_id) participants,
   count(*) filter(where result='incorrect') wrong_attempts
 from attempts group by subject
), latest as (
 select distinct on (user_id,subject,question_id) user_id,subject,question_id,result
 from attempts
 order by user_id,subject,question_id,(result in ('correct','incorrect')) desc nulls last,at desc,tie desc
), question_students as (
 select subject,question_id,count(*) participants,
   count(*) filter(where result='correct') correct_students,
   count(*) filter(where result='incorrect') incorrect_students,
   count(*) filter(where result not in ('correct','incorrect') or result is null) ungraded_students
 from latest group by subject,question_id
), question_attempts as (
 select subject,question_id,count(*) attempts,count(*) filter(where result='incorrect') wrong_attempts
 from attempts group by subject,question_id
), ranked as (
 select s.*,a.attempts,a.wrong_attempts,
 row_number() over(partition by s.subject order by s.incorrect_students desc,s.participants desc,a.wrong_attempts desc,s.question_id) rn
 from question_students s join question_attempts a using(subject,question_id)
), daily as (
 select (at at time zone 'Asia/Seoul')::date as day_date,
 count(distinct user_id) filter(where grade=1) grade1,
 count(distinct user_id) filter(where grade=2) grade2
 from attempts group by 1
), days as (
 select x::date as day_date from generate_series(
   (p_from at time zone 'Asia/Seoul')::date::timestamp,
   ((p_to-interval '1 microsecond') at time zone 'Asia/Seoul')::date::timestamp,
   interval '1 day') x
)
select jsonb_build_object(
 'cohortSize',(select count(*) from roster),
 'activeStudents',(select count(distinct user_id) from attempts),
 'attempts',(select count(*) from attempts),
 'unique',(select count(distinct (user_id,subject,question_id)) from attempts),
 'subjects',coalesce((select jsonb_object_agg(k.subject,jsonb_build_object(
    'participants',coalesce(s.participants,0),'attempts',coalesce(s.attempts,0),'wrongAttempts',coalesce(s.wrong_attempts,0)))
   from (values ('JAVA'),('C'),('PYTHON'),('LINUX'),('NCP'),('PRACTICAL'),('INDUSTRIAL'),('ENGINEER')) k(subject)
   left join subject_data s using(subject)),'{}'::jsonb),
 'grades',coalesce((select jsonb_agg(jsonb_build_object('grade',g.grade,
    'cohortSize',(select count(*) from roster r where r.grade=g.grade),
    'activeStudents',(select count(distinct user_id) from attempts a where a.grade=g.grade),
    'attempts',(select count(*) from attempts a where a.grade=g.grade)) order by g.grade)
    from (values (1),(2)) g(grade) where p_grade=0 or g.grade=p_grade),'[]'::jsonb),
 'questions',case when (select count(*) from roster) between 1 and 4 then '[]'::jsonb
   else coalesce((select jsonb_agg(jsonb_build_object('subject',subject,'question',question_id,
     'participants',participants,'correctStudents',correct_students,'incorrectStudents',incorrect_students,
     'ungradedStudents',ungraded_students,'attempts',attempts,'wrongAttempts',wrong_attempts)
     order by incorrect_students desc,participants desc,wrong_attempts desc,subject,question_id)
     from ranked where rn<=12),'[]'::jsonb) end,
 'smallCohortHidden',(select count(*) from roster) between 1 and 4,
 'daily',coalesce((select jsonb_agg(jsonb_build_object('date',days.day_date,
     'grade1',coalesce(daily.grade1,0),'grade2',coalesce(daily.grade2,0)) order by days.day_date)
   from days left join daily using(day_date)),'[]'::jsonb)
)
$chart$;
revoke all on function private.learning_chart_metrics(timestamptz,timestamptz,smallint,text,text,date) from public,anon,authenticated;
grant execute on function private.learning_chart_metrics(timestamptz,timestamptz,smallint,text,text,date) to service_role;

-- Preserve the existing service-only aggregator and all its original metrics,
-- and attach the new anonymous chart data to future period snapshots.
CREATE OR REPLACE FUNCTION public.learning_compute_interval(p_from timestamp with time zone, p_to timestamp with time zone, p_grade smallint, p_roster_type text, p_roster_period text, p_roster_start date)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
     case when a.bank='coding' then case split_part(a.question_id,'-',1) when 'PY' then 'PYTHON' else split_part(a.question_id,'-',1) end
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
   'pending',b.pending,'subjects',subjects.data,
   'chartStats',private.learning_chart_metrics(p_from,p_to,p_grade,p_roster_type,p_roster_period,p_roster_start)
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
$function$
;

CREATE OR REPLACE FUNCTION public.admin_learning_answers(p_period text, p_start date, p_grade integer, p_subject text, p_wrong boolean, p_offset integer)
 RETURNS TABLE(student text, submitted_at timestamp with time zone, question_id text, result text, answer_text text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 today date := (now() at time zone 'Asia/Seoul')::date;
 current_start date;
 period_end date;
begin
 if public.portal_super_admin_allowed() is not true then raise exception 'ADMIN_REQUIRED' using errcode='42501'; end if;
 if p_period not in ('week','month') or p_grade not in (0,1,2) or p_offset < 0 then raise exception 'INVALID_FILTER'; end if;
 current_start := date_trunc(p_period,today::timestamp)::date;
 if p_start > current_start or date_trunc(p_period,p_start::timestamp)::date <> p_start then raise exception 'INVALID_PERIOD'; end if;
 period_end := case when p_period='week' then p_start+7 else (p_start+interval '1 month')::date end;
 return query
 select p.full_name,a.submitted_at,a.question_id,a.result,a.answer_text
 from public.learning_attempts a
 left join public.profiles p on p.user_id=a.user_id
 left join public.learning_period_members m on m.user_id=a.user_id and m.period_type=p_period and m.period_start=p_start
 where a.submitted_at >= (p_start::timestamp at time zone 'Asia/Seoul')
 and a.submitted_at < (period_end::timestamp at time zone 'Asia/Seoul')
 and (case when p_start=current_start then
   p.signup_type='student' and p.approval_status='approved' and p.enrollment_status='enrolled' and p.academic_year in (1,2) and (p_grade=0 or p.academic_year=p_grade)
 else m.user_id is not null and (p_grade=0 or m.grade=p_grade) end)
 and (not p_wrong or a.result='incorrect')
 and (case a.bank when 'coding' then case split_part(a.question_id,'-',1) when 'PY' then 'PYTHON' else split_part(a.question_id,'-',1) end when 'ncp' then 'NCP' else 'PRACTICAL' end)=p_subject
 order by a.submitted_at desc,a.id desc limit 26 offset p_offset;
end $function$
;
