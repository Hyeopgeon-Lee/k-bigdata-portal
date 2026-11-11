alter table public.profiles add column signup_type text not null default 'student', add column graduation_year integer;
update public.profiles set signup_type='staff' where lower(email)='hglee67@kopo.ac.kr';
alter table public.profiles add constraint profiles_signup_identity check (
 (signup_type='student' and student_no is not null and graduation_year is null) or
 (signup_type='staff' and graduation_year is null and lower(email)='hglee67@kopo.ac.kr') or
 (signup_type='alumni' and student_no is null and graduation_year is not null and graduation_year between 1900 and extract(year from current_date)));
alter table public.profiles enable row level security;
revoke insert,update,delete on public.profiles,public.account_roles from anon,authenticated;
create unique index profiles_email_ci on public.profiles(lower(email));
CREATE OR REPLACE FUNCTION private.portal_read_allowed()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select exists (
 select 1 from private.portal_sessions s
 join public.profiles p on p.user_id=s.user_id
 where s.user_id=(select auth.uid())
 and s.session_id=nullif((select auth.jwt()->>'session_id'),'')::uuid
 and s.revoked_at is null and s.expires_at>now()
 and p.approval_status='approved'
 and (p.enrollment_status in ('enrolled','leave') or (p.signup_type='alumni' and p.enrollment_status='graduated'))
 ) $function$
;
CREATE OR REPLACE FUNCTION private.portal_write_allowed()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select private.portal_read_allowed() and exists(
 select 1 from public.profiles p where p.user_id=(select auth.uid())
 and (p.enrollment_status='enrolled' or (p.signup_type='alumni' and p.enrollment_status='graduated'))
 ) $function$
;
CREATE OR REPLACE FUNCTION public.register_portal_member_v2(p_name text, p_student_no text, p_signup_type text, p_graduation_year integer)
 RETURNS profiles
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_user auth.users%rowtype;
  v_profile public.profiles%rowtype;
  v_is_professor_email boolean;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into v_user from auth.users where id = auth.uid();
  if v_user.id is null or v_user.email_confirmed_at is null then
    raise exception 'EMAIL_NOT_VERIFIED';
  end if;
  v_is_professor_email := lower(v_user.email) = 'hglee67@kopo.ac.kr';
  if char_length(btrim(coalesce(p_name,''))) not between 2 and 80 then
    raise exception 'INVALID_NAME';
  end if;
  if p_signup_type is null or p_signup_type not in ('student','alumni') then raise exception 'INVALID_TYPE'; end if;
  if p_signup_type='alumni' and (p_student_no is not null or p_graduation_year is null or p_graduation_year not between 1900 and extract(year from current_date)) then raise exception 'INVALID_ALUMNI'; end if;
  if p_signup_type='student' and p_graduation_year is not null then raise exception 'INVALID_YEAR'; end if;
  if not v_is_professor_email and p_signup_type='student'
      and (p_student_no is null or btrim(p_student_no) !~ '^[0-9A-Za-z-]{3,30}$') then
    raise exception 'INVALID_STUDENT_NUMBER';
  end if;
  insert into public.profiles
      (user_id, full_name, email, student_no, approval_status, enrollment_status, signup_type, graduation_year)
  values
      (v_user.id, btrim(p_name), lower(v_user.email),
       case when v_is_professor_email then null else btrim(p_student_no) end,
       'pending', case when p_signup_type='alumni' then 'graduated' else 'enrolled' end, case when v_is_professor_email then 'staff' else p_signup_type end,p_graduation_year)
  on conflict (user_id) do nothing;
  insert into public.account_roles(user_id, role)
  values (v_user.id, 'student')
  on conflict (user_id) do nothing;
  select * into v_profile from public.profiles where user_id=v_user.id;
  return v_profile;
end $function$
;
revoke all on function public.register_portal_member_v2(text,text,text,integer) from public,anon;
grant execute on function public.register_portal_member_v2(text,text,text,integer) to authenticated;
