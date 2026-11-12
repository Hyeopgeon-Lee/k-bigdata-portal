-- Mail summaries are operational typed records, not writes into the immutable Sheets archive.
create table if not exists public.alumni_dispatch_logs (
  kind text not null check(kind in ('job_mail_logs','alumni_news_mail_logs')),
  id text not null,
  job_ids text,
  news_id text,
  news_type text,
  subject text,
  recipient_count text,
  sent_count text,
  failed_count text,
  sent_at text,
  status text,
  primary key(kind,id)
);
alter table public.alumni_dispatch_logs enable row level security;
revoke all on public.alumni_dispatch_logs from public,anon,authenticated;
grant select,insert,update,delete on public.alumni_dispatch_logs to service_role;
insert into public.alumni_dispatch_logs
(kind,id,job_ids,news_id,news_type,subject,recipient_count,sent_count,failed_count,sent_at,status)
select source_kind,source_id,data->>'job_ids',data->>'news_id',data->>'news_type',
data->>'subject',data->>'recipient_count',data->>'sent_count',data->>'failed_count',
data->>'sent_at',data->>'status'
from public.alumni_network_records
where source_kind in ('job_mail_logs','alumni_news_mail_logs')
on conflict(kind,id) do nothing;
