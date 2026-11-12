-- Portal mobile phone contact: required on new signup, editable on My Page.
-- Historical members without phone numbers remain valid and can add one later.
-- Graduating no longer requires entering or changing a mobile number.

CREATE OR REPLACE FUNCTION public.register_portal_member_v4(p_name text, p_student_no text, p_signup_type text, p_graduation_year integer, p_academic_year smallint, p_mobile_phone text)
 RETURNS profiles
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 v_user auth.users%rowtype;
 v_profile public.profiles%rowtype;
 v_is_professor_email boolean;
 v_mobile text;
begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
 select * into v_user from auth.users where id=auth.uid();
 if v_user.id is null or v_user.email_confirmed_at is null then
  raise exception 'EMAIL_NOT_VERIFIED';
 end if;
 v_is_professor_email := lower(v_user.email)='hglee67@kopo.ac.kr';
 if char_length(btrim(coalesce(p_name,''))) not between 2 and 80 then
  raise exception 'INVALID_NAME';
 end if;
 if p_signup_type is null or p_signup_type not in ('student','alumni') then
  raise exception 'INVALID_TYPE';
 end if;
 if p_signup_type='alumni' and
   (p_student_no is not null or p_graduation_year is null
    or p_graduation_year not between 1900 and extract(year from current_date)
    or p_academic_year is not null) then
  raise exception 'INVALID_ALUMNI';
 end if;
 if p_signup_type='student' and p_graduation_year is not null then
  raise exception 'INVALID_YEAR';
 end if;
 if not v_is_professor_email and p_signup_type='student'
  and (p_student_no is null or btrim(p_student_no) !~ '^[0-9A-Za-z-]{3,30}$') then
  raise exception 'INVALID_STUDENT_NUMBER';
 end if;
 if (not v_is_professor_email and p_signup_type='student'
     and (p_academic_year is null or p_academic_year not in (1,2)))
    or (v_is_professor_email and p_academic_year is not null) then
  raise exception 'INVALID_GRADE';
 end if;
 if not v_is_professor_email then
  if p_mobile_phone is null or btrim(p_mobile_phone) !~ '^[0-9 -]+$' then
   raise exception 'MOBILE_PHONE_REQUIRED';
  end if;
  v_mobile:=regexp_replace(btrim(p_mobile_phone),'[^0-9]','','g');
  if v_mobile !~ '^01[016789][0-9]{7,8}$' then
   raise exception 'INVALID_MOBILE_PHONE';
  end if;
 else
  v_mobile:=null;
 end if;
 insert into public.profiles
  (user_id,full_name,email,student_no,approval_status,enrollment_status,
   signup_type,graduation_year,academic_year,mobile_phone)
 values
  (v_user.id,btrim(p_name),lower(v_user.email),
   case when v_is_professor_email then null else btrim(p_student_no) end,
   'pending',case when p_signup_type='alumni' then 'graduated' else 'enrolled' end,
   case when v_is_professor_email then 'staff' else p_signup_type end,
   p_graduation_year,
   case when v_is_professor_email or p_signup_type='alumni'
    then null else p_academic_year end,v_mobile)
 on conflict(user_id) do nothing;
 insert into public.account_roles(user_id,role)
  values(v_user.id,'student') on conflict(user_id) do nothing;
 if not v_is_professor_email and p_signup_type='student' then
  insert into public.user_preferences(user_id,preferred_grade)
   values(v_user.id,p_academic_year::text)
   on conflict(user_id) do nothing;
 end if;
 select * into v_profile from public.profiles where user_id=v_user.id;
 return v_profile;
end
$function$
;

CREATE OR REPLACE FUNCTION public.update_my_mobile_phone(p_mobile_phone text)
 RETURNS profiles
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 v_id uuid:=auth.uid();
 v_old public.profiles%rowtype;
 v_new public.profiles%rowtype;
 v_mobile text;
begin
 if v_id is null or not private.portal_read_allowed() then
  raise exception 'PORTAL_SESSION_REQUIRED';
 end if;
 if p_mobile_phone is null or btrim(p_mobile_phone) !~ '^[0-9 -]+$' then
  raise exception 'MOBILE_PHONE_REQUIRED';
 end if;
 v_mobile:=regexp_replace(btrim(p_mobile_phone),'[^0-9]','','g');
 if v_mobile !~ '^01[016789][0-9]{7,8}$' then
  raise exception 'INVALID_MOBILE_PHONE';
 end if;
 select * into v_old from public.profiles where user_id=v_id for update;
 if v_old.user_id is null or v_old.signup_type not in ('student','alumni')
   or v_old.approval_status <> 'approved'
   or v_old.enrollment_status='withdrawn' then
  raise exception 'PHONE_CHANGE_NOT_ALLOWED';
 end if;
 if v_old.mobile_phone is distinct from v_mobile then
  update public.profiles
  set mobile_phone=v_mobile,updated_at=now()
  where user_id=v_id returning * into v_new;
 else
  v_new:=v_old;
 end if;
 return v_new;
end
$function$
;

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

revoke all on function public.register_portal_member_v4(text,text,text,integer,smallint,text) from public,anon;
grant execute on function public.register_portal_member_v4(text,text,text,integer,smallint,text) to authenticated;
revoke all on function public.update_my_mobile_phone(text) from public,anon;
grant execute on function public.update_my_mobile_phone(text) to authenticated;
