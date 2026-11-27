-- A common read model, preserving existing exam-specific session writers and history.
create or replace view public.portal_mock_sessions with (security_invoker=true) as
select id,user_id,exam_type,exam_year,exam_round,started_at,deadline,submitted_at,question_ids,answers,result,mode
from public.written_mock_sessions
union all
select id,user_id,exam_type,exam_year,exam_round,started_at,deadline,submitted_at,question_ids,answers,result,mode
from public.written_mock_engineer_sessions;
revoke all on public.portal_mock_sessions from public,anon;
grant select on public.portal_mock_sessions to authenticated;
CREATE OR REPLACE FUNCTION private.portal_written_summary(p_exam_type text,p_start timestamp with time zone, p_end timestamp with time zone, p_grade integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare output jsonb; subject_count integer:=case p_exam_type when 'engineer' then 5 when 'industrial' then 3 else null end; exam_total integer:=subject_count*20;
begin
 if coalesce(auth.role(),'')<>'service_role' and not public.portal_super_admin_allowed() then raise exception 'NOT_AUTHORIZED'; end if;
 if subject_count is null or p_end<=p_start or p_end-p_start>interval '32 days' or (p_grade is not null and p_grade not in (1,2)) then raise exception 'INVALID_PERIOD';end if;
 with students as (select user_id,full_name,academic_year from public.profiles where approval_status='approved' and enrollment_status='enrolled' and signup_type='student' and (p_grade is null or academic_year=p_grade)),
 bank as (select question_id,(payload->>'year')::int yr,(payload->>'round')::int rnd,regexp_replace(payload->>'subject','\s','','g') subject,payload->>'answer' answer from public.written_question_bank where exam_type=p_exam_type),
 latest as (select distinct on(a.user_id,a.question_id) a.user_id,a.question_id,a.attempted_at,a.answer::text=b.answer correct from public.written_learning_attempts a join students s using(user_id) join bank b using(question_id) where a.exam_type=p_exam_type and a.attempted_at<extract(epoch from p_end)*1000 order by a.user_id,a.question_id,a.attempted_at desc,a.answer desc),
 subjects as(select l.user_id,b.yr,b.rnd,b.subject,count(*) solved,count(*) filter(where l.correct) correct,max(l.attempted_at) last_at from latest l join bank b using(question_id) group by 1,2,3,4),
 rounds as(select user_id,yr,rnd,sum(solved) solved,sum(correct) correct,min(correct) min_correct,max(last_at) last_at,count(*)=subject_count and bool_and(solved=20) complete,jsonb_agg(jsonb_build_object('subject',subject,'solved',solved,'correct',correct) order by subject) subjects from subjects group by 1,2,3),
 period as(select a.user_id,count(*) attempts,count(distinct a.question_id) unique_count,count(*) filter(where a.answer::text=b.answer) correct from public.written_learning_attempts a join students s using(user_id) join bank b using(question_id) where a.exam_type=p_exam_type and a.attempted_at>=extract(epoch from p_start)*1000 and a.attempted_at<extract(epoch from p_end)*1000 group by 1),
 summary as(select s.*,coalesce(p.attempts,0) attempts,coalesce(p.unique_count,0) unique_count,coalesce(p.correct,0) period_correct,
 (select count(*) from latest l where l.user_id=s.user_id) solved,
 (select count(*) from rounds r where r.user_id=s.user_id and complete) completed,
 (select count(*) from rounds r where r.user_id=s.user_id and complete and correct>=exam_total*0.6 and min_correct>=8) passed,
 (select jsonb_build_object('year',yr,'round',rnd,'average',round(correct*100.0/exam_total,1),'subjects',subjects,'passed',correct>=exam_total*0.6 and min_correct>=8) from rounds r where r.user_id=s.user_id and complete order by last_at desc limit 1) recent,
 (select coalesce(jsonb_agg(to_jsonb(r)-'user_id' order by yr desc,rnd desc),'[]') from rounds r where r.user_id=s.user_id) rounds,
 (select count(*) from public.portal_mock_sessions m where m.exam_type=p_exam_type and m.user_id=s.user_id and m.submitted_at>=p_start and m.submitted_at<p_end) mocks
 from students s left join period p using(user_id))
 select coalesce(jsonb_agg(to_jsonb(summary) order by academic_year,full_name),'[]') into output from summary;
 return output;
end $function$
;
revoke all on function private.portal_written_summary(text,timestamptz,timestamptz,integer) from public,anon;
grant execute on function private.portal_written_summary(text,timestamptz,timestamptz,integer) to authenticated,service_role;
create or replace function public.portal_written_summary(p_exam_type text,p_start timestamptz,p_end timestamptz,p_grade integer default null)
returns jsonb language sql stable security invoker set search_path='' as $$
 select private.portal_written_summary(p_exam_type,p_start,p_end,p_grade)
$$;
revoke all on function public.portal_written_summary(text,timestamptz,timestamptz,integer) from public,anon;
grant execute on function public.portal_written_summary(text,timestamptz,timestamptz,integer) to authenticated,service_role;

