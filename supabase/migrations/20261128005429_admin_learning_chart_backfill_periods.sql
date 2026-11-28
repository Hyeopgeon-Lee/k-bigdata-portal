-- Enrich existing frozen periods additively; keep original metric values and timestamps.
-- Only use retained attempts when the historical roster agrees with the saved cohort.
update public.learning_period_stats s
set metrics=jsonb_set(s.metrics,'{chartStats}',private.learning_chart_metrics(
 s.period_start::timestamp at time zone 'Asia/Seoul',s.period_end::timestamp at time zone 'Asia/Seoul',
 s.grade,'snapshot',s.period_type,s.period_start)||jsonb_build_object('basis','historical'),true)
where not (s.metrics ? 'chartStats')
 and s.period_end>s.period_start
 and s.cohort_size=(select count(*) from public.learning_period_members m
   where m.period_type=s.period_type and m.period_start=s.period_start and (s.grade=0 or m.grade=s.grade));
