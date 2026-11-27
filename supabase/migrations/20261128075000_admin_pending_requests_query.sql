create or replace function public.admin_user_list(p_search text default '',p_status text default 'enrolled',p_grade integer default null,p_approval text default 'all',p_type text default 'all',p_attention text default 'all',p_page integer default 1,p_size integer default 25)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb; n integer:=least(greatest(coalesce(p_size,25),1),100); offset_n bigint:=greatest(coalesce(p_page,1)-1,0)::bigint*n;
begin
 if not public.portal_super_admin_allowed() then raise exception 'ADMIN_NOT_AUTHORIZED'; end if;
 with members as materialized (
 select p.user_id,p.full_name,p.student_no,p.graduation_year,p.academic_year,p.signup_type,p.approval_status,p.enrollment_status,
  p.created_at,p.updated_at,
  case when p.email is not null then left(p.email,2)||'***@'||split_part(p.email,'@',2) else '' end email_mask,
  p.email, p.mobile_phone,
  coalesce(e.delivery_status,'') mail_status,
  coalesce(u.weekly_email_opt_in,false) weekly_opt_in,
  exists(select 1 from private.portal_academic_requests ar where ar.user_id=p.user_id and ar.state='pending') pending_academic
 from public.profiles p
 left join public.signup_approval_emails e on e.user_id=p.user_id
 left join public.user_preferences u on u.user_id=p.user_id
 where p.signup_type<>'staff' and not exists(select 1 from public.account_roles r where r.user_id=p.user_id and r.role='super_admin')
 ), filtered as materialized (
 select m.* from members m where (coalesce(p_status,'all')='all' or (m.enrollment_status=p_status and (p_status<>'enrolled' or m.signup_type='student')))
 and (p_grade is null or m.academic_year=p_grade)
 and (coalesce(p_type,'all')='all' or m.signup_type=p_type)
 and (coalesce(p_approval,'all')='all' or m.approval_status=p_approval)
 and (coalesce(p_search,'')='' or position(lower(left(p_search,100)) in lower(concat_ws(' ',m.full_name,m.student_no,m.email,m.mobile_phone)))>0)
 and (coalesce(p_attention,'all')='all' or case p_attention
   when 'academic' then m.pending_academic
   when 'mail_failed' then m.mail_status='failed'
   when 'no_plan' then m.enrollment_status='enrolled' and m.approval_status='approved' and not exists(
    select 1 from public.study_weekly_plans s where s.user_id=m.user_id and s.week_start=date_trunc('week',now() at time zone 'Asia/Seoul')::date)
   when 'inactive' then m.enrollment_status='enrolled' and m.approval_status='approved'
    and not exists(select 1 from public.learning_attempts a where a.user_id=m.user_id and a.submitted_at>=now()-interval '7 days')
    and not exists(select 1 from public.written_learning_attempts w where w.user_id=m.user_id and w.attempted_at>=extract(epoch from now()-interval '7 days')*1000)
    and not exists(select 1 from public.study_sessions s where s.user_id=m.user_id and s.started_at>=now()-interval '7 days')
   when 'no_cert' then m.enrollment_status='enrolled' and m.approval_status='approved' and not exists(select 1 from public.student_certifications c where c.user_id=m.user_id and c.pass_status='final' and c.verification_status='verified')
   when 'followup' then exists(select 1 from private.portal_guidance_notes g where g.user_id=m.user_id and g.completed_at is null and g.follow_up<=current_date)
   when 'no_application' then m.enrollment_status='enrolled' and m.academic_year=2 and m.approval_status='approved'
    and not exists(select 1 from private.portal_user_guidance g where g.user_id=m.user_id and g.application_count>0)
   when 'mock_failed' then exists(select 1 from public.portal_mock_sessions s where s.user_id=m.user_id and s.submitted_at is not null and s.result->>'passed'='false')
   else false end)
 ), page_rows as (
 select * from filtered order by created_at desc,user_id limit n offset offset_n
 )
 select jsonb_build_object('total',(select count(*) from filtered),'rows',coalesce((select jsonb_agg(to_jsonb(x)-'email'-'mobile_phone' order by x.created_at desc,x.user_id) from page_rows x),'[]'::jsonb),
 'counts',(select jsonb_build_object(
 'all',count(*),'grade1',count(*) filter(where enrollment_status='enrolled' and academic_year=1),
 'grade2',count(*) filter(where enrollment_status='enrolled' and academic_year=2),
 'enrolled',count(*) filter(where enrollment_status='enrolled'),'leave',count(*) filter(where enrollment_status='leave'),
 'withdrawn',count(*) filter(where enrollment_status='withdrawn'),'graduated',count(*) filter(where enrollment_status='graduated'),
 'early_employment',count(*) filter(where enrollment_status='early_employment'),'pending',count(*) filter(where approval_status='pending'),
 'requests',count(*) filter(where pending_academic),'mail_failed',count(*) filter(where mail_status='failed')) from members))
 into result;
 return result;
end $$;

create or replace function public.admin_pending_signup_requests()
returns setof public.profiles language plpgsql stable security definer set search_path='' as $$
begin
 if not public.portal_super_admin_allowed() then raise exception 'ADMIN_NOT_AUTHORIZED'; end if;
 return query select p.* from public.profiles p where p.approval_status='pending' and p.signup_type<>'staff'
 and not exists(select 1 from public.account_roles r where r.user_id=p.user_id and r.role='super_admin')
 order by p.created_at desc;
end $$;
revoke all on function public.admin_pending_signup_requests() from public,anon,authenticated;
grant execute on function public.admin_pending_signup_requests() to authenticated;
