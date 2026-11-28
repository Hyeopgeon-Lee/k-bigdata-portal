-- Only service-role Edge Functions may access these tables; user identity is verified server-side.
create table public.portal_events (
 id uuid primary key default gen_random_uuid(),
 kind text not null check(kind in ('축제','특강','간담회','홈커밍데이','기타')),
 title text not null check(char_length(title) between 1 and 150),
 description text not null check(char_length(description) between 1 and 4000),
 venue text not null check(char_length(venue) between 1 and 200),
 starts_at timestamptz not null,
 deadline timestamptz,
 capacity integer check(capacity between 1 and 10000),
 requires_registration boolean not null default false,
 image_url text not null default '',
 groups text[] not null default array['alumni']::text[] check(cardinality(groups)>0 and groups <@ array['alumni','grade1','grade2']::text[]),
 status text not null default 'published' check(status in ('published','archived')),
 created_by uuid not null references public.profiles(user_id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check(deadline is null or deadline <= starts_at)
);
create table public.portal_event_preferences (
 user_id uuid primary key references public.profiles(user_id) on delete cascade,
 enabled boolean not null default false,
 updated_at timestamptz not null default now()
);
create table public.portal_event_registrations (
 event_id uuid not null references public.portal_events(id) on delete cascade,
 user_id uuid not null references public.profiles(user_id) on delete cascade,
 status text not null default 'registered' check(status in ('registered','cancelled','attended','absent')),
 updated_at timestamptz not null default now(),
 primary key(event_id,user_id)
);
create table public.portal_mail_dispatch_mutex (
 id boolean primary key default true check(id),
 token uuid not null,
 expires_at timestamptz not null
);
alter table public.portal_events enable row level security;
alter table public.portal_event_preferences enable row level security;
alter table public.portal_event_registrations enable row level security;
alter table public.portal_mail_dispatch_mutex enable row level security;
revoke all on public.portal_events,public.portal_event_preferences,public.portal_event_registrations,public.portal_mail_dispatch_mutex from public,anon,authenticated;
grant select,insert,update,delete on public.portal_events,public.portal_event_preferences,public.portal_event_registrations,public.portal_mail_dispatch_mutex to service_role;
create index portal_events_starts_idx on public.portal_events(status,starts_at);
create index portal_event_registration_user_idx on public.portal_event_registrations(user_id,event_id);
-- Atomic, expiring lease across all manual mail campaigns; never use browser state as a quota guard.
create function public.portal_mail_lock(p_token uuid) returns boolean language plpgsql security invoker set search_path='' as $$
begin
 insert into public.portal_mail_dispatch_mutex(id,token,expires_at) values(true,p_token,now()+interval '3 minutes')
 on conflict(id) do update set token=excluded.token,expires_at=excluded.expires_at
 where public.portal_mail_dispatch_mutex.expires_at<=now();
 return found;
end; $$;
create function public.portal_mail_unlock(p_token uuid) returns void language sql security invoker set search_path='' as $$
 delete from public.portal_mail_dispatch_mutex where id=true and token=p_token;
$$;
create function public.portal_event_recipients(p_record uuid,p_groups text[],p_reminder boolean default false) returns jsonb language sql stable security definer set search_path='' as $$
 with eligible as (
  select lower(trim(u.email)) email, p.user_id,
  case when p.enrollment_status='enrolled' then 'grade'||p.academic_year::text else 'alumni' end group_key
  from public.profiles p join auth.users u on u.id=p.user_id
  join public.portal_event_preferences pref on pref.user_id=p.user_id and pref.enabled
  where p.approval_status='approved' and u.email_confirmed_at is not null and coalesce(trim(u.email),'')<>''
  and (u.banned_until is null or u.banned_until<=now())
  and ((p.signup_type='student' and p.enrollment_status='enrolled' and p.academic_year in (1,2)) or
      (p.signup_type in ('alumni','student') and (p.enrollment_status='graduated' or (p.enrollment_status='early_employment' and p.alumni_source_id is not null))))
 ), selected as (
  select distinct on(e.email) e.email,e.group_key,e.user_id from eligible e join public.portal_events v on v.id=p_record
  where e.group_key=any(p_groups) and e.group_key=any(v.groups) and v.status='published'
  and (not p_reminder or exists(select 1 from public.portal_event_registrations r where r.event_id=v.id and r.user_id=e.user_id and r.status='registered'))
  order by e.email,e.group_key
 ), delivered as (
  select lower(trim(recipient)) email,bool_or(status='sent') sent,bool_or(status='sending') sending
  from public.alumni_network_mail_outbox where record_kind='portal_events' and record_id=p_record::text
  and event_type=case when p_reminder then 'event_reminder' else 'event_invitation' end group by lower(trim(recipient))
 )
 select coalesce(jsonb_agg(jsonb_build_object('email',s.email,'user_id',s.user_id,'group',s.group_key,'sent',coalesce(d.sent,false),'sending',coalesce(d.sending,false)) order by s.email),'[]'::jsonb)
 from selected s left join delivered d using(email)
$$;
-- Serializes seat allocation with the event row lock; no capacity race.
create function public.portal_event_register(p_event uuid,p_user uuid,p_cancel boolean) returns void language plpgsql security invoker set search_path='' as $$
declare e public.portal_events%rowtype; group_key text; current_status text;
begin
 select * into e from public.portal_events where id=p_event for update;
 if not found or e.status<>'published' or not e.requires_registration or e.starts_at<=now() then raise exception '신청 가능한 행사가 아닙니다.'; end if;
 select case when enrollment_status='enrolled' and signup_type='student' and academic_year in (1,2) then 'grade'||academic_year::text
 when signup_type in ('student','alumni') and (enrollment_status='graduated' or (enrollment_status='early_employment' and alumni_source_id is not null)) then 'alumni' end
 into group_key from public.profiles where user_id=p_user and approval_status='approved';
 if group_key is null or not(group_key=any(e.groups)) then raise exception '신청 대상이 아닙니다.'; end if;
 select status into current_status from public.portal_event_registrations where event_id=p_event and user_id=p_user;
 if p_cancel then
 update public.portal_event_registrations set status='cancelled',updated_at=now() where event_id=p_event and user_id=p_user and status='registered'; return;
 end if;
 if current_status='registered' then return; end if;
 if e.deadline is not null and e.deadline<now() then raise exception '신청 기간이 종료되었습니다.'; end if;
 if e.capacity is not null and (select count(*) from public.portal_event_registrations where event_id=p_event and status in ('registered','attended','absent'))>=e.capacity then raise exception '모집 인원이 마감되었습니다.'; end if;
 insert into public.portal_event_registrations(event_id,user_id,status) values(p_event,p_user,'registered')
 on conflict(event_id,user_id) do update set status='registered',updated_at=now();
end; $$;
revoke all on function public.portal_mail_lock(uuid),public.portal_mail_unlock(uuid),public.portal_event_recipients(uuid,text[],boolean),public.portal_event_register(uuid,uuid,boolean) from public,anon,authenticated;
grant execute on function public.portal_mail_lock(uuid),public.portal_mail_unlock(uuid),public.portal_event_recipients(uuid,text[],boolean),public.portal_event_register(uuid,uuid,boolean) to service_role;
