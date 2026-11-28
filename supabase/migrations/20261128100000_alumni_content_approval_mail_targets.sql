-- Optional alumni announcements for enrolled students; weekly learning report consent is independent.
create table if not exists public.student_alumni_mail_preferences (
 user_id uuid primary key references public.profiles(user_id) on delete cascade,
 career_enabled boolean not null default false,
 news_enabled boolean not null default false,
 updated_at timestamptz not null default now()
);
alter table public.student_alumni_mail_preferences enable row level security;
revoke all on public.student_alumni_mail_preferences from public,anon,authenticated;
grant select,insert,update on public.student_alumni_mail_preferences to service_role;

create or replace function public.my_student_alumni_mail_preferences()
returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('career_enabled',coalesce(m.career_enabled,false),'news_enabled',coalesce(m.news_enabled,false))
 from public.profiles p left join public.student_alumni_mail_preferences m on m.user_id=p.user_id
 where p.user_id=auth.uid() and p.approval_status='approved' and p.signup_type='student' and p.enrollment_status='enrolled';
$$;
create or replace function public.set_my_student_alumni_mail_preferences(p_career boolean,p_news boolean)
returns void language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.profiles p where p.user_id=auth.uid() and p.approval_status='approved'
  and p.signup_type='student' and p.enrollment_status='enrolled') then raise exception 'NOT_ENROLLED_STUDENT'; end if;
 insert into public.student_alumni_mail_preferences(user_id,career_enabled,news_enabled)
 values(auth.uid(),coalesce(p_career,false),coalesce(p_news,false))
 on conflict(user_id) do update set career_enabled=excluded.career_enabled,news_enabled=excluded.news_enabled,updated_at=now();
end;
$$;
revoke all on function public.my_student_alumni_mail_preferences() from public,anon;
revoke all on function public.set_my_student_alumni_mail_preferences(boolean,boolean) from public,anon;
grant execute on function public.my_student_alumni_mail_preferences() to authenticated;
grant execute on function public.set_my_student_alumni_mail_preferences(boolean,boolean) to authenticated;

alter table public.alumni_dispatch_logs add column if not exists target_groups text;
alter table public.alumni_dispatch_logs add column if not exists actor_user_id uuid;

-- Only the trusted Edge Function can resolve verified, consenting recipients.
-- Legacy digest and individually mailed jobs share recipient-level deduplication.
create or replace function public.alumni_mail_recipients(p_kind text,p_record text,p_groups text[])
returns jsonb language sql stable security definer set search_path='' as $$
 with eligible as (
  select lower(trim(u.email)) as email,
   case when p.enrollment_status='enrolled' then 'grade'||p.academic_year::text else 'alumni' end as group_key
  from public.profiles p join auth.users u on u.id=p.user_id
  left join public.alumni_profiles a on a.user_id=p.user_id
  left join public.student_alumni_mail_preferences s on s.user_id=p.user_id
  where p.approval_status='approved' and u.email_confirmed_at is not null
   and u.email is not null and trim(u.email)<>'' and (u.banned_until is null or u.banned_until<=now())
   and p_kind in ('jobs','alumni_news')
   and (
    (p.signup_type='student' and p.enrollment_status='enrolled' and p.academic_year in (1,2)
     and ('grade'||p.academic_year::text)=any(p_groups)
     and case when p_kind='jobs' then s.career_enabled else s.news_enabled end)
    or (p.signup_type in ('student','alumni') and (p.enrollment_status='graduated' or
       (p.enrollment_status='early_employment' and p.alumni_source_id is not null))
     and 'alumni'=any(p_groups)
     and case when p_kind='jobs' then lower(trim(a.career_mail_enabled)) in ('true','1','yes','on')
          else lower(trim(a.alumni_news_mail_enabled)) in ('true','1','yes','on') end)
   )
 ), unique_recipients as (
  select distinct on (email) email,group_key from eligible order by email,group_key
 ), delivered as (
  select lower(trim(o.recipient)) as email,
    bool_or(o.status='sent') as sent,bool_or(o.status='sending') as sending
  from public.alumni_network_mail_outbox o
  where (p_kind='alumni_news' and o.event_type='news_digest' and o.record_kind='alumni_news' and o.record_id=p_record)
   or (p_kind='jobs' and (
    (o.event_type='job_item' and o.record_kind='jobs' and o.record_id=p_record)
    or (o.event_type='job_digest' and o.record_kind='job_mail_logs' and p_record=any(string_to_array(o.record_id,'_')))
   ))
  group by lower(trim(o.recipient))
 )
 select coalesce(jsonb_agg(jsonb_build_object('email',r.email,'group',r.group_key,
  'sent',coalesce(d.sent,false),'sending',coalesce(d.sending,false)) order by r.email),'[]'::jsonb)
 from unique_recipients r left join delivered d using(email);
$$;
revoke all on function public.alumni_mail_recipients(text,text,text[]) from public,anon,authenticated;
grant execute on function public.alumni_mail_recipients(text,text,text[]) to service_role;
