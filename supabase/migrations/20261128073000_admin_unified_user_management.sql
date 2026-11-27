-- Administrator-only unified directory; student requests never directly mutate academic status.
-- Existing profile, learning, qualification and alumni records remain canonical.
begin;
alter table public.profiles drop constraint profiles_signup_identity;
alter table public.profiles add constraint profiles_signup_identity check (
 (signup_type='student' and ((student_no is not null and graduation_year is null)
   or (enrollment_status in ('early_employment','graduated') and alumni_source_id is not null and
     graduation_year between 2000 and extract(year from current_date)::integer+5)))
 or (signup_type='staff' and graduation_year is null and lower(email)='hglee67@kopo.ac.kr')
 or (signup_type='alumni' and student_no is null and graduation_year is not null and graduation_year between 1900 and extract(year from current_date)::integer)
);

create table private.portal_academic_requests (
 id bigint generated always as identity primary key,
 user_id uuid not null references public.profiles(user_id) on delete cascade,
 requested_status text not null check(requested_status in ('1','2','leave','graduated','early_employment')),
 reason text not null default '' check(char_length(reason)<=500),
 state text not null default 'pending' check(state in ('pending','approved','rejected','cancelled')),
 requested_at timestamptz not null default now(),
 decided_at timestamptz, decided_by uuid references auth.users(id) on delete set null,
 decision_note text not null default '' check(char_length(decision_note)<=500)
);
create unique index portal_academic_requests_one_pending on private.portal_academic_requests(user_id) where state='pending';
alter table private.portal_academic_requests enable row level security;
revoke all on private.portal_academic_requests from public,anon,authenticated;

create table private.portal_user_guidance (
 user_id uuid primary key references public.profiles(user_id) on delete cascade,
 return_date date, employment_date date, expected_graduation_date date,
 employer text not null default '' check(char_length(employer)<=160),
 job_title text not null default '' check(char_length(job_title)<=160),
 career_stage text not null default '' check(career_stage in ('','preparing','applied','interview','offer','employed')),
 application_count integer check(application_count>=0 and application_count<=10000),
 next_interview date, follow_up date,
 updated_at timestamptz not null default now(),
 updated_by uuid references auth.users(id) on delete set null
);
alter table private.portal_user_guidance enable row level security;
revoke all on private.portal_user_guidance from public,anon,authenticated;

create table private.portal_guidance_notes (
 id bigint generated always as identity primary key,
 user_id uuid not null references public.profiles(user_id) on delete cascade,
 meeting_date date not null, topic text not null check(char_length(topic) between 1 and 140),
 note text not null default '' check(char_length(note)<=2000),
 next_action text not null default '' check(char_length(next_action)<=1000),
 follow_up date, completed_at timestamptz,
 actor_user_id uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now()
);
create index portal_guidance_notes_member on private.portal_guidance_notes(user_id,meeting_date desc,id desc);
alter table private.portal_guidance_notes enable row level security;
revoke all on private.portal_guidance_notes from public,anon,authenticated;

