-- Until the new request UI is adopted, old cached clients must not claim an academic
-- status was saved when no canonical status change has been approved.
create or replace function public.update_my_academic_status(p_status text,p_mobile_phone text)
returns public.profiles language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not private.portal_read_allowed() then raise exception 'PORTAL_SESSION_REQUIRED';end if;
 raise exception 'ACADEMIC_REQUEST_REQUIRED';
end $$;
