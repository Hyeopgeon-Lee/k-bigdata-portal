-- Per-student Notion authorization. The browser never receives Notion credentials.
create table public.ready_notion_oauth_states (
 user_id uuid primary key references public.ready_profiles(user_id) on delete cascade,
 state_hash text not null unique check(length(state_hash)=64),
 page_id uuid not null,
 expected_url text not null,
 expires_at timestamptz not null,
 claimed_at timestamptz,
 created_at timestamptz not null default now()
);
create table public.ready_notion_connections (
 user_id uuid primary key references public.ready_profiles(user_id) on delete cascade,
 connection_id uuid not null unique,
 page_id uuid not null,
 encrypted_credentials text not null check(length(encrypted_credentials) between 30 and 40000),
 connected_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.ready_notion_oauth_states enable row level security;
alter table public.ready_notion_connections enable row level security;
revoke all on public.ready_notion_oauth_states,public.ready_notion_connections from public,anon,authenticated;
grant select,insert,update,delete on public.ready_notion_oauth_states,public.ready_notion_connections to service_role;
-- All RPCs below execute under service-role permissions only and are never called by a browser.
create function public.ready_notion_finish(p_user uuid,p_state_hash text,p_page_id uuid,p_connection_id uuid,p_encrypted text)
returns boolean language plpgsql security invoker set search_path='' as $$
declare registered_url text; expected_url text;
begin
 select data->>'notion_url' into registered_url from public.ready_profiles where user_id=p_user for update;
 if not found then return false; end if;
 select s.expected_url into expected_url from public.ready_notion_oauth_states s
 where s.user_id=p_user and s.state_hash=p_state_hash and s.page_id=p_page_id
 and s.claimed_at is not null and s.expires_at>now() for update;
 if not found or registered_url is distinct from expected_url then return false; end if;
 insert into public.ready_notion_connections(user_id,connection_id,page_id,encrypted_credentials)
 values(p_user,p_connection_id,p_page_id,p_encrypted)
 on conflict(user_id) do update set connection_id=excluded.connection_id,page_id=excluded.page_id,
 encrypted_credentials=excluded.encrypted_credentials,connected_at=now(),updated_at=now();
 delete from public.ready_notion_oauth_states where user_id=p_user and state_hash=p_state_hash;
 return true;
end $$;
revoke all on function public.ready_notion_finish(uuid,text,uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.ready_notion_finish(uuid,text,uuid,uuid,text) to service_role;
create function public.ready_notion_disconnect(p_user uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare removed jsonb; registered_url text;
begin
 select coalesce(data->>'notion_url','') into registered_url from public.ready_profiles where user_id=p_user for update;
 delete from public.ready_notion_oauth_states where user_id=p_user;
 delete from public.ready_notion_connections where user_id=p_user returning to_jsonb(ready_notion_connections) into removed;
 -- Never show an obsolete success after authorization has been removed.
 update public.ready_student_checks set data=case when registered_url='' then jsonb_build_object('activity_status','미등록','check_status','SUCCESS') else jsonb_build_object('activity_status','Notion 연동 필요','check_status','AUTH_REQUIRED','error_message','학생이 포트폴리오 연결을 해제했습니다.') end,checked_at=now()
 where user_id=p_user and kind='notion';
 return removed;
end $$;
revoke all on function public.ready_notion_disconnect(uuid) from public,anon,authenticated;
grant execute on function public.ready_notion_disconnect(uuid) to service_role;
-- A check in progress cannot overwrite a newly disconnected or replaced connection.
create function public.ready_notion_store_check(p_user uuid,p_page_id uuid,p_connection_id uuid,p_expected_url text,p_data jsonb)
returns boolean language plpgsql security invoker set search_path='' as $$
declare current_url text; current_id uuid;
begin
 select coalesce(data->>'notion_url','') into current_url from public.ready_profiles where user_id=p_user for update;
 if not found or current_url is distinct from p_expected_url then return false; end if;
 select connection_id into current_id from public.ready_notion_connections where user_id=p_user and page_id=p_page_id;
 if current_id is distinct from p_connection_id then return false; end if;
 insert into public.ready_student_checks(user_id,kind,checked_at,data)
 values(p_user,'notion',now(),p_data||jsonb_build_object('checked_at',now()))
 on conflict(user_id,kind) do update set data=excluded.data,checked_at=excluded.checked_at;
 return true;
end $$;
revoke all on function public.ready_notion_store_check(uuid,uuid,uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.ready_notion_store_check(uuid,uuid,uuid,text,jsonb) to service_role;