-- Service-role-only resumable deletion ledger. Keep only pseudonymous ID, state and technical errors.
create table public.portal_student_deletion_jobs (
 user_id uuid primary key, actor_user_id uuid references auth.users(id) on delete set null,
 state text not null check(state in ('running','failed','completed')),
 step text not null default 'inventory', error_code text,
 started_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.portal_student_deletion_jobs enable row level security;
revoke all on public.portal_student_deletion_jobs from public,anon,authenticated;
grant select,insert,update on public.portal_student_deletion_jobs to service_role;

create or replace function public.claim_portal_student_deletion(p_user_id uuid,p_actor_id uuid,p_version timestamptz)
returns boolean language plpgsql security definer set search_path='' as $$
declare member public.profiles%rowtype; current_job public.portal_student_deletion_jobs%rowtype;
begin
 select * into member from public.profiles where user_id=p_user_id for update;
 if member.user_id is null or member.signup_type<>'student' or member.enrollment_status<>'withdrawn'
 or member.updated_at is distinct from p_version
 or exists(select 1 from public.account_roles where user_id=p_user_id and role='super_admin') then return false; end if;
 select * into current_job from public.portal_student_deletion_jobs where user_id=p_user_id for update;
 if current_job.state='completed' or (current_job.state='running' and current_job.updated_at>now()-interval '10 minutes') then return false; end if;
 insert into public.portal_student_deletion_jobs(user_id,actor_user_id,state,step)
 values(p_user_id,p_actor_id,'running','inventory')
 on conflict(user_id) do update set state='running',step='inventory',actor_user_id=p_actor_id,error_code=null,updated_at=now();
 return true;
end $$;
revoke all on function public.claim_portal_student_deletion(uuid,uuid,timestamptz) from public,anon,authenticated;
grant execute on function public.claim_portal_student_deletion(uuid,uuid,timestamptz) to service_role;

create or replace function public.admin_update_student(p_target_user_id uuid,p_approval_status text,p_enrollment_status text)
returns void language plpgsql security definer set search_path='' as $$
declare old_row public.profiles%rowtype;
begin
 if not public.portal_super_admin_allowed() then raise exception 'ADMIN_NOT_AUTHORIZED'; end if;
 if p_approval_status is null or p_approval_status not in ('pending','approved','rejected','suspended')
 or p_enrollment_status is null or p_enrollment_status not in ('enrolled','leave','withdrawn','graduated','early_employment')
 then raise exception 'INVALID_STATUS'; end if;
 select * into old_row from public.profiles where user_id=p_target_user_id for update;
 if old_row.user_id is null then raise exception 'STUDENT_NOT_FOUND'; end if;
 if old_row.signup_type='staff' or exists(select 1 from public.account_roles where user_id=old_row.user_id and role='super_admin') then raise exception 'CANNOT_CHANGE_ADMIN'; end if;
 if old_row.signup_type='alumni' and p_enrollment_status<>'graduated' then raise exception 'ALUMNI_STATUS_LOCKED'; end if;
 if exists(select 1 from public.portal_student_deletion_jobs where user_id=p_target_user_id and state in ('running','failed')) then raise exception 'DELETION_IN_PROGRESS'; end if;
 update public.profiles set approval_status=p_approval_status,enrollment_status=p_enrollment_status,updated_at=now()
 where user_id=p_target_user_id;
 if old_row.enrollment_status is distinct from p_enrollment_status then
  insert into private.portal_academic_status_history(user_id,old_enrollment_status,old_academic_year,new_enrollment_status,new_academic_year)
  values(p_target_user_id,old_row.enrollment_status,old_row.academic_year,p_enrollment_status,old_row.academic_year);
 end if;
 if old_row.approval_status is distinct from p_approval_status or old_row.enrollment_status is distinct from p_enrollment_status then
  insert into public.admin_audit_log(actor_user_id,target_user_id,old_status,new_status)
  values(auth.uid(),p_target_user_id,old_row.approval_status||'/'||old_row.enrollment_status,p_approval_status||'/'||p_enrollment_status);
 end if;
 if p_approval_status<>'approved' or p_enrollment_status in ('withdrawn','graduated') then
  update private.portal_sessions set revoked_at=now() where user_id=p_target_user_id and revoked_at is null;
 end if;
end $$;

create or replace function public.request_my_academic_status(p_status text,p_reason text default '')
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_id uuid:=auth.uid(); v_old public.profiles%rowtype; v_id_request bigint;
begin
 if v_id is null or not private.portal_read_allowed() then raise exception 'PORTAL_SESSION_REQUIRED'; end if;
 if p_status is null or p_status not in ('1','2','leave','graduated','early_employment') then raise exception 'INVALID_ACADEMIC_STATUS'; end if;
 select * into v_old from public.profiles where user_id=v_id for update;
 if v_old.user_id is null or v_old.signup_type<>'student' or v_old.approval_status<>'approved'
 or v_old.enrollment_status not in ('enrolled','leave','graduated','early_employment')
 or exists(select 1 from public.alumni_profiles where user_id=v_id)
 or exists(select 1 from public.account_roles where user_id=v_id and role='super_admin')
 then raise exception 'ACADEMIC_STATUS_CHANGE_NOT_ALLOWED'; end if;
 if (p_status in ('1','2') and v_old.enrollment_status='enrolled' and v_old.academic_year::text=p_status)
 or v_old.enrollment_status=p_status then raise exception 'SAME_STATUS'; end if;
 update private.portal_academic_requests set state='cancelled',decided_at=now()
 where user_id=v_id and state='pending';
 insert into private.portal_academic_requests(user_id,requested_status,reason)
 values(v_id,p_status,left(coalesce(p_reason,''),500)) returning id into v_id_request;
 return jsonb_build_object('request_id',v_id_request,'state','pending');
end $$;

-- Old cached clients now submit a request instead of changing the canonical profile.
create or replace function public.update_my_academic_status(p_status text,p_mobile_phone text)
returns public.profiles language plpgsql security definer set search_path='' as $$
declare p public.profiles%rowtype;
begin
 perform public.request_my_academic_status(p_status,'');
 select * into p from public.profiles where user_id=auth.uid();
 return p;
end $$;

create or replace function public.my_academic_request()
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare r jsonb;
begin
 if auth.uid() is null or not private.portal_read_allowed() then raise exception 'PORTAL_SESSION_REQUIRED'; end if;
 select jsonb_build_object('requested_status',requested_status,'state',state,'requested_at',requested_at,'decision_note',decision_note)
 into r from private.portal_academic_requests where user_id=auth.uid() order by id desc limit 1;
 return r;
end $$;

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
 select m.* from members m where (coalesce(p_status,'all')='all' or m.enrollment_status=p_status)
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

create or replace function public.admin_user_detail(p_user_id uuid,p_tab text default 'profile',p_days integer default 30)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare p public.profiles%rowtype; result jsonb; since timestamptz:=now()-make_interval(days=>least(greatest(coalesce(p_days,30),1),365)); week date:=date_trunc('week',now() at time zone 'Asia/Seoul')::date;
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
   'academic_request',(select to_jsonb(r) from private.portal_academic_requests r where user_id=p_user_id order by id desc limit 1)) into result;
 when 'history' then
  select jsonb_build_object('academic',coalesce((select jsonb_agg(to_jsonb(t)) from (select * from private.portal_academic_status_history where user_id=p_user_id order by changed_at desc limit 100)t),'[]'::jsonb),
   'audit',coalesce((select jsonb_agg(to_jsonb(t)) from (select old_status,new_status,created_at from public.admin_audit_log where target_user_id=p_user_id order by created_at desc limit 100)t),'[]'::jsonb),
   'requests',coalesce((select jsonb_agg(to_jsonb(t)) from (select requested_status,reason,state,requested_at,decided_at,decision_note from private.portal_academic_requests where user_id=p_user_id order by id desc limit 100)t),'[]'::jsonb)) into result;
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
    'mocks',coalesce((select jsonb_agg(to_jsonb(t)) from (select exam_type,submitted_at,result from public.portal_mock_sessions where user_id=p_user_id and submitted_at>=since order by submitted_at desc limit 20)t),'[]'::jsonb)) into result;
 when 'study' then
  select jsonb_build_object('plan',(select to_jsonb(s) from public.study_weekly_plans s where user_id=p_user_id and week_start=week),
    'seconds',coalesce((select sum(duration_seconds) from public.study_sessions where user_id=p_user_id and status='completed' and started_at>=week::timestamp at time zone 'Asia/Seoul' and started_at<(week+7)::timestamp at time zone 'Asia/Seoul'),0),
    'sessions',coalesce((select jsonb_agg(to_jsonb(t)) from (select started_at,ended_at,duration_seconds,status from public.study_sessions where user_id=p_user_id and started_at>=since order by started_at desc limit 100)t),'[]'::jsonb)) into result;
 when 'certifications' then
  select jsonb_build_object('items',coalesce((select jsonb_agg(to_jsonb(t)) from (select certificate_name,pass_status,verification_status,written_pass_date,final_pass_date from public.student_certifications where user_id=p_user_id order by updated_at desc limit 100)t),'[]'::jsonb)) into result;
 when 'services' then
  select jsonb_build_object('rooms',coalesce((select jsonb_agg(to_jsonb(t)) from (select room_code,starts_at,ends_at,purpose,status from public.room_reservations where owner_id=p_user_id order by starts_at desc limit 30)t),'[]'::jsonb),
   'requests',coalesce((select jsonb_agg(to_jsonb(t)) from (select title,category,status,updated_at from public.help_requests where owner_id=p_user_id order by updated_at desc limit 30)t),'[]'::jsonb)) into result;
 when 'guidance' then
  select jsonb_build_object('guidance',(select to_jsonb(g) from private.portal_user_guidance g where user_id=p_user_id),
   'notes',coalesce((select jsonb_agg(to_jsonb(t)) from (select id,meeting_date,topic,note,next_action,follow_up,completed_at,created_at from private.portal_guidance_notes where user_id=p_user_id order by meeting_date desc,id desc limit 100)t),'[]'::jsonb)) into result;
 when 'alumni' then
  select jsonb_build_object('alumni',(select to_jsonb(a) from public.alumni_profiles a where user_id=p_user_id),
   'contacts',coalesce((select jsonb_agg(to_jsonb(t)) from (select requester_name,subject,category,status,created_at,sent_at from public.alumni_contact_requests where recipient_user_id=p_user_id order by created_at desc limit 30)t),'[]'::jsonb)) into result;
 else raise exception 'INVALID_TAB';
 end case;
 return result;
