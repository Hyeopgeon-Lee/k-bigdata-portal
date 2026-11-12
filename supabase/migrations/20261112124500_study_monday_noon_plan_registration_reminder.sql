-- Safe extension of existing study reminder log and settings.
alter table public.study_email_logs drop constraint if exists study_email_logs_kind_check;
alter table public.study_email_logs add constraint study_email_logs_kind_check
 check (kind in ('absence','plan_reminder'));
alter table public.study_settings drop constraint if exists study_settings_setting_key_check;
alter table public.study_settings add constraint study_settings_setting_key_check
 check (setting_key in ('absence_email','plan_reminder_email'));
insert into public.study_settings(setting_key,enabled)
 values ('plan_reminder_email',true) on conflict(setting_key) do nothing;
