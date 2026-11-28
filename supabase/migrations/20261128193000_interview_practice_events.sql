-- Explicit, account-scoped interview completion events. Do not backfill browser-only history.
create table public.interview_practice_events (
 user_id uuid not null references auth.users(id) on delete cascade,
 mark_id uuid not null,
 question_id text not null check (question_id ~ '^[A-Za-z0-9_-]{1,90}$'),
 practiced_at timestamptz not null default now(),
 primary key (user_id,mark_id)
);
create index interview_practice_events_user_date_idx on public.interview_practice_events(user_id,practiced_at);
alter table public.interview_practice_events enable row level security;
revoke all on public.interview_practice_events from public,anon,authenticated;
grant select on public.interview_practice_events to service_role;
-- Timestamp and student identity come from the server. A cancellation can only
-- undo the same student's explicitly marked event, not another attempt.
create function public.set_my_interview_practice(p_mark_id uuid,p_question_id text,p_done boolean)
returns boolean language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid();
begin
 if v_user is null or not private.portal_write_allowed() or not exists(
  select 1 from public.profiles p where p.user_id=v_user
   and p.signup_type='student' and p.approval_status='approved' and p.enrollment_status='enrolled'
 ) or public.portal_super_admin_allowed() then
  raise exception 'NOT_AUTHORIZED' using errcode='42501';
 end if;
 if p_mark_id is null or p_question_id is null or p_question_id !~ '^[A-Za-z0-9_-]{1,90}$' or p_done is null then
  raise exception 'INVALID_PRACTICE' using errcode='22023';
 end if;
 if p_done then
  insert into public.interview_practice_events(user_id,mark_id,question_id)
  values(v_user,p_mark_id,p_question_id) on conflict(user_id,mark_id) do nothing;
  if not exists(select 1 from public.interview_practice_events where user_id=v_user and mark_id=p_mark_id and question_id=p_question_id) then
   raise exception 'INVALID_MARK' using errcode='22023';
  end if;
 else
  delete from public.interview_practice_events where user_id=v_user and mark_id=p_mark_id and question_id=p_question_id;
 end if;
 return true;
end $$;
revoke all on function public.set_my_interview_practice(uuid,text,boolean) from public,anon;
grant execute on function public.set_my_interview_practice(uuid,text,boolean) to authenticated;
