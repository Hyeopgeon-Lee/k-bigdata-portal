-- Graduates registered in alumni/alumni.html cannot change academic status in My Page.
-- Includes students who were early employed; only the administrator's distinct
-- account management flow can correct academic records thereafter.
-- Existing academic change grants/one-argument wrapper are preserved.

CREATE OR REPLACE FUNCTION public.my_alumni_profile_registered()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 v_id uuid:=auth.uid();
begin
 if v_id is null or not private.portal_read_allowed() then
  raise exception 'PORTAL_SESSION_REQUIRED';
 end if;
 return exists(select 1 from public.alumni_profiles a where a.user_id=v_id);
end
$function$;
revoke all on function public.my_alumni_profile_registered() from public,anon;
grant execute on function public.my_alumni_profile_registered() to authenticated;

CREATE OR REPLACE FUNCTION public.update_my_academic_status(p_status text, p_mobile_phone text)
 RETURNS profiles
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 v_id uuid:=auth.uid();
 v_old public.profiles%rowtype;
 v_new public.profiles%rowtype;
 v_enrollment text;
 v_grade smallint;
 v_status_changed boolean;
begin
 if v_id is null or not private.portal_read_allowed() then
  raise exception 'PORTAL_SESSION_REQUIRED';
 end if;
 if p_status is null or p_status not in ('1','2','leave','graduated','early_employment') then
  raise exception 'INVALID_ACADEMIC_STATUS';
 end if;
 select * into v_old from public.profiles where user_id=v_id for update;
 if v_old.user_id is null or v_old.signup_type<>'student'
  or v_old.approval_status<>'approved'
  or v_old.enrollment_status not in ('enrolled','leave','graduated','early_employment')
  or exists(select 1 from public.account_roles where user_id=v_id and role='super_admin')
  or exists(select 1 from public.alumni_profiles a where a.user_id=v_id)
 then raise exception 'ACADEMIC_STATUS_CHANGE_NOT_ALLOWED'; end if;
 v_enrollment:=case when p_status in ('leave','graduated','early_employment') then p_status else 'enrolled' end;
 v_grade:=case when p_status in ('leave','graduated','early_employment') then v_old.academic_year else p_status::smallint end;
 v_status_changed:=v_old.enrollment_status is distinct from v_enrollment
  or v_old.academic_year is distinct from v_grade;
 if v_status_changed then
  update public.profiles set enrollment_status=v_enrollment,academic_year=v_grade,
   updated_at=now() where user_id=v_id returning * into v_new;
  if v_enrollment='enrolled' and v_grade in (1,2) then
   insert into public.user_preferences(user_id,preferred_grade)
    values(v_id,v_grade::text)
    on conflict(user_id) do update set preferred_grade=excluded.preferred_grade;
  end if;
  insert into private.portal_academic_status_history(
    user_id,old_enrollment_status,old_academic_year,new_enrollment_status,new_academic_year
  ) values(
    v_id,v_old.enrollment_status,v_old.academic_year,v_enrollment,v_grade
  );
 else v_new:=v_old;
 end if;
 return v_new;
end
$function$
;

