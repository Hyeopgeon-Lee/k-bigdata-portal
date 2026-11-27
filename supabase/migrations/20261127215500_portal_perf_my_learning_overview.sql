-- Compact personal dashboard: raw answer text and past attempt rows never leave the database.
create or replace function public.portal_my_learning_overview(p_week_start timestamptz)
returns jsonb language sql stable security invoker set search_path='' as $$
with attempts as materialized (
  select bank,question_id,result,grading_method,submitted_at from public.learning_attempts where user_id=(select auth.uid())
  union all
  select 'written_'||exam_type,question_id,case when correct then 'correct' else 'incorrect' end,'automatic',to_timestamp(attempted_at/1000.0) from public.written_learning_attempts where user_id=(select auth.uid())
), latest as (
 select distinct on(bank,question_id) bank,question_id,result from attempts
 where result in ('correct','incorrect') or (result='ungraded' and grading_method='self')
 order by bank,question_id,submitted_at desc,result
), progress as (
 select bank,question_id,attempts_count,correct_count,incorrect_count from public.learning_progress where user_id=(select auth.uid())
 union all
 select bank,question_id,count(*)::integer,count(*) filter(where result='correct')::integer,count(*) filter(where result='incorrect')::integer from attempts where bank in ('written_industrial','written_engineer') group by 1,2
), period as (
 select * from attempts where submitted_at>=p_week_start-interval '7 days'
), recent as (
 select * from attempts order by submitted_at desc,bank,question_id limit 35
), review as (
 select p.* from progress p join latest l using(bank,question_id) where l.result in ('incorrect','ungraded')
)
select jsonb_build_object(
 'count',(select count(*) from attempts),
 'period',coalesce((select jsonb_agg(to_jsonb(p) order by submitted_at desc) from period p),'[]'),
 'recent',coalesce((select jsonb_agg(to_jsonb(r) order by submitted_at desc) from recent r),'[]'),
 'progress',coalesce((select jsonb_agg(to_jsonb(p)) from progress p),'[]'),
 'review',coalesce((select jsonb_agg(to_jsonb(r)) from review r),'[]'),
 'recovered',(select count(*) from progress p join latest l using(bank,question_id) where l.result='correct' and p.incorrect_count>0)
)
$$;
revoke all on function public.portal_my_learning_overview(timestamptz) from public,anon;
grant execute on function public.portal_my_learning_overview(timestamptz) to authenticated;
