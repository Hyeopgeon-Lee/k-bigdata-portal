-- Foreign-key indexes recommended by Supabase advisor.
create index if not exists admin_audit_log_actor_user_id_idx on public.admin_audit_log(actor_user_id);
create index if not exists admin_audit_log_target_user_id_idx on public.admin_audit_log(target_user_id);
create index if not exists report_deliveries_recipient_user_id_idx on public.report_deliveries(recipient_user_id);
