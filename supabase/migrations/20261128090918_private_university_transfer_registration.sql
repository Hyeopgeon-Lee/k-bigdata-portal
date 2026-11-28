-- Member-confirmed transfer information is private, independent of the published alumni profile.
create table private.portal_university_transfers (
  user_id uuid primary key references public.profiles(user_id) on delete cascade,
  transfer_status text not null check (transfer_status in ('none','preparing','accepted','completed')),
  university text,
  department text,
  updated_at timestamptz not null default now(),
  constraint transfer_names_match_status check (
    (transfer_status in ('accepted','completed') and university is not null and department is not null
      and char_length(btrim(university)) between 1 and 120 and char_length(btrim(department)) between 1 and 120)
    or (transfer_status in ('none','preparing') and university is null and department is null)
  )
);
alter table private.portal_university_transfers enable row level security;
revoke all on private.portal_university_transfers from public, anon, authenticated;

create function private.portal_transfer_eligible(p_type text,p_approval text,p_enrollment text,p_grade smallint)
returns boolean language sql immutable set search_path='' as $$
 select coalesce(p_approval='approved' and (
   (p_type='student' and ((p_enrollment='enrolled' and p_grade=2) or p_enrollment in ('early_employment','graduated')))
   or (p_type='alumni' and p_enrollment='graduated')
 ),false);
$$;
revoke all on function private.portal_transfer_eligible(text,text,text,smallint) from public, anon, authenticated;

create function public.my_university_transfer()
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v_id uuid:=auth.uid(); result jsonb;
begin
 if v_id is null or not private.portal_write_allowed() or not exists(
   select 1 from public.profiles p where p.user_id=v_id
     and private.portal_transfer_eligible(p.signup_type,p.approval_status,p.enrollment_status,p.academic_year)
 ) then raise exception 'TRANSFER_NOT_ALLOWED' using errcode='42501'; end if;
 select jsonb_build_object(
   'record',(select to_jsonb(t)-'user_id' from private.portal_university_transfers t where t.user_id=v_id),
   'prior_education',(select jsonb_build_object('university',left(btrim(a.bachelor_school),120),'department',left(btrim(a.bachelor_major),120))
     from public.alumni_profiles a where a.user_id=v_id and nullif(btrim(a.bachelor_school),'') is not null
       and nullif(btrim(a.bachelor_major),'') is not null
       and not exists(select 1 from private.portal_university_transfers t where t.user_id=v_id))
 ) into result;
 return result;
end $$;

