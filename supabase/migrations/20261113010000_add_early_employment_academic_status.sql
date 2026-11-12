-- 조기취업은 정식 졸업과 별개의 포털 학적 상태입니다.
-- 수업/자율학습 의무 대상에서는 제외하되 문제풀이와 기록 열람은 유지합니다.
alter table public.profiles drop constraint if exists profiles_enrollment_status_check;
alter table public.profiles add constraint profiles_enrollment_status_check
 check (enrollment_status in ('enrolled','leave','withdrawn','graduated','early_employment'));

alter table public.portal_alumni_import_queue
 add column if not exists target_enrollment_status text not null default 'graduated';
alter table public.portal_alumni_import_queue
 add constraint portal_alumni_import_target_status_chk
 check (target_enrollment_status in ('graduated','early_employment'));

create or replace function private.portal_read_allowed()
 returns boolean language sql stable security definer set search_path to ''
as $function$
 select exists(
  select 1 from private.portal_sessions s
  join public.profiles p on p.user_id=s.user_id
  where s.user_id=(select auth.uid())
   and s.session_id=nullif((select auth.jwt()->>'session_id'),'')::uuid
   and s.revoked_at is null and s.expires_at>now()
   and p.approval_status='approved'
   and (p.enrollment_status in ('enrolled','leave','early_employment')
     or (p.signup_type in ('student','alumni') and p.enrollment_status='graduated'))
 )
$function$;

create or replace function private.portal_write_allowed()
 returns boolean language sql stable security definer set search_path to ''
as $function$
 select private.portal_read_allowed() and exists(
  select 1 from public.profiles p where p.user_id=(select auth.uid())
   and (p.enrollment_status in ('enrolled','early_employment')
     or (p.signup_type in ('student','alumni') and p.enrollment_status='graduated'))
 )
$function$;

create or replace function public.update_my_academic_status(p_status text, p_mobile_phone text)
 returns public.profiles language plpgsql security definer set search_path to ''
as $function$
declare
 v_id uuid:=auth.uid();
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
 if p_status is null or p_status not in ('1','2','leave','graduated','early_employment') then
  raise exception 'INVALID_ACADEMIC_STATUS';
 end if;
 select * into v_old from public.profiles where user_id=v_id for update;
 if v_old.user_id is null or v_old.signup_type<>'student'
  or v_old.approval_status<>'approved'
  or v_old.enrollment_status not in ('enrolled','leave','graduated','early_employment')
  or exists(select 1 from public.account_roles where user_id=v_id and role='super_admin')
 then raise exception 'ACADEMIC_STATUS_CHANGE_NOT_ALLOWED'; end if;
 if p_status='graduated' then
  if p_mobile_phone is null or btrim(p_mobile_phone) !~ '^[0-9 -]+$' then
   raise exception 'MOBILE_PHONE_REQUIRED';
  end if;
  v_mobile:=regexp_replace(btrim(p_mobile_phone),'[^0-9]','','g');
  if v_mobile !~ '^01[016789][0-9]{7,8}$' then
   raise exception 'INVALID_MOBILE_PHONE';
  end if;
 else
  v_mobile:=v_old.mobile_phone;
 end if;
 v_enrollment:=case when p_status in ('leave','graduated','early_employment') then p_status else 'enrolled' end;
 v_grade:=case when p_status in ('leave','graduated','early_employment') then v_old.academic_year else p_status::smallint end;
 v_status_changed:=v_old.enrollment_status is distinct from v_enrollment
  or v_old.academic_year is distinct from v_grade;
 if v_status_changed or v_old.mobile_phone is distinct from v_mobile then
  update public.profiles set enrollment_status=v_enrollment,academic_year=v_grade,
   mobile_phone=v_mobile,updated_at=now() where user_id=v_id returning * into v_new;
  if v_enrollment='enrolled' and v_status_changed and v_grade in (1,2) then
   insert into public.user_preferences(user_id,preferred_grade)
    values(v_id,v_grade::text)
    on conflict(user_id) do update set preferred_grade=excluded.preferred_grade;
  end if;
  if v_status_changed then
   insert into private.portal_academic_status_history(
    user_id,old_enrollment_status,old_academic_year,new_enrollment_status,new_academic_year
   ) values(
    v_id,v_old.enrollment_status,v_old.academic_year,v_enrollment,v_grade
   );
  end if;
 else v_new:=v_old;
 end if;
 return v_new;
end
$function$;
revoke all on function public.update_my_academic_status(text,text) from public,anon;
grant execute on function public.update_my_academic_status(text,text) to authenticated;

create or replace function public.admin_update_student(
 p_target_user_id uuid, p_approval_status text, p_enrollment_status text
) returns void language plpgsql security definer set search_path to ''
as $function$
declare old_row public.profiles%rowtype;
begin
 if not public.portal_super_admin_allowed() then raise exception 'ADMIN_NOT_AUTHORIZED'; end if;
 if p_approval_status not in ('pending','approved','rejected','suspended')
  or p_enrollment_status not in ('enrolled','leave','withdrawn','graduated','early_employment')
 then raise exception 'INVALID_STATUS'; end if;
 select * into old_row from public.profiles where user_id=p_target_user_id for update;
 if old_row.user_id is null then raise exception 'STUDENT_NOT_FOUND'; end if;
 if exists(select 1 from public.account_roles where user_id=old_row.user_id and role='super_admin')
 then raise exception 'CANNOT_CHANGE_ADMIN'; end if;
 update public.profiles set approval_status=p_approval_status,enrollment_status=p_enrollment_status,
  updated_at=now() where user_id=p_target_user_id;
 insert into public.admin_audit_log(actor_user_id,target_user_id,old_status,new_status)
 values(auth.uid(),p_target_user_id,
  old_row.approval_status||'/'||old_row.enrollment_status,
  p_approval_status||'/'||p_enrollment_status);
 if p_approval_status <> 'approved' or p_enrollment_status in ('withdrawn','graduated') then
  update private.portal_sessions set revoked_at=now()
   where user_id=p_target_user_id and revoked_at is null;
 end if;
end
$function$;
