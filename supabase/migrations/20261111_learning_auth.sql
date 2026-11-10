-- K-BigData learning accounts. Apply to a NEW, dedicated Supabase project.
-- Do not run against the professor-union project.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists public.profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null check (char_length(btrim(full_name)) between 2 and 80),
 email text not null,
 student_no text unique,
 approval_status text not null default 'pending'
   check (approval_status in ('pending','approved','rejected','suspended')),
 enrollment_status text not null default 'enrolled'
   check (enrollment_status in ('enrolled','leave','withdrawn','graduated')),
 academic_year smallint,
 class_name text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check(student_no is null or student_no ~ '^[0-9A-Za-z-]{3,30}$')
);
create index if not exists profiles_state_idx on public.profiles(approval_status,enrollment_status);
create table if not exists public.account_roles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 role text not null check (role in ('student','super_admin')),
 created_at timestamptz not null default now()
);
create table if not exists private.portal_sessions (
 session_id uuid primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 established_at timestamptz not null default now(),
 expires_at timestamptz not null default (now()+interval '90 days'),
 revoked_at timestamptz
);
create index if not exists portal_sessions_uid_idx on private.portal_sessions(user_id,expires_at);

-- Public RPC checks *verified* auth.users.email, never client-submitted role/email.
create or replace function public.register_portal_member(p_name text, p_student_no text default null)
returns public.profiles language plpgsql security definer
set search_path = '' as $$
declare v_user auth.users%rowtype; v_profile public.profiles%rowtype; v_admin boolean;
begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
 select * into v_user from auth.users where id = auth.uid();
 if v_user.id is null or v_user.email_confirmed_at is null then raise exception 'EMAIL_NOT_VERIFIED'; end if;
 v_admin := lower(v_user.email) = 'hglee67@kopo.ac.kr';
 if char_length(btrim(coalesce(p_name,''))) not between 2 and 80 then raise exception 'INVALID_NAME'; end if;
 if not v_admin and (p_student_no is null or p_student_no !~ '^[0-9A-Za-z-]{3,30}$') then
   raise exception 'INVALID_STUDENT_NUMBER';
 end if;
 insert into public.profiles(user_id,full_name,email,student_no,approval_status,enrollment_status)
 values (v_user.id,btrim(p_name),lower(v_user.email),
         case when v_admin then null else btrim(p_student_no) end,
         case when v_admin then 'approved' else 'pending' end,'enrolled')
 on conflict (user_id) do nothing;
 insert into public.account_roles(user_id,role)
 values(v_user.id,case when v_admin then 'super_admin' else 'student' end)
 on conflict(user_id) do nothing;
 select * into v_profile from public.profiles where user_id=v_user.id;
 return v_profile;
end $$;

-- Only an actual freshly verified OTP session should call this RPC.
-- A unique auth.session_id is independently time-boxed on the server.
create or replace function public.start_portal_session()
returns timestamptz language plpgsql security definer
set search_path = '' as $$
declare v_sid uuid; v_exp timestamptz; v_email text;
begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
 v_sid := nullif(auth.jwt()->>'session_id','')::uuid;
 if v_sid is null then raise exception 'SESSION_REQUIRED'; end if;
 select email into v_email from auth.users where id=auth.uid() and email_confirmed_at is not null;
 if v_email is null then raise exception 'EMAIL_NOT_VERIFIED'; end if;
 insert into private.portal_sessions(session_id,user_id)
 values(v_sid,auth.uid())
 on conflict(session_id) do nothing; -- Re-using a token cannot extend its 90 days.
 select expires_at into v_exp from private.portal_sessions
 where session_id=v_sid and user_id=auth.uid() and revoked_at is null;
 if v_exp is null then raise exception 'SESSION_REVOKED'; end if;
 return v_exp;
end $$;