end $$;

create or replace function public.admin_user_edit(p_user_id uuid,p_name text,p_student_no text,p_grade integer,p_phone text,p_weekly boolean)
returns jsonb language plpgsql security definer set search_path='' as $$
declare old_p public.profiles%rowtype; new_p public.profiles%rowtype; phone text:=nullif(regexp_replace(coalesce(p_phone,''),'[ -]','','g'),''); studentno text:=nullif(btrim(coalesce(p_student_no,'')),'');
begin
 if not public.portal_super_admin_allowed() then raise exception 'ADMIN_NOT_AUTHORIZED'; end if;
 select * into old_p from public.profiles where user_id=p_user_id and signup_type<>'staff' for update;
 if old_p.user_id is null or exists(select 1 from public.account_roles where user_id=p_user_id and role='super_admin') then raise exception 'MEMBER_NOT_FOUND'; end if;
 if exists(select 1 from public.portal_student_deletion_jobs where user_id=p_user_id and state in ('running','failed')) then raise exception 'DELETION_IN_PROGRESS'; end if;
 if p_name is null or char_length(btrim(p_name)) not between 2 and 80 or (phone is not null and phone !~ '^01[016789][0-9]{7,8}$') then raise exception 'INVALID_PROFILE'; end if;
 if old_p.signup_type='student' and ((p_grade is not null and p_grade not in (1,2)) or (studentno is not null and studentno !~ '^[0-9A-Za-z-]{3,30}$')) then raise exception 'INVALID_STUDENT'; end if;
 update public.profiles set full_name=btrim(p_name), mobile_phone=phone,
 student_no=case when signup_type='student' then studentno else student_no end,
 academic_year=case when signup_type='student' then p_grade::smallint else academic_year end,
 updated_at=now() where user_id=p_user_id returning * into new_p;
 if old_p.academic_year is distinct from new_p.academic_year then
  insert into private.portal_academic_status_history(user_id,old_enrollment_status,old_academic_year,new_enrollment_status,new_academic_year)
  values(p_user_id,old_p.enrollment_status,old_p.academic_year,new_p.enrollment_status,new_p.academic_year);
 end if;
 if new_p.signup_type='student' then
  insert into public.user_preferences(user_id,weekly_email_opt_in,preferred_grade) values(p_user_id,coalesce(p_weekly,false),case when p_grade in (1,2) then p_grade::text end)
  on conflict(user_id) do update set weekly_email_opt_in=excluded.weekly_email_opt_in,preferred_grade=coalesce(excluded.preferred_grade,public.user_preferences.preferred_grade),updated_at=now();
 end if;
 insert into public.admin_audit_log(actor_user_id,target_user_id,old_status,new_status) values(auth.uid(),p_user_id,'profile','profile_updated');
 return jsonb_build_object('ok',true);
