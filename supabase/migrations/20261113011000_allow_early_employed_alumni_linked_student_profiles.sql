-- Explicitly linked, approved 2027 early-employed candidates are still students, not graduates.
-- Their legacy network record may lack a student number; require immutable alumni link
-- and an early-employment status instead of inventing identifiers.
alter table public.profiles drop constraint if exists profiles_signup_identity;
alter table public.profiles add constraint profiles_signup_identity check (
  (signup_type='student' and (
    (student_no is not null and graduation_year is null)
    or (enrollment_status='early_employment' and alumni_source_id is not null
        and graduation_year between 2000 and extract(year from current_date)::integer+5)
  ))
  or (signup_type='staff' and graduation_year is null
      and lower(email)='hglee67@kopo.ac.kr')
  or (signup_type='alumni' and student_no is null and graduation_year is not null
      and graduation_year between 1900 and extract(year from current_date))
);