create or replace function public.revoke_portal_session()
returns void language plpgsql security definer
set search_path = '' as $$
begin
 update private.portal_sessions set revoked_at=now()
 where session_id=nullif(auth.jwt()->>'session_id','')::uuid and user_id=auth.uid();
end $$;

create or replace function private.portal_read_allowed()
returns boolean language sql stable security definer
set search_path = '' as $$
 select exists (
 select 1 from private.portal_sessions s
 join public.profiles p on p.user_id=s.user_id
 where s.user_id=(select auth.uid())
 and s.session_id=nullif((select auth.jwt()->>'session_id'),'')::uuid
 and s.revoked_at is null and s.expires_at>now()
 and p.approval_status='approved'
 and p.enrollment_status in ('enrolled','leave')
 ) $$;
create or replace function private.portal_write_allowed()
returns boolean language sql stable security definer
set search_path = '' as $$
 select private.portal_read_allowed() and exists(
 select 1 from public.profiles p where p.user_id=(select auth.uid())
 and p.enrollment_status='enrolled'
 ) $$;

create table if not exists public.learning_attempts (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 bank text not null check(bank in ('coding','ncp','practical')),
 question_id text not null check(question_id ~ '^[A-Za-z0-9_-]{1,90}$'),
 client_attempt_id text not null check(char_length(client_attempt_id) between 1 and 160),
 result text not null check(result in ('correct','incorrect','completed','ungraded','timeout')),
 grading_method text not null check(grading_method in ('automatic','self','completion','none')),
 answer_text text not null default '' check(char_length(answer_text)<=10000),
 elapsed_seconds integer check(elapsed_seconds between 0 and 86400),
 used_hint boolean not null default false,
 question_revision text,
 submitted_at timestamptz not null default now(),
 created_at timestamptz not null default now(),
 metadata jsonb not null default '{}'::jsonb,
 unique(user_id,client_attempt_id)
);
create index if not exists learning_attempts_by_user_time on public.learning_attempts(user_id,submitted_at desc);
create index if not exists learning_attempts_by_question on public.learning_attempts(bank,question_id,submitted_at desc);

create table if not exists public.learning_progress (
 user_id uuid not null references auth.users(id) on delete cascade,
 bank text not null check(bank in ('coding','ncp','practical')),
 question_id text not null,
 first_attempt_at timestamptz,
 last_attempt_at timestamptz,
 last_result text,
 attempts_count integer not null default 0,
 correct_count integer not null default 0,
 incorrect_count integer not null default 0,
 primary key(user_id,bank,question_id)
);
create table if not exists public.learning_drafts (
 user_id uuid not null references auth.users(id) on delete cascade,
 bank text not null check(bank in ('coding','ncp','practical')),
 question_id text not null check(question_id ~ '^[A-Za-z0-9_-]{1,90}$'),
 draft_text text not null default '' check(char_length(draft_text)<=10000),
 updated_at timestamptz not null default now(),
 primary key(user_id,bank,question_id)
);
create table if not exists public.learning_preferences (
 user_id uuid not null references auth.users(id) on delete cascade,
 bank text not null check(bank in ('coding','ncp','practical')),
 last_question_id text,
 updated_at timestamptz not null default now(),
 primary key(user_id,bank)
);
create table if not exists public.user_preferences (
 user_id uuid primary key references auth.users(id) on delete cascade,
 weekly_email_opt_in boolean not null default false,
 updated_at timestamptz not null default now()
);
create table if not exists public.report_deliveries (
 id bigint generated always as identity primary key,
 recipient_user_id uuid references auth.users(id) on delete set null,
 recipient_email text not null,
 report_type text not null check(report_type in ('student','super_admin')),
 week_start date not null,
 status text not null check(status in ('pending','sent','failed')),
 provider_id text,
 error_message text,
 sent_at timestamptz,
 created_at timestamptz not null default now(),
 unique(recipient_email,report_type,week_start)
);
-- Immutable attempt log; rebuild progress on INSERT only.
create or replace function private.apply_attempt_to_progress()
returns trigger language plpgsql security definer
set search_path = '' as $$
begin
 insert into public.learning_progress(user_id,bank,question_id,first_attempt_at,last_attempt_at,last_result,
                                     attempts_count,correct_count,incorrect_count)
 values(new.user_id,new.bank,new.question_id,new.submitted_at,new.submitted_at,new.result,1,
        case when new.result='correct' then 1 else 0 end,
        case when new.result='incorrect' then 1 else 0 end)
 on conflict (user_id,bank,question_id) do update
 set first_attempt_at=least(public.learning_progress.first_attempt_at,excluded.first_attempt_at),
 last_attempt_at=greatest(public.learning_progress.last_attempt_at,excluded.last_attempt_at),
 last_result=case when excluded.last_attempt_at>=public.learning_progress.last_attempt_at
                  then excluded.last_result else public.learning_progress.last_result end,
 attempts_count=public.learning_progress.attempts_count+1,
 correct_count=public.learning_progress.correct_count+excluded.correct_count,
 incorrect_count=public.learning_progress.incorrect_count+excluded.incorrect_count;
 return new;