end $$;

create or replace function public.admin_decide_academic_request(p_request_id bigint,p_approve boolean,p_note text default '')
returns jsonb language plpgsql security definer set search_path='' as $$
declare r private.portal_academic_requests%rowtype; p public.profiles%rowtype; new_grade smallint; new_status text;
begin
 if not public.portal_super_admin_allowed() then raise exception 'ADMIN_NOT_AUTHORIZED'; end if;
 select * into r from private.portal_academic_requests where id=p_request_id for update;
 if r.id is null or r.state<>'pending' or p_approve is null then raise exception 'REQUEST_NOT_PENDING'; end if;
 select * into p from public.profiles where user_id=r.user_id for update;
 if p.signup_type<>'student' or p.approval_status<>'approved' or p.enrollment_status='withdrawn' then raise exception 'INVALID_MEMBER'; end if;
 if p_approve then
  new_status:=case when r.requested_status in ('1','2') then 'enrolled' else r.requested_status end;
  new_grade:=case when r.requested_status in ('1','2') then r.requested_status::smallint else p.academic_year end;
  perform public.admin_update_student(p.user_id,p.approval_status,new_status);
  if new_grade is distinct from p.academic_year then
   update public.profiles set academic_year=new_grade,updated_at=now() where user_id=p.user_id;
   insert into private.portal_academic_status_history(user_id,old_enrollment_status,old_academic_year,new_enrollment_status,new_academic_year)
   values(p.user_id,new_status,p.academic_year,new_status,new_grade);
   insert into public.user_preferences(user_id,preferred_grade) values(p.user_id,new_grade::text)
   on conflict(user_id) do update set preferred_grade=excluded.preferred_grade,updated_at=now();
  end if;
 end if;
 update private.portal_academic_requests set state=case when p_approve then 'approved' else 'rejected' end,decided_at=now(),decided_by=auth.uid(),decision_note=left(coalesce(p_note,''),500) where id=p_request_id;
 return jsonb_build_object('ok',true);
