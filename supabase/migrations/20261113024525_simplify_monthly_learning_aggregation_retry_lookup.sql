CREATE OR REPLACE FUNCTION public.learning_run_due(p_task text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 v_today date := (now() at time zone 'Asia/Seoul')::date;
 v_monday date;
 v_month_start date;
 v_start date;
 v_result jsonb;
 v_completed integer := 0;
 v_failed integer := 0;
 v_count integer;
 v_last_status text;
 i integer;
begin
 if p_task not in ('week','month','repair') then raise exception 'INVALID_TASK'; end if;
 v_monday := v_today - (extract(isodow from v_today)::integer - 1);
 v_month_start := date_trunc('month',v_today::timestamp)::date;
 if p_task='week' and extract(isodow from v_today)=1 then
  v_result:=public.learning_refresh_closed_period('week',v_monday-7,'scheduled_week');
  return v_result;
 end if;
 if p_task='month' and extract(day from v_today)=1 then
  v_result:=public.learning_refresh_closed_period('month',(v_month_start-interval '1 month')::date,'scheduled_month');
  return v_result;
 end if;
 if p_task='repair' then
  -- Only missing (or incompletely written) results are retried; completed ones are not overwritten.
  for i in 1..4 loop
   v_start:=v_monday-(i*7);
   select count(*) into v_count from public.learning_period_stats
    where period_type='week' and period_start=v_start;
   select j.job_status into v_last_status
   from public.learning_aggregation_jobs j
   where j.period_type='week'
     and j.period_start=v_start
   order by j.started_at desc,j.id desc limit 1;
   if v_count<>3 or v_last_status='failed' then
    v_result:=public.learning_refresh_closed_period('week',v_start,'auto_repair');
    if v_result->>'ok'='true' then v_completed:=v_completed+1;
    else v_failed:=v_failed+1; end if;
   end if;
  end loop;
  for i in 1..2 loop
   v_start:=(v_month_start-(i||' month')::interval)::date;
   select count(*) into v_count from public.learning_period_stats
    where period_type='month' and period_start=v_start;
   select j.job_status into v_last_status
   from public.learning_aggregation_jobs j
   where j.period_type='month'
     and j.period_start=v_start
   order by j.started_at desc,j.id desc limit 1;
   if v_count<>3 or v_last_status='failed' then
    v_result:=public.learning_refresh_closed_period('month',v_start,'auto_repair');
    if v_result->>'ok'='true' then v_completed:=v_completed+1;
    else v_failed:=v_failed+1; end if;
   end if;
  end loop;
  return jsonb_build_object('ok',v_failed=0,'repaired',v_completed,'failed',v_failed,'checkedAt',now());
 end if;
 return jsonb_build_object('ok',true,'skipped',p_task,'kstDate',v_today);
end;
$function$
