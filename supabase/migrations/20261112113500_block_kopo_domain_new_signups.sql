-- Block new membership registration from kopo.ac.kr and all subdomains.
-- Existing users and profiles are not updated or removed.
create or replace function private.portal_reject_kopo_auth_signup()
returns trigger
language plpgsql
set search_path = ''
as $body$
begin
  if (tg_op = 'INSERT' or new.email is distinct from old.email)
     and split_part(lower(btrim(coalesce(new.email,''))), '@', 2)
         ~ '(^|[.])kopo[.]ac[.]kr$' then
    raise exception using
      errcode = '23514',
      message = 'KOPO_EMAIL_SIGNUP_NOT_ALLOWED';
  end if;
  return new;
end
$body$;

create trigger portal_reject_kopo_auth_signup
  before insert or update of email on auth.users
  for each row execute function private.portal_reject_kopo_auth_signup();

create or replace function private.portal_reject_kopo_profile_signup()
returns trigger
language plpgsql
set search_path = ''
as $body$
begin
  if new.signup_type in ('student', 'alumni')
     and split_part(lower(btrim(coalesce(new.email,''))), '@', 2)
         ~ '(^|[.])kopo[.]ac[.]kr$' then
    raise exception using
      errcode = '23514',
      message = 'KOPO_EMAIL_SIGNUP_NOT_ALLOWED';
  end if;
  return new;
end
$body$;

create trigger portal_reject_kopo_profile_signup
  before insert on public.profiles
  for each row execute function private.portal_reject_kopo_profile_signup();
