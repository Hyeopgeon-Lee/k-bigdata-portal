-- Recover stale student timers without losing historical records.
-- All privileged entry points validate server-side portal sessions and roles.
ALTER TABLE public.study_sessions
  ADD COLUMN IF NOT EXISTS review_reason text,
  ADD COLUMN IF NOT EXISTS review_outcome text,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid,
  ADD COLUMN IF NOT EXISTS review_note text;
DO $$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='study_review_outcome_check' AND conrelid='public.study_sessions'::regclass) THEN
  ALTER TABLE public.study_sessions ADD CONSTRAINT study_review_outcome_check
    CHECK (review_outcome IS NULL OR review_outcome IN ('accepted','rejected'));
 END IF;
END $$;

CREATE OR REPLACE FUNCTION private.study_session_is_stale(p_started_at timestamptz)
RETURNS boolean LANGUAGE sql STABLE SET search_path TO ''
AS $fn$
 SELECT p_started_at IS NOT NULL AND (
   now()-p_started_at >= interval '12 hours'
   OR (
     (p_started_at AT TIME ZONE 'Asia/Seoul')::date <
       (now() AT TIME ZONE 'Asia/Seoul')::date
     AND now()-p_started_at >= interval '6 hours'
   )
 )
$fn$;
REVOKE ALL ON FUNCTION private.study_session_is_stale(timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.study_session_is_stale(timestamptz) TO authenticated;

CREATE OR REPLACE FUNCTION public.study_restart_stale_session()
RETURNS public.study_sessions
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $fn$
DECLARE
 v_uid uuid := auth.uid();
 v_row public.study_sessions;
BEGIN
 IF v_uid IS NULL OR NOT private.portal_study_write_allowed() THEN
  RAISE EXCEPTION 'STUDY_NOT_ELIGIBLE' USING ERRCODE='42501';
 END IF;
 PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_uid::text,221));
 SELECT * INTO v_row FROM public.study_sessions
  WHERE user_id=v_uid AND status='active' FOR UPDATE;
 IF NOT FOUND THEN
  INSERT INTO public.study_sessions(user_id) VALUES(v_uid) RETURNING * INTO v_row;
  RETURN v_row;
 END IF;
 IF NOT private.study_session_is_stale(v_row.started_at) THEN
  RETURN v_row;
 END IF;
 UPDATE public.study_sessions
 SET status='needs_review', ended_at=now(), duration_seconds=0,
   paused_at=NULL,
   break_seconds=break_seconds +
     CASE WHEN paused_at IS NOT NULL
       THEN greatest(0,extract(epoch FROM now()-paused_at)::integer)
       ELSE 0 END,
   review_reason='stale_session'
 WHERE id=v_row.id AND user_id=v_uid AND status='active';
 INSERT INTO public.study_sessions(user_id) VALUES(v_uid) RETURNING * INTO v_row;
 RETURN v_row;
END $fn$;
REVOKE ALL ON FUNCTION public.study_restart_stale_session() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.study_restart_stale_session() TO authenticated;

-- Keep completion authorization aligned with start/plan registration.
CREATE OR REPLACE FUNCTION public.study_finish_session()
RETURNS public.study_sessions
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $fn$
DECLARE
 v_uid uuid:=auth.uid();
 v_row public.study_sessions;
 v_elapsed interval;
 v_seconds integer;
BEGIN
 IF v_uid IS NULL OR NOT private.portal_study_write_allowed() THEN
  RAISE EXCEPTION 'STUDY_NOT_ELIGIBLE' USING ERRCODE='42501';
 END IF;
 PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_uid::text,221));
 SELECT * INTO v_row FROM public.study_sessions
  WHERE user_id=v_uid AND status='active' FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'STUDY_NO_ACTIVE_SESSION'; END IF;
 v_elapsed:=now()-v_row.started_at;
 v_seconds:=greatest(0,extract(epoch FROM coalesce(v_row.paused_at,now())-v_row.started_at)::integer-v_row.break_seconds);
 UPDATE public.study_sessions
 SET ended_at=now(),paused_at=NULL,
   break_seconds=v_row.break_seconds + CASE WHEN v_row.paused_at IS NOT NULL
       THEN greatest(0,extract(epoch FROM now()-v_row.paused_at)::integer) ELSE 0 END,
   duration_seconds=CASE WHEN v_elapsed<=interval '12 hours' THEN v_seconds ELSE 0 END,
   status=CASE WHEN v_elapsed<=interval '12 hours' THEN 'completed' ELSE 'needs_review' END,
   review_reason=CASE WHEN v_elapsed>interval '12 hours' THEN 'over_12_hours' ELSE NULL END
 WHERE id=v_row.id RETURNING * INTO v_row;
 RETURN v_row;
END $fn$;
REVOKE ALL ON FUNCTION public.study_finish_session() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.study_finish_session() TO authenticated;

