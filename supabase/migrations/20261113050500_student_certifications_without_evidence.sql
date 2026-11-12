-- Student self-reported qualifications, intentionally without attachments.
create table if not exists public.student_certifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  certificate_code text not null check (certificate_code ~ '^[a-z0-9_-]{2,40}$'),
  certificate_name text not null check (char_length(btrim(certificate_name)) between 2 and 120),
  pass_status text not null check (pass_status in ('written','final')),
  written_pass_date date,
  final_pass_date date,
  certificate_number text check (certificate_number is null or char_length(certificate_number) <= 100),
  verification_status text not null default 'pending'
    check (verification_status in ('pending','verified','rejected')),
  verification_note text not null default '' check (char_length(verification_note) <= 500),
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_certifications_pass_date_chk check (
    (pass_status = 'written' and written_pass_date is not null and final_pass_date is null)
    or (pass_status = 'final' and final_pass_date is not null)
  ),
  constraint student_certifications_written_stage_chk check (
    pass_status <> 'written' or certificate_code in
    ('engineer','industrial','bigdata','office','computer','word','linux','network')
  )
);
create unique index if not exists student_certifications_user_name_uq
  on public.student_certifications (user_id, certificate_code, lower(btrim(certificate_name)));
create index if not exists student_certifications_user_status_idx
  on public.student_certifications(user_id, pass_status);
create index if not exists student_certifications_review_idx
  on public.student_certifications(verification_status, created_at desc);

create or replace function public.student_certifications_before_write()
returns trigger language plpgsql security invoker set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.user_id := (select auth.uid());
    new.verification_status := 'pending';
    new.verification_note := '';
    new.verified_by := null;
    new.verified_at := null;
    new.created_at := now();
  else
    new.id := old.id;
    new.user_id := old.user_id;
    new.created_at := old.created_at;
    if not (select public.portal_super_admin_allowed()) then
      new.verification_status := 'pending';
      new.verification_note := '';
      new.verified_by := null;
      new.verified_at := null;
    elsif new.verification_status = 'verified' then
      new.verified_by := (select auth.uid());
      new.verified_at := now();
    else
      new.verified_by := null;
      new.verified_at := null;
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;
create trigger student_certifications_before_write_trigger
before insert or update on public.student_certifications
for each row execute function public.student_certifications_before_write();

alter table public.student_certifications enable row level security;
create policy student_certifications_select on public.student_certifications for select to authenticated
  using ((user_id = (select auth.uid()) and (select private.portal_read_allowed()))
         or (select public.portal_super_admin_allowed()));
create policy student_certifications_insert on public.student_certifications for insert to authenticated
  with check (user_id = (select auth.uid()) and (select private.portal_read_allowed()));
create policy student_certifications_update on public.student_certifications for update to authenticated
  using ((user_id = (select auth.uid()) and (select private.portal_read_allowed()))
         or (select public.portal_super_admin_allowed()))
  with check ((user_id = (select auth.uid()) and (select private.portal_read_allowed()))
         or (select public.portal_super_admin_allowed()));
create policy student_certifications_delete on public.student_certifications for delete to authenticated
  using (user_id = (select auth.uid()) and (select private.portal_read_allowed()));
revoke all on public.student_certifications from anon;
grant select, insert, update, delete on public.student_certifications to authenticated;
comment on table public.student_certifications is
  'Self-reported student qualifications; admin review is not issuer verification. No evidence uploads.';
