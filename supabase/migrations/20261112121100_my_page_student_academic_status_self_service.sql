-- Self-service changes only the academic status used inside this portal.
create table if not exists private.portal_academic_status_history (
 id bigint generated always as identity primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 old_enrollment_status text,
 old_academic_year smallint,
 new_enrollment_status text not null,
 new_academic_year smallint,
 changed_at timestamptz not null default now()
);
revoke all on private.portal_academic_status_history from public, anon, authenticated;
create or replace function public.update_my_academic_status(p_status text)
returns public.profiles language plpgsql security definer set search_path to ''
as $body$
declare
 v_id uuid := auth.uid();
 v_old public.profiles%rowtype;
 v_new public.profiles%rowtype;
 v_enrollment text;
 v_grade smallint;
begin
 if v_id is null or not private.portal_read_allowed() then raise exception 'PORTAL_SESSION_REQUIRED'; end if;
 if p_status is null or p_status not in ('1','2','leave') then raise exception 'INVALID_ACADEMIC_STATUS'; end if;
 select * into v_old from public.profiles where user_id=v_id for update;
 if v_old.user_id is null or v_old.signup_type<>'student' or v_old.approval_status<>'approved'
 or v_old.enrollment_status not in ('enrolled','leave')
 or exists(select 1 from public.account_roles where user_id=v_id and role='super_admin')
 then raise exception 'ACADEMIC_STATUS_CHANGE_NOT_ALLOWED'; end if;
 v_enrollment:=case when p_status='leave' then 'leave' else 'enrolled' end;
 v_grade:=case when p_status='leave' then v_old.academic_year else p_status::smallint end;
 if v_old.enrollment_status is distinct from v_enrollment or v_old.academic_year is distinct from v_grade then
   update public.profiles set enrollment_status=v_enrollment,academic_year=v_grade,updated_at=now()
    where user_id=v_id returning * into v_new;
   if v_enrollment='enrolled' then
     insert into public.user_preferences(user_id,preferred_grade) values(v_id,v_grade::text)
     on conflict(user_id) do update set preferred_grade=excluded.preferred_grade;
   end if;
   insert into private.portal_academic_status_history(user_id,old_enrollment_status,old_academic_year,new_enrollment_status,new_academic_year)
    values(v_id,v_old.enrollment_status,v_old.academic_year,v_enrollment,v_grade);
 else v_new:=v_old; end if;
 return v_new;
end $body$;
revoke all on function public.update_my_academic_status(text) from public,anon;
grant execute on function public.update_my_academic_status(text) to authenticated;
