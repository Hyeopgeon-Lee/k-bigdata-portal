-- Scheduled examination reminders for the existing department calendar.
-- Only official, explicitly published exam dates are eligible for student mail.
create table if not exists public.certification_exam_schedules (
  id uuid primary key default gen_random_uuid(),
  certificate_code text not null check (certificate_code in ('engineer','industrial','sqld')),
  exam_year integer not null check (exam_year between 2025 and 2100),
  exam_round integer not null check (exam_round between 1 and 10),
  event_type text not null check (event_type in (
    'written_registration','written_exam','written_result',
    'practical_registration','practical_exam','final_result',
    'registration','exam','result'
  )),
  start_date date not null,
  end_date date not null,
  official_url text not null check (official_url ~ '^https://[^[:space:]]+$' and char_length(official_url) <= 500),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint certification_exam_date_order check (end_date >= start_date),
  constraint certification_exam_kind check (
    (certificate_code='sqld' and event_type in ('registration','exam','result'))
    or
    (certificate_code in ('engineer','industrial') and event_type not in ('registration','exam','result'))
  ),
  unique (certificate_code,exam_year,exam_round,event_type)
);
create index if not exists certification_exam_schedules_today
 on public.certification_exam_schedules(start_date,event_type) where published=true;
alter table public.certification_exam_schedules enable row level security;
create policy certification_exam_read on public.certification_exam_schedules for select to authenticated
 using ((published and (select private.portal_read_allowed()))
  or (select public.portal_super_admin_allowed()));
create policy certification_exam_add on public.certification_exam_schedules for insert to authenticated
 with check ((select public.portal_super_admin_allowed()));
create policy certification_exam_edit on public.certification_exam_schedules for update to authenticated
 using ((select public.portal_super_admin_allowed()))
 with check ((select public.portal_super_admin_allowed()));
create policy certification_exam_remove on public.certification_exam_schedules for delete to authenticated
 using ((select public.portal_super_admin_allowed()));
revoke all on public.certification_exam_schedules from anon;
grant select,insert,update,delete on public.certification_exam_schedules to authenticated;

create table if not exists public.certification_reminder_deliveries (
 id bigint generated always as identity primary key,
 schedule_id uuid not null references public.certification_exam_schedules(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 recipient_email text not null,
 status text not null default 'pending' check (status in ('pending','sent','failed','skipped')),
 provider_id text,
 error_message text,
 created_at timestamptz not null default now(),
 sent_at timestamptz,
 unique (schedule_id,user_id)
);
create index if not exists certification_reminder_delivery_status
 on public.certification_reminder_deliveries(status,created_at);
alter table public.certification_reminder_deliveries enable row level security;
revoke all on public.certification_reminder_deliveries from anon, authenticated;
comment on table public.certification_exam_schedules is 'Verified exam events shown in department calendar; one unique event per qualification, year, round and stage.';
comment on table public.certification_reminder_deliveries is 'Server-only idempotency/outcome log for registration-opening email reminders.';
