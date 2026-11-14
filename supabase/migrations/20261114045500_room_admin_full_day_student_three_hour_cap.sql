-- Production database change applied through Supabase migration:
-- room_admin_full_day_booking_student_three_hour_limit
-- Keep the server-side authorization aligned with the portal UI.
-- Admin authorization is derived from the existing session-validated
-- portal_super_admin_allowed() function, never from a client-supplied role.

create or replace function private.room_validate_booking()
returns trigger
language plpgsql
set search_path to ''
as $function$
declare
  local_start timestamp;
  local_end timestamp;
begin
  if tg_op='INSERT' then
    if new.source='portal' then
      if new.owner_id is null or new.legacy_reservation_id is not null
          or new.legacy_student_no is not null or new.legacy_student_name is not null
          or new.status<>'ACTIVE' or new.cancelled_at is not null or new.cancelled_by is not null then
        raise exception 'INVALID_BOOKING_OWNER';
      end if;
      if new.starts_at <= now() then raise exception 'BOOKING_IN_PAST'; end if;
    end if;

    local_start:=new.starts_at at time zone 'Asia/Seoul';
    local_end:=new.ends_at at time zone 'Asia/Seoul';

    if local_start::date<>local_end::date
        or local_start::time < time '09:00'
        or local_end::time > time '22:00'
        or extract(minute from local_start)::int % 30<>0
        or extract(minute from local_end)::int % 30<>0
        or extract(second from local_start)<>0
        or extract(second from local_end)<>0 then
      raise exception 'INVALID_BOOKING_TIME';
    end if;

    if new.ends_at-new.starts_at > interval '3 hours'
       and (new.source <> 'portal' or not public.portal_super_admin_allowed()) then
      raise exception 'ROOM_DURATION_LIMIT_3H' using errcode='P0001';
    end if;
    return new;
  end if;

  if tg_op='UPDATE' then
    if old.status<>'ACTIVE' or new.status<>'CANCELLED' then raise exception 'INVALID_CANCELLATION'; end if;
    new.cancelled_at:=now();
    new.cancelled_by:=auth.uid();
    return new;
  end if;
  return new;
end
$function$;

alter policy room_enrolled_insert on public.room_reservations
to authenticated
with check (
  owner_id=(select auth.uid())
  and ((select private.portal_write_allowed()) or (select public.portal_super_admin_allowed()))
  and source='portal'
  and legacy_reservation_id is null
  and legacy_student_no is null
  and legacy_student_name is null
  and status='ACTIVE'
  and cancelled_at is null
  and cancelled_by is null
);
