-- READY integrated student data. Authentication and academic identity remain in profiles.
-- All READY data is accessed by the authenticated, session-checked ready-api Edge Function.
create table public.ready_profiles (
 user_id uuid primary key references public.profiles(user_id) on delete cascade,
 data jsonb not null default '{}' check(jsonb_typeof(data)='object'),
 peer_share_consent_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 last_manual_update_at timestamptz,
 last_check_requested_at timestamptz,
 check_lease_until timestamptz
);
create table public.ready_repositories (
 repo_id text primary key default gen_random_uuid()::text,
 user_id uuid not null references public.ready_profiles(user_id) on delete cascade,
 repo_owner text not null, repo_name text not null, repo_url text not null,
 is_primary boolean not null default false, display_order integer not null default 1,
 active boolean not null default true, registered_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(repo_id,user_id),
 check(not is_primary or active)
);
create unique index ready_repository_active_unique on public.ready_repositories(user_id,lower(repo_owner),lower(repo_name)) where active;
create unique index ready_repository_primary_unique on public.ready_repositories(user_id) where active and is_primary;
create index ready_repositories_member_idx on public.ready_repositories(user_id,active,display_order);
create table public.ready_student_checks (
 user_id uuid references public.ready_profiles(user_id) on delete cascade,
 kind text check(kind in ('github','blog','notion','portfolio')),
 checked_at timestamptz not null,
 data jsonb not null check(jsonb_typeof(data)='object'),
 primary key(user_id,kind)
);
create index ready_student_checks_due_idx on public.ready_student_checks(kind,checked_at);
create table public.ready_repository_checks (
 repo_id text, user_id uuid not null, kind text check(kind in ('repository','readme')),
 checked_at timestamptz not null,
 data jsonb not null check(jsonb_typeof(data)='object'),
 primary key(repo_id,kind),
 foreign key(repo_id,user_id) references public.ready_repositories(repo_id,user_id) on delete cascade
);
create index ready_repository_checks_member_idx on public.ready_repository_checks(user_id);
create table public.ready_change_history (
 history_id text primary key default gen_random_uuid()::text,
 user_id uuid not null references public.ready_profiles(user_id) on delete cascade,
 changed_at timestamptz not null default now(),
 category text not null, field_name text not null, old_value text not null default '', new_value text not null default '',
 changed_by text not null check(changed_by in ('STUDENT','ADMIN','SYSTEM'))
);
create index ready_history_user_time on public.ready_change_history(user_id,changed_at desc);
create table public.ready_certificate_plans (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.ready_profiles(user_id) on delete cascade,
 certificate_name text not null check(length(btrim(certificate_name)) between 2 and 120),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index ready_cert_plan_unique on public.ready_certificate_plans(user_id,lower(btrim(certificate_name)));
create table public.ready_check_runs (
 log_id text primary key default gen_random_uuid()::text,
 started_at timestamptz not null default now(), finished_at timestamptz,
 data jsonb not null check(jsonb_typeof(data)='object')
);
create table public.ready_weekly_snapshots (
 snapshot_date date primary key, data jsonb not null check(jsonb_typeof(data)='object'),
 source text not null default 'portal'
);
create table public.ready_operations (
 singleton boolean primary key default true check(singleton),
 checking_enabled boolean not null default false,
 weekly_mail_enabled boolean not null default false,
 updated_at timestamptz not null default now()
);
insert into public.ready_operations(singleton) values(true) on conflict do nothing;
create table public.ready_report_deliveries (
 week_start date primary key, status text not null check(status in ('pending','sent','failed')),
 sent_at timestamptz, updated_at timestamptz not null default now(), provider_id text
);
do $$ declare tbl text; begin
 foreach tbl in array array['ready_profiles','ready_repositories','ready_student_checks','ready_repository_checks','ready_change_history','ready_certificate_plans','ready_check_runs','ready_weekly_snapshots','ready_operations','ready_report_deliveries'] loop
  execute format('alter table public.%I enable row level security',tbl);
  execute format('revoke all on public.%I from public, anon, authenticated',tbl);
  execute format('grant select,insert,update,delete on public.%I to service_role',tbl);
 end loop;
end $$;
-- Exposes only the requesting caller's access decision, no private session data.
create function public.ready_access() returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object(
 'admin', public.portal_super_admin_allowed(),
 'read', private.portal_read_allowed() and exists(select 1 from public.profiles p where p.user_id=auth.uid() and p.signup_type='student' and p.enrollment_status in ('enrolled','leave','early_employment')),
 'write', private.portal_write_allowed() and exists(select 1 from public.profiles p where p.user_id=auth.uid() and p.signup_type='student' and p.enrollment_status in ('enrolled','early_employment')));
$$;
revoke all on function public.ready_access() from public,anon;
grant execute on function public.ready_access() to authenticated;
-- Serialize each student's projects to enforce five active rows and a single primary.
create function public.ready_repository_mutate(p_user uuid,p_action text,p_repo_id text,p_data jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare rid text; old_url text; target_url text; want_primary boolean; n int; result jsonb;
begin
 perform 1 from public.ready_profiles where user_id=p_user for update;
 if not found then raise exception 'READY_PROFILE_REQUIRED'; end if;
 if p_action='add' then
  select count(*) into n from public.ready_repositories where user_id=p_user and active;
  if n>=5 then raise exception 'REPOSITORY_LIMIT'; end if;
  want_primary:=coalesce((p_data->>'is_primary')::boolean,false) or n=0;
  if want_primary then update public.ready_repositories set is_primary=false where user_id=p_user and active and is_primary; end if;
  insert into public.ready_repositories(user_id,repo_owner,repo_name,repo_url,is_primary,display_order)
  values(p_user,p_data->>'repo_owner',p_data->>'repo_name',p_data->>'repo_url',want_primary,n+1)
  returning repo_id,repo_url into rid,target_url;
 elsif p_action in ('update','remove') then
  select repo_url into old_url from public.ready_repositories where repo_id=p_repo_id and user_id=p_user and active;
  if not found then raise exception 'REPOSITORY_NOT_FOUND'; end if;
  rid:=p_repo_id;
  if p_action='remove' then
   update public.ready_repositories set active=false,is_primary=false,updated_at=now() where repo_id=rid;
  else
   if coalesce((p_data->>'is_primary')::boolean,false) then
    update public.ready_repositories set is_primary=false where user_id=p_user and active and is_primary;
    update public.ready_repositories set is_primary=true,updated_at=now() where repo_id=rid;
   end if;
   update public.ready_repositories set display_order=greatest(1,least(99,coalesce((p_data->>'display_order')::int,display_order))),updated_at=now() where repo_id=rid;
  end if;
 else raise exception 'INVALID_ACTION'; end if;
 if not exists(select 1 from public.ready_repositories where user_id=p_user and active and is_primary) then
  update public.ready_repositories set is_primary=true where repo_id=(select repo_id from public.ready_repositories where user_id=p_user and active order by display_order,registered_at,repo_id limit 1);
 end if;
 insert into public.ready_change_history(user_id,category,field_name,old_value,new_value,changed_by)
 values(p_user,'Repository',p_action,coalesce(old_url,''),coalesce(target_url,''),'STUDENT');
 select to_jsonb(r) into result from public.ready_repositories r where r.repo_id=rid;
 return result;
end $$;
revoke all on function public.ready_repository_mutate(uuid,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.ready_repository_mutate(uuid,text,text,jsonb) to service_role;
-- Atomic lease prevents overlapping checks and enforces ten-minute self-service cooldown.
create function public.ready_claim_check(p_user uuid,p_self boolean)
returns boolean language plpgsql security invoker set search_path='' as $$
begin
 update public.ready_profiles set check_lease_until=now()+interval '8 minutes',
 last_check_requested_at=case when p_self then now() else last_check_requested_at end
 where user_id=p_user and (check_lease_until is null or check_lease_until<now())
 and (not p_self or last_check_requested_at is null or last_check_requested_at<now()-interval '10 minutes');
 return found;
end $$;
revoke all on function public.ready_claim_check(uuid,boolean) from public,anon,authenticated;
grant execute on function public.ready_claim_check(uuid,boolean) to service_role;
