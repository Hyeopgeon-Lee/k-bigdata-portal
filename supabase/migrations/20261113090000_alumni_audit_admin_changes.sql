-- Immutable member/admin actions, isolated from legacy Sheet audit rows.
create table if not exists public.alumni_audit_logs (
 id bigint generated always as identity primary key,
 actor_user_id uuid references public.profiles(user_id) on delete set null,
 action text not null,
 target_kind text not null,
 target_id text not null,
 previous_status text,
 new_status text,
 created_at timestamptz not null default now()
);
create index if not exists alumni_audit_logs_recent_idx on public.alumni_audit_logs(created_at desc);
alter table public.alumni_audit_logs enable row level security;
revoke all on public.alumni_audit_logs from public,anon,authenticated;
grant select,insert on public.alumni_audit_logs to service_role;
