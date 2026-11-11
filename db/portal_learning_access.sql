create or replace function public.portal_learning_access() returns jsonb language sql stable security invoker set search_path = '' as $$ select jsonb_build_object('read',private.portal_read_allowed(),'write',private.portal_write_allowed()) $$;
revoke all on function public.portal_learning_access() from public, anon;
grant execute on function public.portal_learning_access() to authenticated;
