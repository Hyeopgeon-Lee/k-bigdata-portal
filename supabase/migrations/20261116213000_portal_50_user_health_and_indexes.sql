-- Minimal, private operational health for the faculty administrator.
-- No client can inspect database connection details without the server role check.
ALTER TABLE private.portal_academic_status_history ENABLE ROW LEVEL SECURITY;

-- Cover only high-value FK columns for member deletion and key operations.
CREATE INDEX IF NOT EXISTS portal_academic_history_user_idx
 ON private.portal_academic_status_history(user_id);
CREATE INDEX IF NOT EXISTS help_attachments_uploader_idx
 ON public.help_attachments(uploader_id);
CREATE INDEX IF NOT EXISTS help_messages_author_idx
 ON public.help_messages(author_id);
CREATE INDEX IF NOT EXISTS help_completion_mail_recipient_idx
 ON public.help_completion_email_deliveries(recipient_id);
CREATE INDEX IF NOT EXISTS alumni_news_author_idx
 ON public.alumni_news(author_user_id);

CREATE OR REPLACE FUNCTION public.portal_admin_health_summary()
RETURNS jsonb LANGUAGE plpgsql
SECURITY DEFINER SET search_path TO ''
AS $body$
DECLARE
 v_connections integer;
 v_active integer;
 v_max integer;
 v_deadlocks bigint;
BEGIN
 IF NOT public.portal_super_admin_allowed() THEN
  RAISE EXCEPTION 'ADMIN_NOT_AUTHORIZED' USING ERRCODE='42501';
 END IF;
 SELECT count(*) FILTER(WHERE backend_type='client backend'),
        count(*) FILTER(WHERE state='active' AND backend_type='client backend')
 INTO v_connections,v_active
 FROM pg_catalog.pg_stat_activity;
 v_max:=current_setting('max_connections')::integer;
 SELECT COALESCE(deadlocks,0) INTO v_deadlocks
 FROM pg_catalog.pg_stat_database WHERE datname=current_database();
 RETURN pg_catalog.jsonb_build_object(
  'observedAt', pg_catalog.clock_timestamp(),
  'dbConnections',v_connections,
  'activeQueries',v_active,
  'dbMaxConnections',v_max,
  'deadlocksTotal',COALESCE(v_deadlocks,0),
  'studyActive',(SELECT count(*) FROM public.study_sessions WHERE status='active'),
  'studyNeedsReview',(SELECT count(*) FROM public.study_sessions WHERE status='needs_review'),
  'attempts24h',(SELECT count(*) FROM public.learning_attempts WHERE submitted_at>=now()-interval '24 hours'),
  'helpMailFailed24h',(SELECT count(*) FROM public.help_completion_email_deliveries WHERE status='failed' AND created_at>=now()-interval '24 hours'),
  'studyMailFailed24h',(SELECT count(*) FROM public.study_email_logs WHERE status='failed' AND created_at>=now()-interval '24 hours'),
  'weeklyMailFailed24h',(SELECT count(*) FROM public.report_deliveries WHERE status='failed' AND created_at>=now()-interval '24 hours'),
  'aggregationFailed24h',(SELECT count(*) FROM public.learning_aggregation_jobs WHERE job_status='failed' AND started_at>=now()-interval '24 hours'),
  'studentStudyErrors24h',(SELECT count(*) FROM private.study_client_errors WHERE occurred_at>=now()-interval '24 hours')
 );
END;
$body$;
REVOKE ALL ON FUNCTION public.portal_admin_health_summary() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.portal_admin_health_summary() TO authenticated;