end $$;
drop trigger if exists learning_attempt_progress on public.learning_attempts;
create trigger learning_attempt_progress after insert on public.learning_attempts
for each row execute function private.apply_attempt_to_progress();

alter table public.profiles enable row level security;
alter table public.account_roles enable row level security;
alter table public.learning_attempts enable row level security;
alter table public.learning_progress enable row level security;
alter table public.learning_drafts enable row level security;
alter table public.learning_preferences enable row level security;
alter table public.user_preferences enable row level security;
alter table private.portal_sessions enable row level security;
alter table public.report_deliveries enable row level security;

create policy profiles_self_read on public.profiles for select to authenticated
using (user_id=(select auth.uid()));
create policy roles_self_read on public.account_roles for select to authenticated
using (user_id=(select auth.uid()));
create policy attempts_self_read on public.learning_attempts for select to authenticated
using (user_id=(select auth.uid()) and (select private.portal_read_allowed()));
create policy attempts_self_insert on public.learning_attempts for insert to authenticated
with check(user_id=(select auth.uid()) and (select private.portal_write_allowed()));
create policy progress_self_read on public.learning_progress for select to authenticated
using (user_id=(select auth.uid()) and (select private.portal_read_allowed()));
create policy drafts_self_read on public.learning_drafts for select to authenticated
using (user_id=(select auth.uid()) and (select private.portal_read_allowed()));
create policy drafts_self_insert on public.learning_drafts for insert to authenticated
with check(user_id=(select auth.uid()) and (select private.portal_write_allowed()));
create policy drafts_self_update on public.learning_drafts for update to authenticated
using (user_id=(select auth.uid()) and (select private.portal_write_allowed()))
with check(user_id=(select auth.uid()) and (select private.portal_write_allowed()));
create policy preferences_self_read on public.learning_preferences for select to authenticated
using (user_id=(select auth.uid()) and (select private.portal_read_allowed()));
create policy preferences_self_insert on public.learning_preferences for insert to authenticated
with check(user_id=(select auth.uid()) and (select private.portal_write_allowed()));
create policy preferences_self_update on public.learning_preferences for update to authenticated
using (user_id=(select auth.uid()) and (select private.portal_write_allowed()))
with check(user_id=(select auth.uid()) and (select private.portal_write_allowed()));
create policy user_preferences_self_read on public.user_preferences for select to authenticated
using (user_id=(select auth.uid()) and (select private.portal_read_allowed()));
create policy user_preferences_self_insert on public.user_preferences for insert to authenticated
with check(user_id=(select auth.uid()) and (select private.portal_write_allowed()));
create policy user_preferences_self_update on public.user_preferences for update to authenticated
using (user_id=(select auth.uid()) and (select private.portal_write_allowed()))
with check(user_id=(select auth.uid()) and (select private.portal_write_allowed()));

