-- Private-to-admin workflow metadata; never accessible through the browser Data API.
create table if not exists public.signup_approval_emails (
  user_id uuid primary key references auth.users(id) on delete cascade,
  recipient_email text not null,
  delivery_status text not null default 'sending'
    check (delivery_status in ('sending','sent','failed')),
  provider_message_id text,
  last_error text,
  attempted_at timestamptz not null default now(),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.signup_approval_emails enable row level security;
revoke all on public.signup_approval_emails from anon, authenticated;
comment on table public.signup_approval_emails is
  'Resend approval notifications, service-role only, one mail per account. Deleted with Auth user.';
