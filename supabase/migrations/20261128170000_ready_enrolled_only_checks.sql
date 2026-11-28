-- Preserve historical records and read/disconnect access; allow only approved enrolled students to run READY checks.
create or replace function public.ready_access() returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object(
 'admin', public.portal_super_admin_allowed(),
 'read', private.portal_read_allowed() and exists(select 1 from public.profiles p where p.user_id=auth.uid() and p.signup_type='student' and p.enrollment_status in ('enrolled','leave','early_employment')),
 'write', private.portal_write_allowed() and exists(select 1 from public.profiles p where p.user_id=auth.uid() and p.signup_type='student' and p.approval_status='approved' and p.enrollment_status='enrolled'));
$$;
revoke all on function public.ready_access() from public,anon;
grant execute on function public.ready_access() to authenticated;

create or replace function public.ready_claim_check(p_user uuid,p_self boolean)
returns boolean language plpgsql security invoker set search_path='' as $$
begin
 update public.ready_profiles rp set check_lease_until=now()+interval '8 minutes',
 last_check_requested_at=case when p_self then now() else last_check_requested_at end
 where user_id=p_user and (check_lease_until is null or check_lease_until<now())
 and (not p_self or last_check_requested_at is null or last_check_requested_at<now()-interval '10 minutes')
 and exists(select 1 from public.profiles p where p.user_id=rp.user_id and p.approval_status='approved' and p.signup_type='student' and p.enrollment_status='enrolled');
 return found;
end $$;
revoke all on function public.ready_claim_check(uuid,boolean) from public,anon,authenticated;
grant execute on function public.ready_claim_check(uuid,boolean) to service_role;
