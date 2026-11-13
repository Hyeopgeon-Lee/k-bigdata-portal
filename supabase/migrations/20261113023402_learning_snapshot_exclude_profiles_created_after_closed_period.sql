CREATE OR REPLACE FUNCTION public.learning_refresh_closed_period(p_period_type text, p_period_start date, p_trigger text DEFAULT 'schedule'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
      and p.created_at < (v_end::timestamp at time zone 'Asia/Seoul')
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
$function$
