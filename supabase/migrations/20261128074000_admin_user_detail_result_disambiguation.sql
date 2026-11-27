create or replace function public.admin_user_detail(p_user_id uuid,p_tab text default 'profile',p_days integer default 30)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare p public.profiles%rowtype; payload jsonb; since timestamptz:=now()-make_interval(days=>least(greatest(coalesce(p_days,30),1),365)); week date:=date_trunc('week',now() at time zone 'Asia/Seoul')::date;
begin
 if not public.portal_super_admin_allowed() then raise exception 'ADMIN_NOT_AUTHORIZED'; end if;
 select * into p from public.profiles where user_id=p_user_id and signup_type<>'staff';
 if p.user_id is null or exists(select 1 from public.account_roles where user_id=p_user_id and role='super_admin') then raise exception 'MEMBER_NOT_FOUND'; end if;
 case p_tab
 when 'profile' then
  select jsonb_build_object('profile',to_jsonb(p),'last_sign_in_at',(select last_sign_in_at from auth.users where id=p_user_id),
   'weekly_opt_in',(select weekly_email_opt_in from public.user_preferences where user_id=p_user_id),
   'mail_status',(select delivery_status from public.signup_approval_emails where user_id=p_user_id),
   'deletion',(select to_jsonb(d)-'actor_user_id' from public.portal_student_deletion_jobs d where user_id=p_user_id),
   'alumni_registered',exists(select 1 from public.alumni_profiles where user_id=p_user_id),
   'academic_request',(select to_jsonb(r) from private.portal_academic_requests r where user_id=p_user_id order by id desc limit 1)) into payload;
 when 'history' then
  select jsonb_build_object('academic',coalesce((select jsonb_agg(to_jsonb(t)) from (select * from private.portal_academic_status_history where user_id=p_user_id order by changed_at desc limit 100)t),'[]'::jsonb),
   'audit',coalesce((select jsonb_agg(to_jsonb(t)) from (select old_status,new_status,created_at from public.admin_audit_log where target_user_id=p_user_id order by created_at desc limit 100)t),'[]'::jsonb),
   'requests',coalesce((select jsonb_agg(to_jsonb(t)) from (select requested_status,reason,state,requested_at,decided_at,decision_note from private.portal_academic_requests where user_id=p_user_id order by id desc limit 100)t),'[]'::jsonb)) into payload;
 when 'learning' then
  with a as (
   select case when bank='coding' then 'coding_'||lower(split_part(question_id,'-',1)) else bank end bank,
   result='correct' correct,result in ('correct','incorrect','timeout') graded,submitted_at as ts
   from public.learning_attempts where user_id=p_user_id and submitted_at>=since
   union all select 'written_'||exam_type,correct,true,to_timestamp(attempted_at/1000.0)
   from public.written_learning_attempts where user_id=p_user_id and attempted_at>=extract(epoch from since)*1000
  ), summary as (select bank,count(*) attempts,count(*) filter(where correct) correct,count(*) filter(where graded) graded,max(ts) recent from a group by bank)
  select jsonb_build_object('summary',coalesce((select jsonb_agg(to_jsonb(s) order by bank) from summary s),'[]'::jsonb),
    'recent',coalesce((select jsonb_agg(to_jsonb(t)) from (select bank,question_id,result,submitted_at from public.learning_attempts where user_id=p_user_id and submitted_at>=since order by submitted_at desc limit 30)t),'[]'::jsonb),
    'mocks',coalesce((select jsonb_agg(to_jsonb(t)) from (select exam_type,submitted_at,result from public.portal_mock_sessions where user_id=p_user_id and submitted_at>=since order by submitted_at desc limit 20)t),'[]'::jsonb)) into payload;
 when 'study' then
  select jsonb_build_object('plan',(select to_jsonb(s) from public.study_weekly_plans s where user_id=p_user_id and week_start=week),
    'seconds',coalesce((select sum(duration_seconds) from public.study_sessions where user_id=p_user_id and status='completed' and started_at>=week::timestamp at time zone 'Asia/Seoul' and started_at<(week+7)::timestamp at time zone 'Asia/Seoul'),0),
    'sessions',coalesce((select jsonb_agg(to_jsonb(t)) from (select started_at,ended_at,duration_seconds,status from public.study_sessions where user_id=p_user_id and started_at>=since order by started_at desc limit 100)t),'[]'::jsonb)) into payload;
 when 'certifications' then
  select jsonb_build_object('items',coalesce((select jsonb_agg(to_jsonb(t)) from (select certificate_name,pass_status,verification_status,written_pass_date,final_pass_date from public.student_certifications where user_id=p_user_id order by updated_at desc limit 100)t),'[]'::jsonb)) into payload;
 when 'services' then
  select jsonb_build_object('rooms',coalesce((select jsonb_agg(to_jsonb(t)) from (select room_code,starts_at,ends_at,purpose,status from public.room_reservations where owner_id=p_user_id order by starts_at desc limit 30)t),'[]'::jsonb),
   'requests',coalesce((select jsonb_agg(to_jsonb(t)) from (select title,category,status,updated_at from public.help_requests where owner_id=p_user_id order by updated_at desc limit 30)t),'[]'::jsonb)) into payload;
 when 'guidance' then
  select jsonb_build_object('guidance',(select to_jsonb(g) from private.portal_user_guidance g where user_id=p_user_id),
   'notes',coalesce((select jsonb_agg(to_jsonb(t)) from (select id,meeting_date,topic,note,next_action,follow_up,completed_at,created_at from private.portal_guidance_notes where user_id=p_user_id order by meeting_date desc,id desc limit 100)t),'[]'::jsonb)) into payload;
 when 'alumni' then
  select jsonb_build_object('alumni',(select to_jsonb(a) from public.alumni_profiles a where user_id=p_user_id),
   'contacts',coalesce((select jsonb_agg(to_jsonb(t)) from (select requester_name,subject,category,status,created_at,sent_at from public.alumni_contact_requests where recipient_user_id=p_user_id order by created_at desc limit 30)t),'[]'::jsonb)) into payload;
 else raise exception 'INVALID_TAB';
 end case;
 return payload;
end $$;

