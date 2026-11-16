-- Completion notices are queued *only* for NEW transitions to COMPLETED.
-- Historical completed Help Desk requests are not backfilled or emailed.
-- Mail credentials and recipient email addresses never reach browser clients.
CREATE TABLE IF NOT EXISTS public.help_completion_email_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.help_requests(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_title text NOT NULL,
  result_text text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','sending','sent','failed','skipped')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  attempted_at timestamptz,
  sent_at timestamptz,
  provider_message_id text,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (length(request_title) BETWEEN 1 AND 80),
  CHECK (length(result_text) BETWEEN 1 AND 3000)
);
COMMENT ON TABLE public.help_completion_email_deliveries IS
  'Service-role-only transactional outbox: one email per new completion transition; no historical backfill.';
ALTER TABLE public.help_completion_email_deliveries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.help_completion_email_deliveries FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.help_completion_email_deliveries TO service_role;
CREATE INDEX IF NOT EXISTS help_completion_email_request_recent
  ON public.help_completion_email_deliveries(request_id,created_at DESC,id DESC);
CREATE INDEX IF NOT EXISTS help_completion_email_pending
  ON public.help_completion_email_deliveries(status,created_at)
  WHERE status IN ('pending','failed','sending');

CREATE OR REPLACE FUNCTION private.queue_help_completion_email()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO ''
AS $fn$
BEGIN
  IF NEW.status = 'COMPLETED' AND OLD.status IS DISTINCT FROM NEW.status
     AND NEW.owner_id IS NOT NULL
  THEN
    IF btrim(NEW.admin_reply) = '' THEN
      RAISE EXCEPTION 'HELP_COMPLETION_REPLY_REQUIRED' USING ERRCODE = '23514';
    END IF;
    INSERT INTO public.help_completion_email_deliveries
      (request_id,recipient_id,request_title,result_text)
    VALUES
      (NEW.id, NEW.owner_id, NEW.title, NEW.admin_reply);
  END IF;
  RETURN NEW;
END;
$fn$;

REVOKE ALL ON FUNCTION private.queue_help_completion_email() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS help_queue_completion_email ON public.help_requests;
CREATE TRIGGER help_queue_completion_email
  AFTER UPDATE OF status ON public.help_requests
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'COMPLETED')
  EXECUTE FUNCTION private.queue_help_completion_email();
