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
   a.question_id,a.result,a.submitted_at as at,a.id::text tie,a.grading_method
 from public.learning_attempts a join roster r on r.user_id=a.user_id
 where a.submitted_at>=p_from and a.submitted_at<p_to
 union all
 select a.user_id,r.grade,case a.exam_type when 'industrial' then 'INDUSTRIAL' else 'ENGINEER' end,
   a.question_id,case when b.question_id is null or b.payload->>'answer' is null then 'ungraded'
     when a.answer::text=b.payload->>'answer' then 'correct' else 'incorrect' end,
   to_timestamp(a.attempted_at/1000.0),coalesce(a.answer::text,''),'written'::text
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
 'gradingMethods',jsonb_build_object('self',(select count(distinct user_id) from attempts where grading_method='self' and result in ('correct','incorrect')),'automatic',(select count(distinct user_id) from attempts where grading_method='automatic' and result in ('correct','incorrect'))),
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