create function public.set_my_university_transfer(p_status text,p_university text default null,p_department text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_id uuid:=auth.uid(); member public.profiles%rowtype; saved private.portal_university_transfers%rowtype;
begin
 if v_id is null or not private.portal_write_allowed() then raise exception 'TRANSFER_NOT_ALLOWED' using errcode='42501'; end if;
 select * into member from public.profiles where user_id=v_id for share;
 if not private.portal_transfer_eligible(member.signup_type,member.approval_status,member.enrollment_status,member.academic_year)
   then raise exception 'TRANSFER_NOT_ALLOWED' using errcode='42501'; end if;
 if p_status is null or p_status not in ('none','preparing','accepted','completed') then
   raise exception 'INVALID_TRANSFER_STATUS' using errcode='22023';
 end if;
 if p_status in ('accepted','completed') then
   p_university:=nullif(btrim(p_university),'');
   p_department:=nullif(btrim(p_department),'');
   if p_university is null or p_department is null or char_length(p_university)>120 or char_length(p_department)>120
     then raise exception 'TRANSFER_NAMES_REQUIRED' using errcode='22023'; end if;
 else
   p_university:=null; p_department:=null;
 end if;
 insert into private.portal_university_transfers(user_id,transfer_status,university,department)
 values(v_id,p_status,p_university,p_department)
 on conflict(user_id) do update set transfer_status=excluded.transfer_status,
   university=excluded.university,department=excluded.department,updated_at=now()
 returning * into saved;
 return to_jsonb(saved)-'user_id';
end $$;

-- Administrator report is paginated, with summaries for the selected cohort/search
-- independent of the status filter. Unregistered is distinct from an explicit 'none'.
create function public.admin_university_transfers(
 p_cohort text default 'all',p_status text default 'all',p_graduation_year integer default null,
 p_search text default '',p_page integer default 1,p_user_id uuid default null)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb; v_page integer:=least(greatest(coalesce(p_page,1),1),10000);
begin
 if auth.uid() is null or not public.portal_super_admin_allowed() then raise exception 'ADMIN_NOT_AUTHORIZED' using errcode='42501'; end if;
 if coalesce(p_cohort,'all') not in ('all','second','early','graduated')
   or coalesce(p_status,'all') not in ('all','unregistered','none','preparing','accepted','completed')
   or char_length(coalesce(p_search,''))>120 then raise exception 'INVALID_TRANSFER_FILTER' using errcode='22023'; end if;
 with eligible as materialized (
   select p.user_id,p.full_name,p.student_no,p.academic_year,p.graduation_year,p.enrollment_status,
      coalesce(t.transfer_status,'unregistered') transfer_status,t.university,t.department,t.updated_at
   from public.profiles p left join private.portal_university_transfers t on t.user_id=p.user_id
   where private.portal_transfer_eligible(p.signup_type,p.approval_status,p.enrollment_status,p.academic_year)
 ), matching as materialized (
   select e.* from eligible e
   where (coalesce(p_cohort,'all')='all' or
      (p_cohort='second' and e.enrollment_status='enrolled' and e.academic_year=2) or
      (p_cohort='early' and e.enrollment_status='early_employment') or
      (p_cohort='graduated' and e.enrollment_status='graduated'))
     and (p_graduation_year is null or e.graduation_year=p_graduation_year)
     and (p_user_id is null or e.user_id=p_user_id)
     and (nullif(btrim(p_search),'') is null or strpos(lower(concat_ws(' ',e.full_name,e.student_no,e.university,e.department)),lower(btrim(p_search)))>0)
 ), filtered as materialized (
   select m.* from matching m where coalesce(p_status,'all')='all' or m.transfer_status=p_status
 ), counts as (
   select transfer_status,count(*) n from matching group by transfer_status
 ), schools as (
   select university,count(*) n from matching where transfer_status in ('accepted','completed') group by university order by n desc,university
 ), majors as (
   select department,count(*) n from matching where transfer_status in ('accepted','completed') group by department order by n desc,department
 )
 select jsonb_build_object(
  'counts',coalesce((select jsonb_object_agg(transfer_status,n) from counts),'{}'::jsonb),
  'schools',coalesce((select jsonb_agg(to_jsonb(s) order by s.n desc,s.university) from schools s),'[]'::jsonb),
  'majors',coalesce((select jsonb_agg(to_jsonb(d) order by d.n desc,d.department) from majors d),'[]'::jsonb),
  'years',coalesce((select jsonb_agg(y.graduation_year order by y.graduation_year desc) from
      (select distinct graduation_year from eligible where graduation_year is not null)y),'[]'::jsonb),
  'total',(select count(*) from filtered),
  'rows',coalesce((select jsonb_agg(to_jsonb(q) order by q.full_name,q.user_id) from
      (select * from filtered order by full_name,user_id limit 25 offset (v_page-1)*25)q),'[]'::jsonb)
 ) into result;
 return result;
end $$;

revoke all on function public.my_university_transfer(),public.set_my_university_transfer(text,text,text),
  public.admin_university_transfers(text,text,integer,text,integer,uuid) from public, anon, authenticated;
grant execute on function public.my_university_transfer(),public.set_my_university_transfer(text,text,text),
  public.admin_university_transfers(text,text,integer,text,integer,uuid) to authenticated;
