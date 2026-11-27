-- Read-only access flags share one session/profile lookup. Existing RLS predicates remain authoritative.
create or replace function private.portal_access_flags()
returns jsonb language sql stable security definer set search_path = '' as $$
 select coalesce((
  select jsonb_build_object('read',true,'write',
   p.enrollment_status in ('enrolled','early_employment') or
   (p.signup_type in ('student','alumni') and p.enrollment_status='graduated'))
  from private.portal_sessions s join public.profiles p on p.user_id=s.user_id
  where s.user_id=(select auth.uid())
   and s.session_id=nullif((select auth.jwt()->>'session_id'),'')::uuid
   and s.revoked_at is null and s.expires_at>now()
   and p.approval_status='approved'
   and (p.enrollment_status in ('enrolled','leave','early_employment')
    or (p.signup_type in ('student','alumni') and p.enrollment_status='graduated'))
 ),jsonb_build_object('read',false,'write',false))
$$;
revoke all on function private.portal_access_flags() from public,anon;
grant execute on function private.portal_access_flags() to authenticated;

create or replace function public.portal_learning_access()
returns jsonb language sql stable security invoker set search_path='' as $$
 select private.portal_access_flags()
$$;

-- Do not attempt an INSERT when the verified session already exists.
create or replace function public.start_portal_session()
returns timestamptz language plpgsql security definer set search_path='' as $$
declare v_sid uuid; v_exp timestamptz; v_email text;
begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
 v_sid := nullif(auth.jwt()->>'session_id','')::uuid;
 if v_sid is null then raise exception 'SESSION_REQUIRED'; end if;
 select email into v_email from auth.users where id=auth.uid() and email_confirmed_at is not null;
 if v_email is null then raise exception 'EMAIL_NOT_VERIFIED'; end if;
 select expires_at into v_exp from private.portal_sessions
 where session_id=v_sid and user_id=auth.uid() and revoked_at is null;
 if v_exp is not null then return v_exp; end if;
 insert into private.portal_sessions(session_id,user_id)
 values(v_sid,auth.uid()) on conflict(session_id) do nothing;
 select expires_at into v_exp from private.portal_sessions
 where session_id=v_sid and user_id=auth.uid() and revoked_at is null;
 if v_exp is null then raise exception 'SESSION_REVOKED'; end if;
 return v_exp;
end $$;

-- One authenticated RPC replaces four sequential calls; profile SELECT remains subject to self-read RLS.
create or replace function public.portal_bootstrap()
returns jsonb language plpgsql security invoker set search_path='' as $$
declare p jsonb; exp timestamptz; access jsonb; admin_allowed boolean;
begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
 select jsonb_build_object('user_id',user_id,'full_name',full_name,'email',email,'student_no',student_no,
  'signup_type',signup_type,'academic_year',academic_year,'enrollment_status',enrollment_status,
  'approval_status',approval_status,'graduation_year',graduation_year,'mobile_phone',mobile_phone)
  into p from public.profiles where user_id=auth.uid();
 if p is null then return jsonb_build_object('profile',null); end if;
 exp:=public.start_portal_session();
 access:=public.portal_learning_access();
 admin_allowed:=case when (access->>'read')::boolean then public.portal_super_admin_allowed() else false end;
 return jsonb_build_object('profile',p,'expires',exp,'access',access,'admin',admin_allowed);
end $$;
revoke all on function public.portal_bootstrap() from public,anon;
grant execute on function public.portal_bootstrap() to authenticated;

-- Supports the actual bank paging/order and incremental attempt ordering.
create index if not exists written_question_bank_exam_question_idx on public.written_question_bank(exam_type,question_id);
create index if not exists written_attempts_user_exam_time_idx on public.written_learning_attempts(user_id,exam_type,attempted_at,question_id,answer);

-- Shared publication snapshot: service role only, never expose unpublished upstream items.
create table if not exists public.portal_calendar_snapshot(
 singleton boolean primary key default true check(singleton),
 payload jsonb not null,
 refreshed_at timestamptz not null default now()
);
alter table public.portal_calendar_snapshot enable row level security;
revoke all on public.portal_calendar_snapshot from public,anon,authenticated;
grant select,insert,update on public.portal_calendar_snapshot to service_role;

