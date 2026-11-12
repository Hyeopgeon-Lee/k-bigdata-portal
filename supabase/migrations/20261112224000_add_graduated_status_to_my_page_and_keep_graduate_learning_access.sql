-- Preserve existing student accounts on graduation. Graduation is a portal-only state.
-- The historical study logs, preferred grade, academic year, and student number stay intact.
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
    and (p.enrollment_status in ('enrolled','leave')
      or (p.signup_type in ('student','alumni') and p.enrollment_status='graduated'))
 ) $function$
;

CREATE OR REPLACE FUNCTION private.portal_write_allowed()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select private.portal_read_allowed() and exists (
  select 1 from public.profiles p
  where p.user_id=(select auth.uid())
    and (p.enrollment_status='enrolled'
      or (p.signup_type in ('student','alumni') and p.enrollment_status='graduated'))
 ) $function$
;

CREATE OR REPLACE FUNCTION private.portal_study_write_allowed()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select private.portal_write_allowed() and exists (
  select 1 from public.profiles p
  where p.user_id=(select auth.uid())
    and p.signup_type='student' and p.enrollment_status='enrolled'
 ) $function$
;
revoke all on function private.portal_study_write_allowed() from public,anon;
grant execute on function private.portal_study_write_allowed() to authenticated;
alter policy study_plans_self_insert on public.study_weekly_plans
  with check (user_id=(select auth.uid()) and (select private.portal_study_write_allowed()));
alter policy study_plans_self_update on public.study_weekly_plans
  using (user_id=(select auth.uid()) and (select private.portal_study_write_allowed()))
  with check (user_id=(select auth.uid()) and (select private.portal_study_write_allowed()));
alter policy study_absence_self_insert on public.study_absence_reasons
  with check (user_id=(select auth.uid()) and (select private.portal_study_write_allowed()));
alter policy study_absence_self_update on public.study_absence_reasons
  using (user_id=(select auth.uid()) and (select private.portal_study_write_allowed()))
  with check (user_id=(select auth.uid()) and (select private.portal_study_write_allowed()));
CREATE OR REPLACE FUNCTION public.study_start_session()
 RETURNS study_sessions
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 uid uuid:=auth.uid();
 row_data public.study_sessions;
begin
 if uid is null or not private.portal_study_write_allowed() then
  raise exception 'Not eligible to record study';
 end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(uid::text,221));
 select * into row_data from public.study_sessions
  where user_id=uid and status='active' limit 1;
 if found then return row_data; end if;
 insert into public.study_sessions(user_id) values(uid) returning * into row_data;
 return row_data;
end $function$
;
CREATE OR REPLACE FUNCTION public.update_my_academic_status(p_status text)
 RETURNS profiles
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 v_id uuid := auth.uid();
 v_old public.profiles%rowtype;
 v_new public.profiles%rowtype;
 v_enrollment text;
 v_grade smallint;
begin
 if v_id is null or not private.portal_read_allowed() then
   raise exception 'PORTAL_SESSION_REQUIRED';
 end if;
 if p_status is null or p_status not in ('1','2','leave','graduated') then
   raise exception 'INVALID_ACADEMIC_STATUS';
 end if;
 select * into v_old from public.profiles where user_id=v_id for update;
 if v_old.user_id is null or v_old.signup_type<>'student'
    or v_old.approval_status<>'approved'
    or v_old.enrollment_status not in ('enrolled','leave','graduated')
    or exists (select 1 from public.account_roles where user_id=v_id and role='super_admin')
 then
   raise exception 'ACADEMIC_STATUS_CHANGE_NOT_ALLOWED';
 end if;
 v_enrollment := case when p_status in ('leave','graduated') then p_status else 'enrolled' end;
 v_grade := case when p_status in ('leave','graduated') then v_old.academic_year else p_status::smallint end;
 if v_old.enrollment_status is distinct from v_enrollment
    or v_old.academic_year is distinct from v_grade then
   update public.profiles
   set enrollment_status=v_enrollment, academic_year=v_grade, updated_at=now()
   where user_id=v_id returning * into v_new;
   if v_enrollment='enrolled' then
     insert into public.user_preferences(user_id,preferred_grade)
     values(v_id,v_grade::text)
     on conflict (user_id) do update set preferred_grade=excluded.preferred_grade;
   end if;
   insert into private.portal_academic_status_history(
     user_id,old_enrollment_status,old_academic_year,new_enrollment_status,new_academic_year
   ) values (
     v_id,v_old.enrollment_status,v_old.academic_year,v_enrollment,v_grade
   );
 else v_new:=v_old;
 end if;
 return v_new;
end $function$
;
revoke all on function public.update_my_academic_status(text) from public,anon;
grant execute on function public.update_my_academic_status(text) to authenticated;
