-- Applied in Supabase under migration version 20261112102547.
-- profiles.academic_year records current grade 1/2, not admission year.
alter table public.profiles
  add constraint profiles_academic_year_grade
  check (academic_year is null or (signup_type = 'student' and academic_year in (1,2)));

CREATE OR REPLACE FUNCTION public.register_portal_member_v3(p_name text, p_student_no text, p_signup_type text, p_graduation_year integer, p_academic_year smallint)
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
  if char_length(btrim(coalesce(p_name, ''))) not between 2 and 80 then
    raise exception 'INVALID_NAME';
  end if;
  if p_signup_type is null or p_signup_type not in ('student', 'alumni') then
    raise exception 'INVALID_TYPE';
  end if;
  if p_signup_type = 'alumni' and
     (p_student_no is not null or p_graduation_year is null
      or p_graduation_year not between 1900 and extract(year from current_date)
      or p_academic_year is not null) then
    raise exception 'INVALID_ALUMNI';
  end if;
  if p_signup_type = 'student' and p_graduation_year is not null then
    raise exception 'INVALID_YEAR';
  end if;
  if not v_is_professor_email and p_signup_type = 'student' and
     (p_student_no is null or btrim(p_student_no) !~ '^[0-9A-Za-z-]{3,30}$') then
    raise exception 'INVALID_STUDENT_NUMBER';
  end if;
  if (not v_is_professor_email and p_signup_type = 'student'
      and (p_academic_year is null or p_academic_year not in (1, 2)))
      or (v_is_professor_email and p_academic_year is not null) then
    raise exception 'INVALID_GRADE';
  end if;

  insert into public.profiles
    (user_id, full_name, email, student_no, approval_status,
     enrollment_status, signup_type, graduation_year, academic_year)
  values
    (v_user.id, btrim(p_name), lower(v_user.email),
     case when v_is_professor_email then null else btrim(p_student_no) end,
     'pending',
     case when p_signup_type = 'alumni' then 'graduated' else 'enrolled' end,
     case when v_is_professor_email then 'staff' else p_signup_type end,
     p_graduation_year,
     case when v_is_professor_email or p_signup_type = 'alumni'
          then null else p_academic_year end)
  on conflict (user_id) do nothing;

  insert into public.account_roles(user_id, role)
  values (v_user.id, 'student')
  on conflict (user_id) do nothing;

  -- Initializes the dashboard without requiring a separate login preference step.
  if not v_is_professor_email and p_signup_type = 'student' then
    insert into public.user_preferences(user_id, preferred_grade)
    values (v_user.id, p_academic_year::text)
    on conflict (user_id) do nothing;
  end if;

  select * into v_profile from public.profiles where user_id = v_user.id;
  return v_profile;
end
$function$;

revoke all on function public.register_portal_member_v3(text,text,text,integer,smallint) from public, anon;
grant execute on function public.register_portal_member_v3(text,text,text,integer,smallint) to authenticated;
