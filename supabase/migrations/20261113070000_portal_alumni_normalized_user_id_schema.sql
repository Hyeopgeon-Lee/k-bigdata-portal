-- Portal-only alumni operational schema. Legacy Google Sheets archive remains unchanged.
-- Authoritative member identity: public.profiles.user_id -> auth.users.id.
create table if not exists public.alumni_profiles (
  user_id uuid primary key references public.profiles(user_id) on delete cascade,
  legacy_alumni_id text unique,
  graduation_year text,
  employment_status text,
  company text,
  job text,
  company_url text,
  employment_year text,
  job_description text,
  skills text,
  bachelor_status text,
  bachelor_school text,
  bachelor_major text,
  bachelor_year text,
  graduate_status text,
  graduate_school_type text,
  graduate_school text,
  graduate_major text,
  graduate_degree text,
  graduate_entry_year text,
  graduate_graduation_year text,
  research_fields text,
  mentoring_topics text,
  introduction text,
  message_to_juniors text,
  contact_allowed text,
  career_mail_enabled text,
  career_mail_consent_at text,
  career_mail_updated_at text,
  alumni_news_mail_enabled text,
  alumni_news_mail_consent_at text,
  alumni_news_mail_updated_at text,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.alumni_jobs (
  id text primary key,
  author_user_id uuid not null references public.profiles(user_id) on delete cascade,
  company text,
  job_title text,
  recruit_type text,
  employment_type text,
  location text,
  job_url text,
  deadline text,
  always_open text,
  skills text,
  alumni_comment text,
  referral_available text,
  contact_allowed text,
  status text,
  approved_at text,
  approved_by text,
  created_at text,
  updated_at text,
  last_mailed_at text,
  constraint alumni_job_id_valid check(length(id) between 1 and 120)
);
create table if not exists public.alumni_news (
  id text primary key,
  subject_user_id uuid not null references public.profiles(user_id) on delete cascade,
  author_user_id uuid references public.profiles(user_id) on delete set null,
  news_type text,
  title text,
  content text,
  company text,
  job_title text,
  organization text,
  position_title text,
  school_name text,
  degree_or_program text,
  event_date text,
  location text,
  relationship text,
  external_url text,
  mail_requested text,
  mail_status text,
  status text,
  approved_at text,
  approved_by text,
  created_at text,
  updated_at text,
  constraint alumni_news_id_valid check(length(id) between 1 and 120)
);
create table if not exists public.alumni_contact_requests (
  id text primary key,
  recipient_user_id uuid references public.profiles(user_id) on delete set null,
  sender_user_id uuid references public.profiles(user_id) on delete set null,
  legacy_recipient_id text,
  requester_name text,
  requester_type text,
  requester_student_id_or_year text,
  requester_email text,
  requester_phone text,
  share_email text,
  share_phone text,
  share_competencies text,
  category text,
  subject text,
  message text,
  message_html text,
  status text,
  created_at text,
  sent_at text,
  constraint alumni_contact_id_valid check(length(id) between 1 and 120)
);
create index if not exists alumni_profiles_visibility_idx on public.alumni_profiles(is_visible);
create index if not exists alumni_jobs_author_status_idx on public.alumni_jobs(author_user_id,status);
create index if not exists alumni_news_subject_status_idx on public.alumni_news(subject_user_id,status);
create index if not exists alumni_contact_recipient_idx on public.alumni_contact_requests(recipient_user_id,created_at);
create index if not exists alumni_contact_sender_idx on public.alumni_contact_requests(sender_user_id,created_at);
alter table public.alumni_profiles enable row level security;
alter table public.alumni_jobs enable row level security;
alter table public.alumni_news enable row level security;
alter table public.alumni_contact_requests enable row level security;
revoke all on public.alumni_profiles,public.alumni_jobs,public.alumni_news,public.alumni_contact_requests from public,anon,authenticated;
grant select,insert,update,delete on public.alumni_profiles,public.alumni_jobs,public.alumni_news,public.alumni_contact_requests to service_role;
-- All existing linked alumni become operational rows. The two unlinked records remain in the immutable migration archive.
insert into public.alumni_profiles(user_id,legacy_alumni_id,graduation_year, employment_status, company, job, company_url, employment_year, job_description, skills, bachelor_status, bachelor_school, bachelor_major, bachelor_year, graduate_status, graduate_school_type, graduate_school, graduate_major, graduate_degree, graduate_entry_year, graduate_graduation_year, research_fields, mentoring_topics, introduction, message_to_juniors, contact_allowed, career_mail_enabled, career_mail_consent_at, career_mail_updated_at, alumni_news_mail_enabled, alumni_news_mail_consent_at, alumni_news_mail_updated_at,is_visible,created_at,updated_at)
select p.user_id,r.source_id,nullif(r.data->>'graduation_year',''), nullif(r.data->>'employment_status',''), nullif(r.data->>'company',''), nullif(r.data->>'job',''), nullif(r.data->>'company_url',''), nullif(r.data->>'employment_year',''), nullif(r.data->>'job_description',''), nullif(r.data->>'skills',''), nullif(r.data->>'bachelor_status',''), nullif(r.data->>'bachelor_school',''), nullif(r.data->>'bachelor_major',''), nullif(r.data->>'bachelor_year',''), nullif(r.data->>'graduate_status',''), nullif(r.data->>'graduate_school_type',''), nullif(r.data->>'graduate_school',''), nullif(r.data->>'graduate_major',''), nullif(r.data->>'graduate_degree',''), nullif(r.data->>'graduate_entry_year',''), nullif(r.data->>'graduate_graduation_year',''), nullif(r.data->>'research_fields',''), nullif(r.data->>'mentoring_topics',''), nullif(r.data->>'introduction',''), nullif(r.data->>'message_to_juniors',''), nullif(r.data->>'contact_allowed',''), nullif(r.data->>'career_mail_enabled',''), nullif(r.data->>'career_mail_consent_at',''), nullif(r.data->>'career_mail_updated_at',''), nullif(r.data->>'alumni_news_mail_enabled',''), nullif(r.data->>'alumni_news_mail_consent_at',''), nullif(r.data->>'alumni_news_mail_updated_at',''),(r.data->>'status'='APPROVED'),
coalesce(nullif(r.data->>'created_at','')::timestamptz,now()),
coalesce(nullif(r.data->>'updated_at','')::timestamptz,now())
from public.alumni_network_records r
join public.profiles p on p.alumni_source_id=r.source_id and p.approval_status='approved'
where r.source_kind='alumni'
on conflict(user_id) do nothing;
insert into public.alumni_jobs(id,author_user_id,company, job_title, recruit_type, employment_type, location, job_url, deadline, always_open, skills, alumni_comment, referral_available, contact_allowed, status, approved_at, approved_by, created_at, updated_at, last_mailed_at)
select r.source_id,p.user_id,nullif(r.data->>'company',''), nullif(r.data->>'job_title',''), nullif(r.data->>'recruit_type',''), nullif(r.data->>'employment_type',''), nullif(r.data->>'location',''), nullif(r.data->>'job_url',''), nullif(r.data->>'deadline',''), nullif(r.data->>'always_open',''), nullif(r.data->>'skills',''), nullif(r.data->>'alumni_comment',''), nullif(r.data->>'referral_available',''), nullif(r.data->>'contact_allowed',''), nullif(r.data->>'status',''), nullif(r.data->>'approved_at',''), nullif(r.data->>'approved_by',''), nullif(r.data->>'created_at',''), nullif(r.data->>'updated_at',''), nullif(r.data->>'last_mailed_at','')
from public.alumni_network_records r
join public.profiles p on p.alumni_source_id=r.data->>'alumni_id'
where r.source_kind='jobs'
on conflict(id) do nothing;
insert into public.alumni_news(id,subject_user_id,author_user_id,news_type, title, content, company, job_title, organization, position_title, school_name, degree_or_program, event_date, location, relationship, external_url, mail_requested, mail_status, status, approved_at, approved_by, created_at, updated_at)
select r.source_id,p.user_id,q.user_id,nullif(r.data->>'news_type',''), nullif(r.data->>'title',''), nullif(r.data->>'content',''), nullif(r.data->>'company',''), nullif(r.data->>'job_title',''), nullif(r.data->>'organization',''), nullif(r.data->>'position_title',''), nullif(r.data->>'school_name',''), nullif(r.data->>'degree_or_program',''), nullif(r.data->>'event_date',''), nullif(r.data->>'location',''), nullif(r.data->>'relationship',''), nullif(r.data->>'external_url',''), nullif(r.data->>'mail_requested',''), nullif(r.data->>'mail_status',''), nullif(r.data->>'status',''), nullif(r.data->>'approved_at',''), nullif(r.data->>'approved_by',''), nullif(r.data->>'created_at',''), nullif(r.data->>'updated_at','')
from public.alumni_network_records r
join public.profiles p on p.alumni_source_id=r.data->>'alumni_id'
left join public.profiles q on q.alumni_source_id=r.data->>'submitted_by_alumni_id'
where r.source_kind='alumni_news'
on conflict(id) do nothing;
insert into public.alumni_contact_requests(id,recipient_user_id,sender_user_id,legacy_recipient_id,requester_name, requester_type, requester_student_id_or_year, requester_email, requester_phone, share_email, share_phone, share_competencies, category, subject, message, message_html, status, created_at, sent_at)
select r.source_id,p.user_id,
case when (r.data->>'requester_user_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
  (select user_id from public.profiles where user_id=(r.data->>'requester_user_id')::uuid)
  else q.user_id end,
r.data->>'alumni_id',nullif(r.data->>'requester_name',''), nullif(r.data->>'requester_type',''), nullif(r.data->>'requester_student_id_or_year',''), nullif(r.data->>'requester_email',''), nullif(r.data->>'requester_phone',''), nullif(r.data->>'share_email',''), nullif(r.data->>'share_phone',''), nullif(r.data->>'share_competencies',''), nullif(r.data->>'category',''), nullif(r.data->>'subject',''), nullif(r.data->>'message',''), nullif(r.data->>'message_html',''), nullif(r.data->>'status',''), nullif(r.data->>'created_at',''), nullif(r.data->>'sent_at','')
from public.alumni_network_records r
left join public.profiles p on p.alumni_source_id=r.data->>'alumni_id'
left join public.profiles q on lower(q.email)=lower(r.data->>'requester_email')
where r.source_kind='contact_requests'
on conflict(id) do nothing;
comment on table public.alumni_network_records is 'Read-only historical import archive; operational alumni writes use normalized user_id-linked tables.';
