-- Preserve existing profiles. Only student graduation requires a validated contact number.
alter table public.profiles add column if not exists mobile_phone text;
alter table public.profiles add constraint profiles_mobile_phone_format_chk
  check (mobile_phone is null or mobile_phone ~ '^01[016789][0-9]{7,8}$');
CREATE OR REPLACE FUNCTION public.update_my_academic_status(p_status text, p_mobile_phone text)
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
  v_mobile text;
  v_status_changed boolean;
begin
  if v_id is null or not private.portal_read_allowed() then
    raise exception 'PORTAL_SESSION_REQUIRED';
  end if;
  if p_status is null or p_status not in ('1','2','leave','graduated') then
    raise exception 'INVALID_ACADEMIC_STATUS';
  end if;

  select * into v_old from public.profiles where user_id=v_id for update;
  if v_old.user_id is null or v_old.signup_type <> 'student'
     or v_old.approval_status <> 'approved'
     or v_old.enrollment_status not in ('enrolled','leave','graduated')
     or exists (select 1 from public.account_roles where user_id=v_id and role='super_admin')
  then
    raise exception 'ACADEMIC_STATUS_CHANGE_NOT_ALLOWED';
  end if;

  if p_status='graduated' then
    if p_mobile_phone is null or btrim(p_mobile_phone) !~ '^[0-9 -]+$' then
      raise exception 'MOBILE_PHONE_REQUIRED';
    end if;
    v_mobile:=regexp_replace(btrim(p_mobile_phone),'[^0-9]','','g');
    if v_mobile !~ '^01[016789][0-9]{7,8}$' then
      raise exception 'INVALID_MOBILE_PHONE';
    end if;
  else
    -- Keep a previously collected number unchanged when switching back.
    v_mobile:=v_old.mobile_phone;
  end if;

  v_enrollment:=case when p_status in ('leave','graduated') then p_status else 'enrolled' end;
  v_grade:=case when p_status in ('leave','graduated') then v_old.academic_year else p_status::smallint end;
  v_status_changed:=v_old.enrollment_status is distinct from v_enrollment
                    or v_old.academic_year is distinct from v_grade;

  if v_status_changed or v_old.mobile_phone is distinct from v_mobile then
    update public.profiles
       set enrollment_status=v_enrollment,
           academic_year=v_grade,
           mobile_phone=v_mobile,
           updated_at=now()
     where user_id=v_id
     returning * into v_new;

    if v_enrollment='enrolled' and v_status_changed then
      insert into public.user_preferences(user_id,preferred_grade)
      values(v_id,v_grade::text)
      on conflict (user_id) do update set preferred_grade=excluded.preferred_grade;
    end if;

    if v_status_changed then
      insert into private.portal_academic_status_history(
        user_id,old_enrollment_status,old_academic_year,new_enrollment_status,new_academic_year
      ) values (
        v_id,v_old.enrollment_status,v_old.academic_year,v_enrollment,v_grade
      );
    end if;
  else
    v_new:=v_old;
  end if;
  return v_new;
end
$function$
;
revoke all on function public.update_my_academic_status(text,text) from public,anon;
grant execute on function public.update_my_academic_status(text,text) to authenticated;
CREATE OR REPLACE FUNCTION public.update_my_academic_status(p_status text)
 RETURNS profiles
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select public.update_my_academic_status(p_status, null::text)
$function$
;
revoke all on function public.update_my_academic_status(text) from public,anon;
grant execute on function public.update_my_academic_status(text) to authenticated;