revoke all on all tables in schema public from anon, authenticated;
grant select on public.profiles,public.account_roles,public.learning_attempts,
 public.learning_progress,public.learning_drafts,public.learning_preferences,
 public.user_preferences to authenticated;
grant insert on public.learning_attempts to authenticated;
grant insert,update on public.learning_drafts,public.learning_preferences,
 public.user_preferences to authenticated;
revoke all on function public.register_portal_member(text,text),
 public.start_portal_session(), public.revoke_portal_session() from public,anon;
grant execute on function public.register_portal_member(text,text),
 public.start_portal_session(), public.revoke_portal_session() to authenticated;
grant usage on schema private to authenticated;
grant execute on function private.portal_read_allowed(),private.portal_write_allowed() to authenticated;
-- Private schema stays unexposed to the Data API. Service-side admin code should
-- use public tables + a service key or carefully scoped SECURITY DEFINER RPC.


-- Audited student state changes (service-role write only).
create table if not exists public.admin_audit_log (
 id bigint generated always as identity primary key,
 actor_user_id uuid references auth.users(id) on delete set null,
 target_user_id uuid references auth.users(id) on delete set null,
 old_status text not null,
 new_status text not null,
 created_at timestamptz not null default now()
);
alter table public.admin_audit_log enable row level security;
revoke all on public.admin_audit_log from anon,authenticated;

-- A JWT-bound, server-enforced session/admin check, for Edge Function authorization.
create or replace function public.portal_super_admin_allowed()
returns boolean language sql stable security definer
set search_path = '' as $$
 select private.portal_read_allowed()
 and exists(
  select 1 from public.account_roles r join public.profiles p on p.user_id=r.user_id
  where r.user_id=(select auth.uid()) and r.role='super_admin'
  and lower(p.email)='hglee67@kopo.ac.kr'
 )
$$;
revoke all on function public.portal_super_admin_allowed() from public,anon;
grant execute on function public.portal_super_admin_allowed() to authenticated;
-- No grants on public.report_deliveries for anon/authenticated; only backend service access.


-- Transactional admin mutation: audited with the status change in one transaction.
-- Only the server's service_role may call this RPC; client roles are denied.
create or replace function public.admin_change_student(
 p_actor_user_id uuid,p_target_user_id uuid,p_approval_status text,p_enrollment_status text)
returns void language plpgsql security definer set search_path = '' as $$
declare old_row public.profiles%rowtype;
begin
 if not exists(
  select 1 from public.account_roles r join public.profiles p on p.user_id=r.user_id
  where r.user_id=p_actor_user_id and r.role='super_admin' and p.approval_status='approved'
  and lower(p.email)='hglee67@kopo.ac.kr'
 ) then raise exception 'ADMIN_NOT_AUTHORIZED'; end if;
 if p_approval_status not in ('pending','approved','rejected','suspended')
 or p_enrollment_status not in ('enrolled','leave','withdrawn','graduated')
 then raise exception 'INVALID_STATUS'; end if;
 select * into old_row from public.profiles where user_id=p_target_user_id for update;
 if old_row.user_id is null then raise exception 'STUDENT_NOT_FOUND'; end if;
 if exists(select 1 from public.account_roles where user_id=old_row.user_id and role='super_admin')
 then raise exception 'CANNOT_CHANGE_ADMIN'; end if;
 update public.profiles set approval_status=p_approval_status,enrollment_status=p_enrollment_status,
 updated_at=now() where user_id=p_target_user_id;
 insert into public.admin_audit_log(actor_user_id,target_user_id,old_status,new_status)
 values(p_actor_user_id,p_target_user_id,
  old_row.approval_status||'/'||old_row.enrollment_status,
  p_approval_status||'/'||p_enrollment_status);
end $$;
revoke all on function public.admin_change_student(uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.admin_change_student(uuid,uuid,text,text) to service_role;