end $$;

create or replace function public.admin_user_guidance_save(p_user_id uuid,p_data jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if not public.portal_super_admin_allowed() then raise exception 'ADMIN_NOT_AUTHORIZED'; end if;
 if not exists(select 1 from public.profiles where user_id=p_user_id and signup_type<>'staff') then raise exception 'MEMBER_NOT_FOUND'; end if;
 insert into private.portal_user_guidance(user_id,return_date,employment_date,expected_graduation_date,employer,job_title,career_stage,application_count,next_interview,follow_up,updated_by)
 values(p_user_id,nullif(p_data->>'return_date','')::date,nullif(p_data->>'employment_date','')::date,nullif(p_data->>'expected_graduation_date','')::date,left(coalesce(p_data->>'employer',''),160),left(coalesce(p_data->>'job_title',''),160),coalesce(p_data->>'career_stage',''),nullif(p_data->>'application_count','')::integer,nullif(p_data->>'next_interview','')::date,nullif(p_data->>'follow_up','')::date,auth.uid())
 on conflict(user_id) do update set return_date=excluded.return_date,employment_date=excluded.employment_date,expected_graduation_date=excluded.expected_graduation_date,employer=excluded.employer,job_title=excluded.job_title,career_stage=excluded.career_stage,application_count=excluded.application_count,next_interview=excluded.next_interview,follow_up=excluded.follow_up,updated_by=auth.uid(),updated_at=now();
 insert into public.admin_audit_log(actor_user_id,target_user_id,old_status,new_status) values(auth.uid(),p_user_id,'guidance','guidance_updated');
 return jsonb_build_object('ok',true);
end $$;

create or replace function public.admin_user_note(p_user_id uuid,p_data jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if not public.portal_super_admin_allowed() then raise exception 'ADMIN_NOT_AUTHORIZED'; end if;
 if not exists(select 1 from public.profiles where user_id=p_user_id and signup_type<>'staff') then raise exception 'MEMBER_NOT_FOUND'; end if;
 if p_data->>'action'='complete' then
  update private.portal_guidance_notes set completed_at=now() where user_id=p_user_id and id=(p_data->>'id')::bigint and completed_at is null;
  if not found then raise exception 'NOTE_NOT_FOUND'; end if;
 else
  insert into private.portal_guidance_notes(user_id,meeting_date,topic,note,next_action,follow_up,actor_user_id)
  values(p_user_id,(p_data->>'meeting_date')::date,btrim(coalesce(p_data->>'topic','')),coalesce(p_data->>'note',''),coalesce(p_data->>'next_action',''),nullif(p_data->>'follow_up','')::date,auth.uid());
 end if;
 return jsonb_build_object('ok',true);
end $$;

create or replace function public.admin_user_statistics()
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare r jsonb; week date:=date_trunc('week',now() at time zone 'Asia/Seoul')::date;
begin
 if not public.portal_super_admin_allowed() then raise exception 'ADMIN_NOT_AUTHORIZED'; end if;
 with active as materialized (select user_id from public.profiles where signup_type='student' and approval_status='approved' and enrollment_status='enrolled'),
 learners as (select user_id from public.learning_attempts where submitted_at>=now()-interval '7 days' union select user_id from public.written_learning_attempts where attempted_at>=extract(epoch from now()-interval '7 days')*1000)
 select jsonb_build_object('enrolled',(select count(*) from active),
 'plan',(select count(*) from active a where exists(select 1 from public.study_weekly_plans p where p.user_id=a.user_id and p.week_start=week)),
 'active_learning',(select count(*) from active a where exists(select 1 from learners l where l.user_id=a.user_id)),
 'certified',(select count(*) from active a where exists(select 1 from public.student_certifications c where c.user_id=a.user_id and c.pass_status='final' and c.verification_status='verified')),
 'early',(select count(*) from public.profiles where signup_type='student' and approval_status='approved' and enrollment_status='early_employment'),
 'alumni_registered',(select count(*) from public.alumni_profiles),
 'pending',(select count(*) from public.profiles where signup_type<>'staff' and approval_status='pending'),
 'mail_failed',(select count(*) from public.signup_approval_emails where delivery_status='failed')) into r;
 return r;
end $$;

create or replace function public.admin_alumni_directory(p_search text default '',p_year text default '',p_visibility text default '',p_consent text default '',p_employment text default '',p_page integer default 1,p_size integer default 25)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare r jsonb; n integer:=least(greatest(coalesce(p_size,25),1),100); o bigint:=greatest(coalesce(p_page,1)-1,0)::bigint*n;
begin
 if not public.portal_super_admin_allowed() then raise exception 'ADMIN_NOT_AUTHORIZED'; end if;
 with matched as materialized (
 select a.user_id alumni_id,p.full_name name,p.approval_status,p.enrollment_status,coalesce(p.graduation_year::text,a.graduation_year) graduation_year,
 a.company,a.job,a.employment_status,a.skills,a.mentoring_topics,a.contact_allowed,a.career_mail_enabled,a.alumni_news_mail_enabled,
 a.updated_at,case when a.is_visible then 'APPROVED' else 'HIDDEN' end status
 from public.alumni_profiles a join public.profiles p on p.user_id=a.user_id
 where p.signup_type<>'staff'
 and (coalesce(p_year,'')='' or coalesce(p.graduation_year::text,a.graduation_year)=p_year)
 and (coalesce(p_visibility,'')='' or (case when a.is_visible then 'APPROVED' else 'HIDDEN' end)=p_visibility)
 and (coalesce(p_employment,'')='' or coalesce(a.employment_status,'')=p_employment)
 and (coalesce(p_consent,'')='' or case p_consent when 'unset' then nullif(btrim(a.career_mail_enabled),'') is null
 when 'yes' then lower(a.career_mail_enabled) in ('true','1','yes','on') when 'no' then lower(a.career_mail_enabled) in ('false','0','no','off') else false end)
 and (coalesce(p_search,'')='' or position(lower(left(p_search,100)) in lower(concat_ws(' ',p.full_name,p.email,p.mobile_phone,a.company,a.job,a.skills,a.mentoring_topics)))>0)
 ), paged as (select * from matched order by updated_at desc,alumni_id limit n offset o)
 select jsonb_build_object('total',(select count(*) from matched),'rows',coalesce((select jsonb_agg(to_jsonb(t)) from paged t),'[]'::jsonb),
 'employment_values',(select coalesce(jsonb_agg(distinct employment_status) filter(where nullif(employment_status,'') is not null),'[]'::jsonb) from public.alumni_profiles),
 'companies',(select count(distinct lower(btrim(company))) from matched where nullif(btrim(company),'') is not null),
 'mentor_count',(select count(*) from matched where nullif(btrim(mentoring_topics),'') is not null and lower(contact_allowed) in ('true','1','yes','on')))
 into r;return r;
end $$;

-- Contact request handling is distinct from delivery status and does not expose message content.
create table private.portal_alumni_contact_followups (
 request_id text primary key references public.alumni_contact_requests(id) on delete cascade,
 state text not null default 'open' check(state in ('open','reviewing','closed')),
 note text not null default '' check(char_length(note)<=500),
 updated_at timestamptz not null default now(), updated_by uuid references auth.users(id) on delete set null
);
alter table private.portal_alumni_contact_followups enable row level security;
revoke all on private.portal_alumni_contact_followups from public,anon,authenticated;
create or replace function public.admin_alumni_requests(p_search text default '',p_delivery text default '',p_page integer default 1)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare r jsonb;
begin
 if not public.portal_super_admin_allowed() then raise exception 'ADMIN_NOT_AUTHORIZED'; end if;
 with matched as materialized (select a.id request_id,p.full_name target_name,a.requester_name,a.requester_type,a.category,a.subject,a.status,a.created_at,a.sent_at,
 coalesce(f.state,'open') followup_state,coalesce(f.note,'') followup_note,f.updated_at followup_at
 from public.alumni_contact_requests a left join public.profiles p on p.user_id=a.recipient_user_id
 left join private.portal_alumni_contact_followups f on f.request_id=a.id
 where (coalesce(p_delivery,'')='' or a.status=p_delivery)
 and (coalesce(p_search,'')='' or position(lower(left(p_search,100)) in lower(concat_ws(' ',p.full_name,a.requester_name,a.subject,a.category)))>0)),
 paged as (select * from matched order by created_at desc,request_id limit 25 offset greatest(coalesce(p_page,1)-1,0)::bigint*25)
 select jsonb_build_object('total',(select count(*) from matched),'rows',coalesce((select jsonb_agg(to_jsonb(t)) from paged t),'[]'::jsonb)) into r;
 return r;
end $$;
create or replace function public.admin_alumni_request_followup(p_request_id text,p_state text,p_note text default '')
returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if not public.portal_super_admin_allowed() then raise exception 'ADMIN_NOT_AUTHORIZED'; end if;
 if p_state not in ('open','reviewing','closed') then raise exception 'INVALID_STATE'; end if;
 insert into private.portal_alumni_contact_followups(request_id,state,note,updated_by) values(p_request_id,p_state,left(coalesce(p_note,''),500),auth.uid())
 on conflict(request_id) do update set state=excluded.state,note=excluded.note,updated_at=now(),updated_by=auth.uid();
 return jsonb_build_object('ok',true);
end $$;
revoke all on function public.admin_user_statistics(),public.admin_alumni_directory(text,text,text,text,text,integer,integer),public.admin_alumni_requests(text,text,integer),public.admin_alumni_request_followup(text,text,text) from public,anon,authenticated;
grant execute on function public.admin_user_statistics(),public.admin_alumni_directory(text,text,text,text,text,integer,integer),public.admin_alumni_requests(text,text,integer),public.admin_alumni_request_followup(text,text,text) to authenticated;

-- Explicit grants: every public RPC checks the existing session-bound administrator/ownership gate.
revoke all on function public.request_my_academic_status(text,text),public.my_academic_request(),public.admin_user_list(text,text,integer,text,text,text,integer,integer),public.admin_user_detail(uuid,text,integer),public.admin_user_edit(uuid,text,text,integer,text,boolean),public.admin_decide_academic_request(bigint,boolean,text),public.admin_user_guidance_save(uuid,jsonb),public.admin_user_note(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.request_my_academic_status(text,text),public.my_academic_request(),public.admin_user_list(text,text,integer,text,text,text,integer,integer),public.admin_user_detail(uuid,text,integer),public.admin_user_edit(uuid,text,text,integer,text,boolean),public.admin_decide_academic_request(bigint,boolean,text),public.admin_user_guidance_save(uuid,jsonb),public.admin_user_note(uuid,jsonb) to authenticated;
commit;
