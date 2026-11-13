-- New-signup notifications are independent of student approval-complete mail.
-- These tables are never available to authenticated or anonymous browser clients.
create table if not exists public.signup_admin_notification_settings (
  setting_key text primary key check (setting_key = 'new_signup'),
  enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
insert into public.signup_admin_notification_settings(setting_key, enabled)
values ('new_signup',true)
on conflict (setting_key) do nothing;
alter table public.signup_admin_notification_settings enable row level security;
revoke all on public.signup_admin_notification_settings from public, anon, authenticated;

create table if not exists public.signup_admin_notification_deliveries (
  user_id uuid primary key references auth.users(id) on delete cascade,
  recipient_email text not null,
  delivery_status text not null default 'sending'
    check (delivery_status in ('sending','sent','failed')),
  attempted_at timestamptz not null default now(),
  sent_at timestamptz,
  provider_message_id text,
  last_error text,
  created_at timestamptz not null default now()
);
alter table public.signup_admin_notification_deliveries enable row level security;
revoke all on public.signup_admin_notification_deliveries from public, anon, authenticated;

create table if not exists public.signup_admin_notification_setting_events (
  id bigint generated always as identity primary key,
  enabled boolean not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.signup_admin_notification_setting_events enable row level security;
revoke all on public.signup_admin_notification_setting_events from public, anon, authenticated;

comment on table public.signup_admin_notification_settings is
  'Super-admin-managed notification switch; OFF does not affect account approvals or student mail.';
comment on table public.signup_admin_notification_deliveries is
  'One administrative new-signup notification per verified applicant; service role only.';
comment on table public.signup_admin_notification_setting_events is
  'Administrative audit history for changes to new-signup mail notifications.';