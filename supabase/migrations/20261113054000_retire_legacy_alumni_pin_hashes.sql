-- The Alumni Network now uses verified Supabase Auth sessions, not legacy edit PINs.
-- Remove unused authentication hashes from the active Supabase data store.
-- This does not delete alumni profiles, consent history, or login credentials.
update public.alumni_network_records
set data=data-'edit_pin_hash'-'edit_pin'-'auth_pin', updated_at=now()
where source_kind='alumni' and data ?| array['edit_pin_hash','edit_pin','auth_pin'];
update public.alumni_network_records
set data=data-'code_hash'-'new_pin'-'edit_pin_hash', updated_at=now()
where source_kind='pin_reset_requests' and data ?| array['code_hash','new_pin','edit_pin_hash'];