CREATE TABLE IF NOT EXISTS private.study_client_errors (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 action text NOT NULL,
 code text NOT NULL,
 http_status integer,
 occurred_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE private.study_client_errors ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE private.study_client_errors FROM PUBLIC,anon,authenticated;
CREATE INDEX IF NOT EXISTS study_client_errors_recent
 ON private.study_client_errors(occurred_at DESC);
CREATE INDEX IF NOT EXISTS study_client_errors_user_recent
 ON private.study_client_errors(user_id,occurred_at DESC);

CREATE OR REPLACE FUNCTION public.study_report_client_error(
 p_action text,p_code text,p_http_status integer DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $fn$
DECLARE v_uid uuid:=auth.uid();
BEGIN
 IF v_uid IS NULL OR NOT private.portal_read_allowed() THEN RETURN false; END IF;
 IF p_action NOT IN ('load','start','restart','pause','resume','finish','auth') THEN RETURN false; END IF;
 IF (SELECT count(*) FROM private.study_client_errors
     WHERE user_id=v_uid AND occurred_at>now()-interval '1 hour') >=20
 THEN RETURN false; END IF;
 INSERT INTO private.study_client_errors(user_id,action,code,http_status)
 VALUES(v_uid,p_action,
   left(upper(regexp_replace(coalesce(p_code,'UNKNOWN'),'[^a-zA-Z0-9_-]','','g')),48),
   CASE WHEN p_http_status BETWEEN 100 AND 599 THEN p_http_status ELSE NULL END);
 RETURN true;
END $fn$;
REVOKE ALL ON FUNCTION public.study_report_client_error(text,text,integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.study_report_client_error(text,text,integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.study_admin_diagnostics(p_limit integer DEFAULT 40)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $fn$
BEGIN
 IF NOT public.portal_super_admin_allowed() THEN
  RAISE EXCEPTION 'STUDY_ADMIN_REQUIRED' USING ERRCODE='42501';
 END IF;
 RETURN jsonb_build_object(
  'stale',(
   SELECT coalesce(jsonb_agg(x.item),'[]'::jsonb) FROM (
    SELECT jsonb_build_object('id',s.id,'name',p.full_name,
      'started_at',s.started_at,'paused_at',s.paused_at,'review_reason',s.review_reason) AS item
    FROM public.study_sessions s JOIN public.profiles p ON p.user_id=s.user_id
    WHERE s.status='active' AND private.study_session_is_stale(s.started_at)
    ORDER BY s.started_at LIMIT 100
   ) x
  ),
  'reviews',(
   SELECT coalesce(jsonb_agg(x.item),'[]'::jsonb) FROM (
    SELECT jsonb_build_object('id',s.id,'name',p.full_name,
      'started_at',s.started_at,'ended_at',s.ended_at,
      'review_reason',s.review_reason,'review_outcome',s.review_outcome,
      'reviewed_at',s.reviewed_at,'review_note',s.review_note) AS item
    FROM public.study_sessions s JOIN public.profiles p ON p.user_id=s.user_id
    WHERE s.status='needs_review'
    ORDER BY (s.review_outcome IS NULL) DESC,s.started_at DESC LIMIT 100
   ) x
  ),
  'errors',(
   SELECT coalesce(jsonb_agg(x.item),'[]'::jsonb) FROM (
    SELECT jsonb_build_object('name',p.full_name,'action',e.action,'code',e.code,
      'http_status',e.http_status,'occurred_at',e.occurred_at) AS item
    FROM private.study_client_errors e LEFT JOIN public.profiles p ON p.user_id=e.user_id
    WHERE e.occurred_at>=now()-interval '14 days'
    ORDER BY e.occurred_at DESC LIMIT least(greatest(coalesce(p_limit,40),1),100)
   ) x
  )
 );
END $fn$;
REVOKE ALL ON FUNCTION public.study_admin_diagnostics(integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.study_admin_diagnostics(integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.study_admin_review_session(
 p_session_id uuid,p_decision text,p_minutes integer DEFAULT NULL,p_note text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $fn$
DECLARE v_row public.study_sessions;v_uid uuid:=auth.uid();
BEGIN
 IF NOT public.portal_super_admin_allowed() THEN
  RAISE EXCEPTION 'STUDY_ADMIN_REQUIRED' USING ERRCODE='42501';
 END IF;
 IF p_decision NOT IN ('accepted','rejected') THEN
  RAISE EXCEPTION 'STUDY_INVALID_DECISION';
 END IF;
 IF p_decision='accepted' AND (p_minutes IS NULL OR p_minutes<0 OR p_minutes>720) THEN
  RAISE EXCEPTION 'STUDY_INVALID_MINUTES';
 END IF;
 IF p_note IS NOT NULL AND char_length(p_note)>300 THEN
  RAISE EXCEPTION 'STUDY_NOTE_TOO_LONG';
 END IF;
 SELECT * INTO v_row FROM public.study_sessions
  WHERE id=p_session_id AND status='needs_review' AND review_outcome IS NULL FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'STUDY_REVIEW_NOT_PENDING'; END IF;
 UPDATE public.study_sessions
 SET status=CASE WHEN p_decision='accepted' THEN 'completed' ELSE 'needs_review' END,
   duration_seconds=CASE WHEN p_decision='accepted' THEN p_minutes*60 ELSE 0 END,
   review_outcome=p_decision,reviewed_at=now(),reviewed_by=v_uid,
   review_note=nullif(btrim(coalesce(p_note,'')),'')
 WHERE id=p_session_id;
 RETURN jsonb_build_object('ok',true,'id',p_session_id,'decision',p_decision);
END $fn$;
REVOKE ALL ON FUNCTION public.study_admin_review_session(uuid,text,integer,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.study_admin_review_session(uuid,text,integer,text) TO authenticated;
